import React, { useCallback, useEffect, useState } from 'react';
import {
  CreditCard,
  FileImage,
  FileSearch,
  FileText,
  Globe,
  UserCheck,
  WifiOff,
} from 'lucide-react';
import { CertBundleTab } from './components/CertBundleTab';
import { CoverAndAuditTab } from './components/CoverAndAuditTab';
import { CvBuilderTab } from './components/CvBuilderTab';
import { IdMergerTab } from './components/IdMergerTab';
import { PWAInstallButton } from './components/PWAInstallButton';
import { PrivacyNotice } from './components/PrivacyNotice';
import { ProfileManagerTab } from './components/ProfileManagerTab';
import { ToastContainer } from './components/ToastContainer';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { TRANSLATIONS } from './i18n/translations';
import type {
  AppLanguage,
  AuditReport,
  CertificateDocItem,
  CoverLetterResult,
  CvProfile,
  IdCardSlot,
  ItemsPerPageOption,
  TabId,
  ToastMessage,
} from './types';
import {
  DEFAULT_PROFILE,
  EMPTY_PROFILE,
  PROFILE_STORAGE_KEY,
  cloneProfile,
  loadSavedProfile,
  mergeProfile,
  applyTailoredProfile,
} from './utils/cvLayout';
import { buildTemplateCoverLetter, isProfileEmpty } from './utils/coverLetterBuilder';
import { buildAuditReport } from './utils/formAuditParser';
import { auditFormOffline } from './utils/offlineFormAudit';
import { renderProcessedCardCanvas } from './utils/idMergerMath';
import {
  generateApplicationBundleZip,
  generateCertificatesPortfolioPdf,
  generateCoverLetterPdf,
  generateCvPdfDocument,
  generateNationalIdPdfDocument,
} from './utils/pdfGenerators';

const LANG_STORAGE_KEY = 'proapply_lang_v1';

