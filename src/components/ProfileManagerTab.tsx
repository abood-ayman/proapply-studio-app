import React, { useRef } from 'react';
import {
  Archive,
  CreditCard,
  Database,
  Download,
  Eraser,
  FileImage,
  FileText,
  Laptop,
  Smartphone,
  Upload,
} from 'lucide-react';
import type { TranslationDictionary } from '../i18n/translations';
import type { CertificateDocItem, CvProfile, IdCardSlot, TabId } from '../types';
import { buildCvFilename } from '../utils/cvLayout';
import { PWAInstallButton } from './PWAInstallButton';

interface ProfileManagerTabProps {
  t: TranslationDictionary;
  profile: CvProfile;
  frontCard: IdCardSlot | null;
  backCard: IdCardSlot | null;
  certItems: CertificateDocItem[];
  onLoadSample: () => void;
  onClearBlank: () => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => Promise<void>;
  onDownloadCv: () => void;
  onDownloadId: () => void;
  onDownloadCerts: () => void;
  onDownloadBundle: () => Promise<void>;
  onNavigateTab: (tab: TabId) => void;
}

export const ProfileManagerTab: React.FC<ProfileManagerTabProps> = ({
  t,
  profile,
  frontCard,
  backCard,
  certItems,
  onLoadSample,
  onClearBlank,
  onExportBackup,
  onImportBackup,
  onDownloadCv,
  onDownloadId,
  onDownloadCerts,
  onDownloadBundle,
  onNavigateTab,
}) => {
  const importInputRef = useRef<HTMLInputElement>(null);
  const idReady = Boolean(frontCard && backCard);
  const certsReady = certItems.length > 0;
  const isBlank = !profile.fullName.trim() && profile.experiences.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
          {t.profileManager.heading}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{t.profileManager.subheading}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Profile Data & JSON Backup Controls */}
        <section className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">
              {t.profileManager.profileStatusTitle}
            </h2>
            <p className="mt-1 text-sm font-medium text-[#1E3A8A]">
              {profile.fullName || '—'}
              {profile.targetRole ? ` · ${profile.targetRole}` : ''}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {isBlank ? t.profileManager.emptyProfileStatus : t.profileManager.activeProfileStatus}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1E40AF] transition-colors"
            >
              <Database className="h-3.5 w-3.5" />
              <span>{t.profileManager.loadSampleBtn}</span>
            </button>
            <button
              type="button"
              onClick={onClearBlank}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <Eraser className="h-3.5 w-3.5" />
              <span>{t.profileManager.clearBlankBtn}</span>
            </button>
            <button
              type="button"
              onClick={onExportBackup}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-[#1E3A8A]" />
              <span>{t.profileManager.exportJsonBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors"
            >
              <Upload className="h-3.5 w-3.5 text-[#1E3A8A]" />
              <span>{t.profileManager.importJsonBtn}</span>
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onImportBackup(file);
                e.target.value = '';
              }}
            />
          </div>
        </section>

        {/* 2. Quick Document Exports */}
        <section className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-4">
          <h2 className="text-base font-bold text-[#0F172A]">
            {t.profileManager.quickExportsTitle}
          </h2>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={onDownloadCv}
              className="flex w-full flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs font-semibold text-[#0F172A] hover:bg-slate-100 transition-colors text-start"
            >
              <span className="flex items-center gap-2.5 min-w-0 max-w-full">
                <FileText className="h-4 w-4 text-[#1E3A8A] shrink-0" />
                <span>{t.profileManager.downloadCv}</span>
              </span>
              <span
                dir="ltr"
                className="text-[11px] text-slate-500 font-tabular max-w-full truncate sm:shrink-0"
              >
                {buildCvFilename(profile.fullName)}
              </span>
            </button>

            {idReady ? (
              <button
                type="button"
                onClick={onDownloadId}
                className="flex w-full flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs font-semibold text-[#0F172A] hover:bg-slate-100 transition-colors text-start"
              >
                <span className="flex items-center gap-2.5 min-w-0 max-w-full">
                  <CreditCard className="h-4 w-4 text-[#1E3A8A] shrink-0" />
                  <span>{t.profileManager.downloadId}</span>
                </span>
                <span
                  dir="ltr"
                  className="text-[11px] text-slate-500 font-tabular max-w-full truncate sm:shrink-0"
                >
                  National_ID_Merged.pdf
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigateTab('id-merger')}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors text-start"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <CreditCard className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{t.profileManager.goToIdMerger}</span>
                </span>
              </button>
            )}

            {certsReady ? (
              <button
                type="button"
                onClick={onDownloadCerts}
                className="flex w-full flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs font-semibold text-[#0F172A] hover:bg-slate-100 transition-colors text-start"
              >
                <span className="flex items-center gap-2.5 min-w-0 max-w-full">
                  <FileImage className="h-4 w-4 text-[#1E3A8A] shrink-0" />
                  <span>{t.profileManager.downloadCerts}</span>
                </span>
                <span
                  dir="ltr"
                  className="text-[11px] text-slate-500 font-tabular max-w-full truncate sm:shrink-0"
                >
                  Certificates_Portfolio.pdf
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigateTab('cert-bundle')}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors text-start"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <FileImage className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{t.profileManager.goToCertBundle}</span>
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => void onDownloadBundle()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1E40AF] transition-colors"
            >
              <Archive className="h-4 w-4" />
              <span>{t.profileManager.downloadBundle}</span>
            </button>
          </div>
        </section>
      </div>

      {/* 3. PWA Installation Instructions (Android, iOS, Desktop) */}
      <section className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">{t.profileManager.pwaTitle}</h2>
            <p className="mt-1 text-xs text-slate-600">{t.profileManager.pwaSubtitle}</p>
          </div>
          <PWAInstallButton t={t} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
              <Smartphone className="h-4 w-4 text-[#1E3A8A]" />
              <span>{t.profileManager.androidTitle}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{t.profileManager.androidSteps}</p>
          </div>
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
              <Smartphone className="h-4 w-4 text-[#1E3A8A]" />
              <span>{t.profileManager.iosTitle}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{t.profileManager.iosSteps}</p>
          </div>
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
              <Laptop className="h-4 w-4 text-[#1E3A8A]" />
              <span>{t.profileManager.desktopTitle}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{t.profileManager.desktopSteps}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
