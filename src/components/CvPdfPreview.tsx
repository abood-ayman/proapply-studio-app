import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Maximize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { TranslationDictionary } from '../i18n/translations';
import type { CvProfile } from '../types';
import { buildCvFilename, calculateCvScaleMetrics } from '../utils/cvLayout';
import {
  A4_PT_HEIGHT,
  A4_PT_WIDTH,
  MAX_PREVIEW_ZOOM,
  MIN_PREVIEW_ZOOM,
  PREVIEW_ZOOM_STEP,
  clampPreviewZoom,
  computePdfCanvasRenderSize,
} from '../utils/cvPdfPreviewMath';
import { generateCvPdfDocument } from '../utils/pdfGenerators';

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions.workerSrc !== pdfjsWorkerUrl) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;
}

interface CvPdfPreviewProps {
  profile: CvProfile;
  t: TranslationDictionary;
}

type RenderStatus = 'rendering' | 'ready' | 'error';

export const CvPdfPreview: React.FC<CvPdfPreviewProps> = ({ profile, t }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasRenderedOnceRef = useRef(false);
  const firstDebounceRef = useRef(true);

  const [containerWidth, setContainerWidth] = useState(640);
  const [zoom, setZoom] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [status, setStatus] = useState<RenderStatus>('rendering');
  const [hasPaintedCanvas, setHasPaintedCanvas] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);

  const scaleMetrics = useMemo(() => calculateCvScaleMetrics(profile), [profile]);
  const pdfFilename = useMemo(() => buildCvFilename(profile.fullName), [profile.fullName]);

  // Observe available preview frame width for responsive Fit-to-Width A4 sizing
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const updateWidth = () => {
      const rect = el.getBoundingClientRect();
      // Account for inner padding (24px–40px)
      const inner = Math.max(240, Math.floor(rect.width - 24));
      setContainerWidth((prev) => (Math.abs(prev - inner) >= 2 ? inner : prev));
    };

    updateWidth();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Compile actual jsPDF binary bytes in real time (immediate on mount, 120ms debounced while typing)
  useEffect(() => {
    let cancelled = false;
    const delay = firstDebounceRef.current ? 0 : 120;
    firstDebounceRef.current = false;

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      try {
        const { doc } = generateCvPdfDocument(profile);
        const buffer = doc.output('arraybuffer');
        if (!cancelled) {
          setPdfBytes(new Uint8Array(buffer));
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
        }
      }
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [profile, retryNonce]);

  // Rasterize page 1 of the compiled PDF via pdf.js onto an offscreen canvas, then swap atomically
  useEffect(() => {
    if (!pdfBytes) return;

    let cancelled = false;
    let loadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;
    let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;
    let renderTask: pdfjsLib.RenderTask | null = null;

    setStatus('rendering');

    const renderPdfPage = async () => {
      try {
        // Clone buffer so pdf.js worker transfer never detaches our cached bytes
        loadingTask = pdfjsLib.getDocument({ data: pdfBytes.slice() });
        pdfDoc = await loadingTask.promise;
        if (cancelled) return;

        setPageCount(pdfDoc.numPages);
        const page = await pdfDoc.getPage(1);
        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
        const size = computePdfCanvasRenderSize(
          baseViewport.width || A4_PT_WIDTH,
          baseViewport.height || A4_PT_HEIGHT,
          Math.min(containerWidth, 760),
          zoom,
          dpr
        );

        const renderViewport = page.getViewport({ scale: size.viewportScale });
        const offscreen = document.createElement('canvas');
        offscreen.width = size.pixelWidth;
        offscreen.height = size.pixelHeight;
        const offCtx = offscreen.getContext('2d');
        if (!offCtx) {
          throw new Error('Could not acquire 2D canvas context');
        }

        offCtx.fillStyle = '#FFFFFF';
        offCtx.fillRect(0, 0, offscreen.width, offscreen.height);

        renderTask = page.render({
          canvasContext: offCtx,
          viewport: renderViewport,
          canvas: offscreen,
        });
        await renderTask.promise;
        if (cancelled) return;

        const targetCanvas = canvasRef.current;
        if (targetCanvas) {
          targetCanvas.width = offscreen.width;
          targetCanvas.height = offscreen.height;
          targetCanvas.style.width = `${size.cssWidth}px`;
          targetCanvas.style.height = `${size.cssHeight}px`;

          const targetCtx = targetCanvas.getContext('2d');
          if (targetCtx) {
            targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
            targetCtx.drawImage(offscreen, 0, 0);
          }
        }

        hasRenderedOnceRef.current = true;
        setHasPaintedCanvas(true);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        const name = err instanceof Error ? err.name : '';
        if (name === 'RenderingCancelledException') return;
        setStatus('error');
      } finally {
        if (pdfDoc) {
          void pdfDoc.cleanup();
        }
        if (loadingTask) {
          void loadingTask.destroy();
        }
      }
    };

    void renderPdfPage();

    return () => {
      cancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {
          // ignore cancellation errors
        }
      }
      if (loadingTask) {
        void loadingTask.destroy();
      }
    };
  }, [pdfBytes, containerWidth, zoom]);

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      className="xl:col-span-7 space-y-3"
      data-testid="cv-pdf-preview"
      data-render-status={status}
      data-page-count={pageCount}
    >
      {/* Top Preview Metadata & Zoom Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
          {status === 'error' ? (
            <AlertCircle className="h-4 w-4 text-[#DC2626] shrink-0" />
          ) : status === 'rendering' && !hasRenderedOnceRef.current ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#1E3A8A] shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" />
          )}
          <span className="font-semibold text-[#0F172A]">{t.cv.previewTitle}</span>
          <span aria-hidden="true">·</span>
          <span className="font-tabular">
            {t.cv.pageWord} 1 {t.cv.ofWord} {pageCount}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-tabular text-slate-500">
            {t.cv.densityLabel}: {scaleMetrics.densityTier} ({scaleMetrics.estimatedUsedHeightMm} / 297 mm)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {status === 'rendering' && hasRenderedOnceRef.current && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 me-1">
              <Loader2 className="h-3 w-3 animate-spin text-[#1E3A8A]" />
              <span className="hidden sm:inline">{t.cv.renderingPdf}</span>
            </span>
          )}
          <div className="inline-flex items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-0.5">
            <button
              type="button"
              aria-label={t.cv.zoomOut}
              disabled={zoom <= MIN_PREVIEW_ZOOM}
              onClick={() => setZoom((z) => clampPreviewZoom(z - PREVIEW_ZOOM_STEP))}
              className="rounded-md p-1.5 text-slate-700 hover:bg-white disabled:opacity-40 transition-colors"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label={t.cv.zoomFit}
              onClick={() => setZoom(1)}
              className="px-2 py-1 text-[11px] font-semibold text-[#0F172A] hover:bg-white rounded-md font-tabular transition-colors inline-flex items-center gap-1"
            >
              <Maximize2 className="h-3 w-3 text-[#1E3A8A]" />
              <span>{zoom === 1 ? t.cv.zoomFit : `${zoomPercent}%`}</span>
            </button>
            <button
              type="button"
              aria-label={t.cv.zoomIn}
              disabled={zoom >= MAX_PREVIEW_ZOOM}
              onClick={() => setZoom((z) => clampPreviewZoom(z + PREVIEW_ZOOM_STEP))}
              className="rounded-md p-1.5 text-slate-700 hover:bg-white disabled:opacity-40 transition-colors"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time A4 PDF Canvas Stage */}
      <div
        ref={stageRef}
        className="rounded-xl border border-[#E2E8F0] bg-slate-100 p-3 sm:p-5 overflow-auto"
      >
        {status === 'error' ? (
          <div className="mx-auto w-full max-w-[760px] aspect-[210/297] bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center p-8 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-[#DC2626]" />
            <p className="text-sm font-semibold text-[#0F172A]">{t.cv.renderError}</p>
            <button
              type="button"
              onClick={() => setRetryNonce((n) => n + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#1E3A8A]" />
              <span>{t.cv.retryRender}</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-center min-w-fit">
            <div className="relative bg-white border border-slate-200 shadow-sm">
              {!hasPaintedCanvas && (
                <div
                  className="w-full max-w-[760px] aspect-[210/297] flex items-center justify-center bg-white"
                  style={{ width: `${Math.min(containerWidth, 760)}px` }}
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin text-[#1E3A8A]" />
                    <span>{t.cv.renderingPdf}</span>
                  </div>
                </div>
              )}
              <canvas
                ref={canvasRef}
                data-testid="cv-pdf-canvas"
                aria-label={`${t.cv.previewTitle} — ${pdfFilename}`}
                className={hasPaintedCanvas ? 'block bg-white' : 'hidden'}
              />
            </div>
          </div>
        )}
      </div>

      <p dir="ltr" className="text-xs text-slate-500 text-center font-tabular">
        {pdfFilename} · A4 (210 × 297 mm)
      </p>
    </div>
  );
};
