import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowUpDown,
  Download,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  Trash2,
  Upload,
} from 'lucide-react';
import type { TranslationDictionary } from '../i18n/translations';
import type { IdCardSlot } from '../types';
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  NATIONAL_ID_FILENAME,
  computeDualCardA4Layout,
  renderProcessedCardCanvas,
} from '../utils/idMergerMath';

interface IdMergerTabProps {
  t: TranslationDictionary;
  frontCard: IdCardSlot | null;
  backCard: IdCardSlot | null;
  enhanceEnabled: boolean;
  onSetFrontCard: (card: IdCardSlot | null) => void;
  onSetBackCard: (card: IdCardSlot | null) => void;
  onSwapCards: () => void;
  onToggleEnhance: (enabled: boolean) => Promise<void>;
  onGeneratePdf: () => void;
}

export const IdMergerTab: React.FC<IdMergerTabProps> = ({
  t,
  frontCard,
  backCard,
  enhanceEnabled,
  onSetFrontCard,
  onSetBackCard,
  onSwapCards,
  onToggleEnhance,
  onGeneratePdf,
}) => {
  const [processingSlot, setProcessingSlot] = useState<'front' | 'back' | null>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const a4Layout = useMemo(() => {
    if (!frontCard || !backCard) return null;
    return computeDualCardA4Layout(
      { width: frontCard.width, height: frontCard.height },
      { width: backCard.width, height: backCard.height }
    );
  }, [frontCard, backCard]);

  const handleFileSelected = async (slot: 'front' | 'back', file: File | undefined) => {
    if (!file) return;
    setProcessingSlot(slot);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      });

      const processed = await renderProcessedCardCanvas(dataUrl, 0, enhanceEnabled);
      const nextSlot: IdCardSlot = {
        dataUrl: processed.dataUrl,
        originalDataUrl: dataUrl,
        rotation: 0,
        width: processed.width,
        height: processed.height,
        fileName: file.name,
      };
      if (slot === 'front') onSetFrontCard(nextSlot);
      else onSetBackCard(nextSlot);
    } finally {
      setProcessingSlot(null);
    }
  };

  const handleRotate = async (slot: 'front' | 'back', delta: 90 | -90) => {
    const card = slot === 'front' ? frontCard : backCard;
    if (!card) return;
    setProcessingSlot(slot);
    try {
      const nextRotation = ((((card.rotation + delta) % 360) + 360) % 360) as 0 | 90 | 180 | 270;
      const processed = await renderProcessedCardCanvas(
        card.originalDataUrl,
        nextRotation,
        enhanceEnabled
      );
      const updated: IdCardSlot = {
        ...card,
        rotation: nextRotation,
        dataUrl: processed.dataUrl,
        width: processed.width,
        height: processed.height,
      };
      if (slot === 'front') onSetFrontCard(updated);
      else onSetBackCard(updated);
    } finally {
      setProcessingSlot(null);
    }
  };

  const renderUploadSlot = (
    slot: 'front' | 'back',
    label: string,
    card: IdCardSlot | null,
    fileInputRef: React.RefObject<HTMLInputElement | null>,
    onClear: () => void
  ) => {
    const isBusy = processingSlot === slot;
    return (
      <section
        className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-4"
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          const droppedFile = e.dataTransfer.files?.[0];
          if (droppedFile) void handleFileSelected(slot, droppedFile);
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#0F172A]">{label}</h2>
          {card && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t.idMerger.clearSlot}</span>
            </button>
          )}
        </div>

        {/* File / Gallery picker only — zero camera permissions requested */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          aria-label={label}
          className="hidden"
          onChange={(e) => {
            void handleFileSelected(slot, e.target.files?.[0]);
            e.target.value = '';
          }}
        />

        {card ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 flex items-center justify-center min-h-[190px]">
              <img
                src={card.dataUrl}
                alt={label}
                className="max-h-52 w-auto object-contain rounded"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-tabular">
                {t.idMerger.dimensionsLabel}: {card.width}×{card.height}px · {card.rotation}°
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleRotate(slot, -90)}
                  aria-label={`${t.idMerger.rotateCcw} (${label})`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 disabled:opacity-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>90° CCW</span>
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleRotate(slot, 90)}
                  aria-label={`${t.idMerger.rotateCw} (${label})`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 disabled:opacity-50"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>90° CW</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-[#F8FAFC] p-7 text-center space-y-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1E40AF] transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{t.idMerger.uploadPrompt}</span>
            </button>
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
            {t.idMerger.heading}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{t.idMerger.subheading}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            disabled={!frontCard && !backCard}
            onClick={onSwapCards}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-[#1E3A8A]" />
            <span>{t.idMerger.swapCards}</span>
          </button>
          <button
            type="button"
            disabled={!frontCard || !backCard}
            onClick={onGeneratePdf}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E40AF] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t.idMerger.generatePdf}</span>
          </button>
        </div>
      </div>

      {/* Enhancement Control Bar */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <SlidersHorizontal className="h-4 w-4 text-[#1E3A8A] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">{t.idMerger.enhanceToggle}</p>
            <p className="text-xs text-slate-500">{t.idMerger.enhanceDescription}</p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enhanceEnabled}
          aria-label={t.idMerger.enhanceToggle}
          onClick={() => void onToggleEnhance(!enhanceEnabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] ${
            enhanceEnabled ? 'bg-[#1E3A8A]' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              enhanceEnabled ? 'ltr:translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-6 space-y-5">
          {renderUploadSlot(
            'front',
            t.idMerger.frontSlot,
            frontCard,
            frontInputRef,
            () => onSetFrontCard(null)
          )}
          {renderUploadSlot(
            'back',
            t.idMerger.backSlot,
            backCard,
            backInputRef,
            () => onSetBackCard(null)
          )}
        </div>

        <div className="xl:col-span-6 space-y-3">
          <div className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#0F172A]">
              {t.idMerger.a4PreviewTitle}
            </span>
            <span className="text-xs text-slate-500 font-tabular">{NATIONAL_ID_FILENAME}</span>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-slate-100 p-4 sm:p-6">
            <div
              data-testid="id-a4-preview"
              className="relative mx-auto w-full max-w-[460px] aspect-[210/297] bg-white border border-slate-200 shadow-sm overflow-hidden"
            >
              {a4Layout && frontCard && backCard ? (
                <>
                  <img
                    src={frontCard.dataUrl}
                    alt="Front National ID on A4"
                    style={{
                      position: 'absolute',
                      left: `${(a4Layout.frontBox.x / A4_WIDTH_MM) * 100}%`,
                      top: `${(a4Layout.frontBox.y / A4_HEIGHT_MM) * 100}%`,
                      width: `${(a4Layout.frontBox.width / A4_WIDTH_MM) * 100}%`,
                      height: `${(a4Layout.frontBox.height / A4_HEIGHT_MM) * 100}%`,
                    }}
                    className="object-contain"
                  />
                  <img
                    src={backCard.dataUrl}
                    alt="Back National ID on A4"
                    style={{
                      position: 'absolute',
                      left: `${(a4Layout.backBox.x / A4_WIDTH_MM) * 100}%`,
                      top: `${(a4Layout.backBox.y / A4_HEIGHT_MM) * 100}%`,
                      width: `${(a4Layout.backBox.width / A4_WIDTH_MM) * 100}%`,
                      height: `${(a4Layout.backBox.height / A4_HEIGHT_MM) * 100}%`,
                    }}
                    className="object-contain"
                  />
                </>
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <p className="text-sm text-slate-400 max-w-xs">{t.idMerger.emptyPreview}</p>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center">{t.idMerger.zeroTextNote}</p>
        </div>
      </div>
    </div>
  );
};