export default function App() {
  const [lang, setLang] = useState<AppLanguage>(() => {
    if (typeof window === 'undefined') return 'en';
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    return saved === 'ar' ? 'ar' : 'en';
  });
  const [activeTab, setActiveTab] = useState<TabId>('cv-builder');
  const [profile, setProfile] = useState<CvProfile>(() => loadSavedProfile());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // CV AI state
  const [isTailoring, setIsTailoring] = useState(false);

  // National ID Merger state
  const [frontCard, setFrontCard] = useState<IdCardSlot | null>(null);
  const [backCard, setBackCard] = useState<IdCardSlot | null>(null);
  const [enhanceEnabled, setEnhanceEnabled] = useState(true);

  // Certificates Bundle state
  const [certItems, setCertItems] = useState<CertificateDocItem[]>([]);
  const [certsPerPage, setCertsPerPage] = useState<ItemsPerPageOption>(2);

  // Cover Letter & Form Audit state
  const [coverLetter, setCoverLetter] = useState<CoverLetterResult | null>(null);
  const [isDraftingLetter, setIsDraftingLetter] = useState(false);
  const [letterError, setLetterError] = useState<string | null>(null);

  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  const isOnline = useOnlineStatus();
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, [lang]);

  // Auto-save profile changes to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage quota errors
    }
  }, [profile]);

  const addToast = useCallback((text: string, type: ToastMessage['type'] = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3600);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleLoadSample = () => {
    const sample = cloneProfile(DEFAULT_PROFILE);
    setProfile(sample);
    addToast(t.toasts.sampleLoaded, 'info');
  };

  const handleClearBlank = () => {
    const blank = cloneProfile(EMPTY_PROFILE);
    setProfile(blank);
    addToast(t.toasts.profileCleared, 'info');
  };

  const handleTailorWithAi = async (jobAd: string) => {
    if (!jobAd.trim()) {
      addToast(t.toasts.missingJobAd, 'error');
      return;
    }
    setIsTailoring(true);
    try {
      const response = await fetch('/api/ai/tailor-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobAd, profile }),
      });
      const data = (await response.json()) as {
        tailored?: Partial<CvProfile>;
        error?: string;
      };
      if (!response.ok || !data.tailored) {
        throw new Error(data.error || 'Failed to tailor CV with AI.');
      }
      const nextProfile = applyTailoredProfile(profile, data.tailored);
      setProfile(nextProfile);
      addToast(t.toasts.cvTailored, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI tailoring request failed.';
      addToast(msg, 'error');
    } finally {
      setIsTailoring(false);
    }
  };

  const handleDownloadCvPdf = () => {
    const { doc, filename } = generateCvPdfDocument(profile);
    doc.save(filename);
    addToast(t.toasts.cvPdfGenerated, 'success');
  };

  const handleSwapCards = () => {
    setFrontCard(backCard);
    setBackCard(frontCard);
    addToast(t.toasts.cardsSwapped, 'info');
  };

  const handleToggleEnhance = async (enabled: boolean) => {
    setEnhanceEnabled(enabled);
    if (frontCard) {
      const reprocessedFront = await renderProcessedCardCanvas(
        frontCard.originalDataUrl,
        frontCard.rotation,
        enabled
      );
      setFrontCard({
        ...frontCard,
        dataUrl: reprocessedFront.dataUrl,
        width: reprocessedFront.width,
        height: reprocessedFront.height,
      });
    }
    if (backCard) {
      const reprocessedBack = await renderProcessedCardCanvas(
        backCard.originalDataUrl,
        backCard.rotation,
        enabled
      );
      setBackCard({
        ...backCard,
        dataUrl: reprocessedBack.dataUrl,
        width: reprocessedBack.width,
        height: reprocessedBack.height,
      });
    }
  };

  const handleDownloadIdPdf = () => {
    if (!frontCard || !backCard) {
      addToast(t.toasts.missingIdCards, 'error');
      return;
    }
    const { doc, filename } = generateNationalIdPdfDocument(frontCard, backCard);
    doc.save(filename);
    addToast(t.toasts.idPdfGenerated, 'success');
  };

  const handleDownloadCertsPdf = () => {
    if (certItems.length === 0) {
      addToast(t.toasts.missingCerts, 'error');
      return;
    }
    const { doc, filename } = generateCertificatesPortfolioPdf(certItems, certsPerPage);
    doc.save(filename);
    addToast(t.toasts.certsPdfGenerated, 'success');
  };

  const handleGenerateCoverLetter = async (jobAd: string, companyName: string) => {
    if (!jobAd.trim()) {
      addToast(t.toasts.missingJobAd, 'error');
      return;
    }
    setLetterError(null);
    setIsDraftingLetter(true);
    try {
      const response = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobAd, companyName, profile }),
      });
      const data = (await response.json()) as {
        coverLetter?: { subjectLine: string; letterBody: string };
        error?: string;
      };
      if (!response.ok || !data.coverLetter) {
        throw new Error(data.error || 'Failed to generate cover letter.');
      }
      setCoverLetter({
        subjectLine: data.coverLetter.subjectLine,
        letterBody: data.coverLetter.letterBody,
        generatedAt: new Date().toISOString(),
      });
      addToast(t.toasts.coverLetterGenerated, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Cover letter generation failed.';
      setLetterError(msg);
      addToast(msg, 'error');
    } finally {
      setIsDraftingLetter(false);
    }
  };

  const handleBuildTemplateCoverLetter = (companyName: string, jobTitle: string) => {
    setLetterError(null);
    const result = buildTemplateCoverLetter(profile, { companyName, jobTitle });
    setCoverLetter(result);
    addToast(
      isProfileEmpty(profile) ? t.coverAndAudit.cover.profileMissingNote : t.toasts.coverLetterGenerated,
      isProfileEmpty(profile) ? 'info' : 'success'
    );
  };

  const handleCopyCoverLetter = async () => {
    if (!coverLetter) return;
    const text = `${coverLetter.subjectLine}\n\n${coverLetter.letterBody}`;
    await navigator.clipboard.writeText(text);
    addToast(t.toasts.coverLetterCopied, 'success');
  };

  const handleDownloadCoverLetterTxt = () => {
    if (!coverLetter) return;
    const text = `Subject: ${coverLetter.subjectLine}\n\n${coverLetter.letterBody}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Cover_Letter.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCoverLetterPdf = () => {
    if (!coverLetter) return;
    const { doc, filename } = generateCoverLetterPdf(profile, coverLetter);
    doc.save(filename);
    addToast(t.toasts.coverLetterPdfGenerated, 'success');
  };

  const handleRunOfflineAudit = (formText: string) => {
    if (!formText.trim()) {
      addToast(t.toasts.missingFormText, 'error');
      return;
    }
    setAuditError(null);
    setAuditReport(auditFormOffline(formText, lang));
    addToast(t.coverAndAudit.reviewer.offlineDone, 'success');
  };

  const handleRunAudit = async (formText: string) => {
    if (!formText.trim()) {
      addToast(t.toasts.missingFormText, 'error');
      return;
    }
    setAuditError(null);
    setIsAuditing(true);
    try {
      const response = await fetch('/api/ai/audit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formText, uiLang: lang }),
      });
      const data = (await response.json()) as {
        report?: Parameters<typeof buildAuditReport>[0];
        error?: string;
      };
      if (!response.ok || !data.report) {
        throw new Error(data.error || 'Failed to audit application form.');
      }
      setAuditReport(buildAuditReport(data.report));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI audit request failed.';
      setAuditError(msg);
      addToast(msg, 'error');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleDownloadBundle = async () => {
    const { blob, filename } = await generateApplicationBundleZip(
      profile,
      frontCard,
      backCard,
      certItems,
      certsPerPage
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(t.toasts.bundleDownloaded, 'success');
  };

  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ProApply_Profile_Backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(t.toasts.backupExported, 'success');
  };

  const handleImportBackup = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<CvProfile>;
      const merged = mergeProfile(EMPTY_PROFILE, parsed, true);
      setProfile(merged);
      addToast(t.toasts.backupImported, 'success');
    } catch {
      addToast('Invalid JSON backup file.', 'error');
    }
  };

  const navItems: Array<{
    id: TabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'cv-builder', label: t.nav.cvBuilder, icon: FileText },
    { id: 'id-merger', label: t.nav.idMerger, icon: CreditCard },
    { id: 'cert-bundle', label: t.nav.certBundle, icon: FileImage },
    { id: 'cover-and-audit', label: t.nav.coverAndAudit, icon: FileSearch },
    { id: 'profile-manager', label: t.nav.profileManager, icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col lg:flex-row">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Desktop Enterprise Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-e border-[#E2E8F0] bg-white z-30">
        <div className="px-6 py-5 border-b border-[#E2E8F0]">
          <span className="text-lg font-bold tracking-tight text-[#0F172A] block whitespace-nowrap">
            {t.appName}
          </span>
          <p className="mt-0.5 text-xs text-slate-500">{t.appSubtitle}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1E3A8A] text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E2E8F0] space-y-2.5">
          <div className="text-xs text-slate-600 px-1">
            <p className="font-semibold text-[#0F172A] truncate">
              {profile.fullName || 'Guest Profile'}
            </p>
            <p className="truncate text-slate-500">{profile.email || '—'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <Globe className="h-3.5 w-3.5 text-[#1E3A8A]" />
              <span>{t.topbar.langSwitch}</span>
            </button>
            <PWAInstallButton t={t} compact />
          </div>
          <PrivacyNotice lang={lang} onToggleLang={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))} />
        </div>
      </aside>

      {/* Main Viewport Area */}
      <div className="flex-1 flex flex-col lg:ps-64 pb-20 lg:pb-8">
        {/* Mobile Top Bar (non-sticky so mobile sticky height stays <= 7%) */}
        <header className="lg:hidden flex items-center justify-between gap-3 px-4 py-3 border-b border-[#E2E8F0] bg-white">
          <span className="text-base font-bold tracking-tight text-[#0F172A] whitespace-nowrap shrink-0">
            {t.appName}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0F172A] whitespace-nowrap"
            >
              <Globe className="h-3.5 w-3.5 text-[#1E3A8A]" />
              <span>{t.topbar.langSwitch}</span>
            </button>
            <PWAInstallButton t={t} compact />
            <PrivacyNotice compact lang={lang} onToggleLang={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))} />
          </div>
        </header>

        {!isOnline && (
          <div
            role="status"
            className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs font-medium text-amber-900 flex items-center justify-center gap-2"
          >
            <WifiOff className="h-3.5 w-3.5 text-[#D97706] shrink-0" />
            <span>{t.topbar.offlineBanner}</span>
          </div>
        )}

        <main className="flex-1 mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'cv-builder' && (
            <CvBuilderTab
              t={t}
              profile={profile}
              onChangeProfile={setProfile}
              onLoadSample={handleLoadSample}
              onClearBlank={handleClearBlank}
              onDownloadPdf={handleDownloadCvPdf}
              isTailoring={isTailoring}
              onTailorWithAi={handleTailorWithAi}
            />
          )}

          {activeTab === 'id-merger' && (
            <IdMergerTab
              t={t}
              frontCard={frontCard}
              backCard={backCard}
              enhanceEnabled={enhanceEnabled}
              onSetFrontCard={setFrontCard}
              onSetBackCard={setBackCard}
              onSwapCards={handleSwapCards}
              onToggleEnhance={handleToggleEnhance}
              onGeneratePdf={handleDownloadIdPdf}
            />
          )}

          {activeTab === 'cert-bundle' && (
            <CertBundleTab
              t={t}
              items={certItems}
              itemsPerPage={certsPerPage}
              onChangeItems={setCertItems}
              onChangeItemsPerPage={setCertsPerPage}
              onExportPdf={handleDownloadCertsPdf}
            />
          )}

          {activeTab === 'cover-and-audit' && (
            <CoverAndAuditTab
              t={t}
              profile={profile}
              coverLetter={coverLetter}
              isDraftingLetter={isDraftingLetter}
              letterError={letterError}
              onGenerateCoverLetter={handleGenerateCoverLetter}
              onBuildTemplateCoverLetter={handleBuildTemplateCoverLetter}
              onUpdateCoverLetter={setCoverLetter}
              onCopyCoverLetter={handleCopyCoverLetter}
              onDownloadCoverLetterTxt={handleDownloadCoverLetterTxt}
              onDownloadCoverLetterPdf={handleDownloadCoverLetterPdf}
              auditReport={auditReport}
              isAuditing={isAuditing}
              auditError={auditError}
              onRunAudit={handleRunAudit}
              onRunOfflineAudit={handleRunOfflineAudit}
            />
          )}

          {activeTab === 'profile-manager' && (
            <ProfileManagerTab
              t={t}
              profile={profile}
              frontCard={frontCard}
              backCard={backCard}
              certItems={certItems}
              onLoadSample={handleLoadSample}
              onClearBlank={handleClearBlank}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onDownloadCv={handleDownloadCvPdf}
              onDownloadId={handleDownloadIdPdf}
              onDownloadCerts={handleDownloadCertsPdf}
              onDownloadBundle={handleDownloadBundle}
              onNavigateTab={setActiveTab}
            />
          )}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (56px height <= 7% of mobile viewport) */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-14 border-t border-[#E2E8F0] bg-white grid grid-cols-5"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors px-1 ${
                isActive ? 'text-[#1E3A8A]' : 'text-slate-500 hover:text-[#0F172A]'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate max-w-full">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
