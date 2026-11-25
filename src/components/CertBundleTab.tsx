import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Download,
  FileImage,
  RotateCcw,
  RotateCw,
  Trash2,
  Upload,
} from 'lucide-react';
import type { TranslationDictionary } from '../i18n/translations';
import type { CertificateDocItem, ItemsPerPageOption } from '../types';
import {
  CERTIFICATES_PDF_FILENAME,
  computeCertificatePagesLayout,
} from '../utils/certBundleMath';
import { A4_HEIGHT_MM, A4_WIDTH_MM, renderProcessedCardCanvas } from '../utils/idMergerMath';

interface CertBundleTabProps {
  t: TranslationDictionary;
  items: CertificateDocItem[];
  itemsPerPage: ItemsPerPageOption;
  onChangeItems: (next: CertificateDocItem[]) => void;
  onChangeItemsPerPage: (next: ItemsPerPageOption) => void;
  onExportPdf: () => void;
}

export const CertBundleTab: React.FC<CertBundleTabProps> = ({
  t,
  items,
  itemsPerPage,
  onChangeItems,
  onChangeItemsPerPage,
  onExportPdf,
}) => {
  const [busyId, setBusyId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pages = useMemo(
    () => computeCertificatePagesLayout(items, itemsPerPage),
    [items, itemsPerPage]
  );

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const added: CertificateDocItem[] = [];

    for (const file of files) {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(file);
      });
      const processed = await renderProcessedCardCanvas(dataUrl, 0, false);
      added.push({
        id: `cert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        fileName: file.name,
        dataUrl: processed.dataUrl,
        originalDataUrl: dataUrl,
        rotation: 0,
        width: processed.width,
        height: processed.height,
      });
    }

    onChangeItems([...items, ...added]);
  };

  const handleRotate = async (id: string, delta: 90 | -90) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    setBusyId(id);
    try {
      const nextRot = ((((target.rotation + delta) % 360) + 360) % 360) as 0 | 90 | 180 | 270;
      const processed = await renderProcessedCardCanvas(target.originalDataUrl, nextRot, false);
      onChangeItems(
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                rotation: nextRot,
                dataUrl: processed.dataUrl,
                width: processed.width,
                height: processed.height,
              }
            : item
        )
      );
    } finally {
      setBusyId(null);
    }
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const copy = [...items];
    const [removed] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, removed);
    onChangeItems(copy);
  };

  const removeItem = (id: string) => {
    onChangeItems(items.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
            {t.certBundle.heading}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{t.certBundle.subheading}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => onChangeItems([])}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t.certBundle.clearAll}</span>
            </button>
          )}
          <button
            type="button"
            disabled={items.length === 0}
            onClick={onExportPdf}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E40AF] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t.certBundle.exportPdf}</span>
          </button>
        </div>
      </div>

      {/* Upload & Items-Per-Page Toolbar */}
      <section
        className="rounded-xl border border-[#E2E8F0] bg-white p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleFilesSelected(e.dataTransfer.files);
        }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            aria-label={t.certBundle.uploadButton}
            className="hidden"
            onChange={(e) => {
              void handleFilesSelected(e.target.files);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1E40AF] transition-colors whitespace-nowrap shrink-0"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>{t.certBundle.uploadButton}</span>
          </button>
          <span className="text-xs text-slate-500">{t.certBundle.uploadHint}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-[#0F172A]">{t.certBundle.layoutLabel}:</span>
          <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            {([1, 2, 4] as ItemsPerPageOption[]).map((count) => {
              const label =
                count === 1
                  ? t.certBundle.perPage1
                  : count === 2
                  ? t.certBundle.perPage2
                  : t.certBundle.perPage4;
              const active = itemsPerPage === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => onChangeItemsPerPage(count)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-white text-[#0F172A] shadow-sm'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {items.length === 0 ? (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-[#1E3A8A]">
            <FileImage className="h-6 w-6" />
          </div>
          <h2 className="text-base font-semibold text-[#0F172A]">{t.certBundle.emptyTitle}</h2>
          <p className="mx-auto max-w-md text-sm text-slate-500">{t.certBundle.emptySubtitle}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left: Uploaded Items Queue with Individual Rotation & Ordering */}
          <div className="xl:col-span-6 space-y-3">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="rounded-xl border border-[#E2E8F0] bg-white p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="h-24 w-28 shrink-0 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center overflow-hidden p-1.5">
                  <img
                    src={item.dataUrl}
                    alt={item.fileName}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#0F172A] truncate font-tabular">
                      {idx + 1}. {item.fileName}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`${t.certBundle.remove} ${item.fileName}`}
                      className="text-xs font-medium text-red-600 hover:text-red-700 shrink-0"
                    >
                      {t.certBundle.remove}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 font-tabular">
                    {item.width}×{item.height}px · {item.rotation}°
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void handleRotate(item.id, -90)}
                      aria-label={`${t.certBundle.rotateCcw} ${item.fileName}`}
                      className="inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>{t.certBundle.rotateCcw}</span>
                    </button>
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void handleRotate(item.id, 90)}
                      aria-label={`${t.certBundle.rotateCw} ${item.fileName}`}
                      className="inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
                    >
                      <RotateCw className="h-3 w-3" />
                      <span>{t.certBundle.rotateCw}</span>
                    </button>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, -1)}
                      aria-label={`${t.certBundle.moveUp} ${item.fileName}`}
                      className="inline-flex items-center rounded-md border border-[#E2E8F0] bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() => moveItem(idx, 1)}
                      aria-label={`${t.certBundle.moveDown} ${item.fileName}`}
                      className="inline-flex items-center rounded-md border border-[#E2E8F0] bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Live A4 Multi-Page Preview */}
          <div className="xl:col-span-6 space-y-3">
            <div className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#0F172A]">
                {t.certBundle.pagePreviewTitle}
              </span>
              <span className="text-xs text-slate-500 font-tabular">
                {t.certBundle.pageCountLabel}: {pages.length} · {CERTIFICATES_PDF_FILENAME}
              </span>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-slate-100 p-4 space-y-4 max-h-[680px] overflow-y-auto">
              {pages.map((page) => (
                <div
                  key={page.pageNumber}
                  className="relative mx-auto w-full max-w-[420px] aspect-[210/297] bg-white border border-slate-200 shadow-sm overflow-hidden"
                >
                  {page.placements.map((placement) => (
                    <img
                      key={placement.item.id}
                      src={placement.item.dataUrl}
                      alt={placement.item.fileName}
                      style={{
                        position: 'absolute',
                        left: `${(placement.box.x / A4_WIDTH_MM) * 100}%`,
                        top: `${(placement.box.y / A4_HEIGHT_MM) * 100}%`,
                        width: `${(placement.box.width / A4_WIDTH_MM) * 100}%`,
                        height: `${(placement.box.height / A4_HEIGHT_MM) * 100}%`,
                      }}
                      className="object-contain"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
