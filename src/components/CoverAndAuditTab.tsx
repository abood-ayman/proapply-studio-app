import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  FileSearch,
  FileText,
  Loader2,
  Mail,
  ShieldAlert,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { TranslationDictionary } from '../i18n/translations';
import type { AuditReport, CoverLetterResult, CvProfile } from '../types';
import { SAMPLE_PORTAL_REVIEW_TEXT, summarizeAuditCounts } from '../utils/formAuditParser';

interface CoverAndAuditTabProps {
  t: TranslationDictionary;
  profile: CvProfile;
  coverLetter: CoverLetterResult | null;
  isDraftingLetter: boolean;
  letterError: string | null;
  onGenerateCoverLetter: (jobAd: string, companyName: string) => Promise<void>;
  onBuildTemplateCoverLetter: (companyName: string, jobTitle: string) => void;
  onUpdateCoverLetter: (next: CoverLetterResult) => void;
  onCopyCoverLetter: () => Promise<void>;
  onDownloadCoverLetterTxt: () => void;
  onDownloadCoverLetterPdf: () => void;
  auditReport: AuditReport | null;
  isAuditing: boolean;
  auditError: string | null;
  onRunAudit: (formText: string) => Promise<void>;
  onRunOfflineAudit: (formText: string) => void;
}

export const CoverAndAuditTab: React.FC<CoverAndAuditTabProps> = ({
  t,
  profile,
  coverLetter,
  isDraftingLetter,
  letterError,
  onGenerateCoverLetter,
  onBuildTemplateCoverLetter,
  onUpdateCoverLetter,
  onCopyCoverLetter,
  onDownloadCoverLetterTxt,
  onDownloadCoverLetterPdf,
  auditReport,
  isAuditing,
  auditError,
  onRunAudit,
  onRunOfflineAudit,
}) => {
  const [subTab, setSubTab] = useState<'cover' | 'audit'>('cover');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [formText, setFormText] = useState('');

  const counts = auditReport ? summarizeAuditCounts(auditReport.findings) : null;

  return (
    <div className="space-y-6">
      <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        AI features are turned off in this public build. The cover letter builder and form checker work offline, using only your own data.
        <span dir="rtl" className="block mt-1">ميزات الذكاء الاصطناعي متوقفة في هذه النسخة العامة. منشئ الخطاب ومراجع الاستمارة يعملان بدون إنترنت، من بياناتك فقط.</span>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
            {t.coverAndAudit.heading}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{t.coverAndAudit.subheading}</p>
        </div>

        <div className="inline-flex items-center gap-1 rounded-lg bg-slate-200/70 p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSubTab('cover')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              subTab === 'cover'
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            <Mail className="h-3.5 w-3.5 text-[#1E3A8A]" />
            <span>{t.coverAndAudit.tabCoverLetter}</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('audit')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              subTab === 'audit'
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            <FileSearch className="h-3.5 w-3.5 text-[#1E3A8A]" />
            <span>{t.coverAndAudit.tabFormChecker}</span>
          </button>
        </div>
      </div>

      {subTab === 'cover' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left: Cover Letter Inputs */}
          <section className="xl:col-span-5 rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-4">
            <div>
              <label htmlFor="cover-company" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                {t.coverAndAudit.cover.companyLabel}
              </label>
              <input
                id="cover-company"
                type="text"
                dir="auto"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t.coverAndAudit.cover.companyPlaceholder}
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-sm text-[#0F172A] focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="cover-job-desc" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                {t.coverAndAudit.cover.jobDescLabel}
              </label>
              <textarea
                id="cover-job-desc"
                dir="auto"
                rows={10}
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder={t.coverAndAudit.cover.jobDescPlaceholder}
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="cover-job-title" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                {t.coverAndAudit.cover.jobTitleLabel}
              </label>
              <input
                id="cover-job-title"
                type="text"
                dir="auto"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder={t.coverAndAudit.cover.jobTitlePlaceholder}
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-sm text-[#0F172A] focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => onBuildTemplateCoverLetter(companyName, jobTitle)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E40AF] transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>{t.coverAndAudit.cover.templateButton}</span>
            </button>
            <p className="text-xs text-slate-500">{t.coverAndAudit.cover.templateNote}</p>

            <button
              type="button"
              disabled={true}
              onClick={() => void onGenerateCoverLetter(jobDesc, companyName)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E40AF] disabled:opacity-60 transition-colors"
            >
              {isDraftingLetter ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>
                {isDraftingLetter
                  ? t.coverAndAudit.cover.generating
                  : t.coverAndAudit.cover.generateButton}
              </span>
            </button>
          </section>

          {/* Right: Cover Letter Preview & Export */}
          <section className="xl:col-span-7 space-y-4">
            {letterError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 text-sm text-red-900"
              >
                <ShieldAlert className="h-5 w-5 text-[#DC2626] shrink-0 mt-0.5" />
                <p className="text-xs text-red-800">{letterError}</p>
              </div>
            )}

            {isDraftingLetter ? (
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 space-y-4">
                <div className="flex items-center gap-3 text-sm font-semibold text-[#0F172A]">
                  <Loader2 className="h-5 w-5 animate-spin text-[#1E3A8A]" />
                  <span>{t.coverAndAudit.cover.generating}</span>
                </div>
                <div className="h-48 rounded-lg bg-slate-100 animate-pulse" />
              </div>
            ) : coverLetter ? (
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
                  <span className="text-sm font-bold text-[#0F172A]">
                    {t.coverAndAudit.cover.bodyLabel}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void onCopyCoverLetter()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
                    >
                      <Copy className="h-3.5 w-3.5 text-[#1E3A8A]" />
                      <span>{t.coverAndAudit.cover.copyButton}</span>
                    </button>
                    <button
                      type="button"
                      onClick={onDownloadCoverLetterTxt}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
                    >
                      <FileText className="h-3.5 w-3.5 text-[#1E3A8A]" />
                      <span>{t.coverAndAudit.cover.downloadTxt}</span>
                    </button>
                    <button
                      type="button"
                      onClick={onDownloadCoverLetterPdf}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E40AF]"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{t.coverAndAudit.cover.downloadPdf}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="cover-subject" className="block text-xs font-medium text-slate-600 mb-1">
                    {t.coverAndAudit.cover.subjectLabel}
                  </label>
                  <input
                    id="cover-subject"
                    type="text"
                    dir="ltr"
                    value={coverLetter.subjectLine}
                    onChange={(e) =>
                      onUpdateCoverLetter({ ...coverLetter, subjectLine: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-semibold text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none"
                  />
                </div>

                <textarea
                  rows={14}
                  dir="ltr"
                  aria-label={t.coverAndAudit.cover.bodyLabel}
                  value={coverLetter.letterBody}
                  onChange={(e) =>
                    onUpdateCoverLetter({ ...coverLetter, letterBody: e.target.value })
                  }
                  className="w-full rounded-lg border border-[#E2E8F0] px-3.5 py-3 text-sm leading-relaxed text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-10 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-[#1E3A8A]">
                  <Mail className="h-6 w-6" />
                </div>
                <h2 className="text-base font-semibold text-[#0F172A]">
                  {t.coverAndAudit.cover.emptyTitle}
                </h2>
                <p className="mx-auto max-w-md text-sm text-slate-500">
                  {t.coverAndAudit.cover.emptySubtitle}
                </p>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left: Form Review Text Input */}
          <section className="xl:col-span-5 rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="form-review-input" className="text-sm font-semibold text-[#0F172A]">
                {t.coverAndAudit.reviewer.inputLabel}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormText(SAMPLE_PORTAL_REVIEW_TEXT)}
                  className="text-xs font-semibold text-[#1E3A8A] hover:underline"
                >
                  {t.coverAndAudit.reviewer.loadSample}
                </button>
                {formText && (
                  <button
                    type="button"
                    onClick={() => setFormText('')}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{t.coverAndAudit.reviewer.clearInput}</span>
                  </button>
                )}
              </div>
            </div>

            <textarea
              id="form-review-input"
              dir="auto"
              rows={13}
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              placeholder={t.coverAndAudit.reviewer.inputPlaceholder}
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
            />

            <button
              type="button"
              onClick={() => onRunOfflineAudit(formText)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E40AF] transition-colors"
            >
              <FileSearch className="h-4 w-4" />
              <span>{t.coverAndAudit.reviewer.offlineAuditButton}</span>
            </button>

            <button
              type="button"
              disabled={true}
              onClick={() => void onRunAudit(formText)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E40AF] disabled:opacity-60 transition-colors"
            >
              {isAuditing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>
                {isAuditing
                  ? t.coverAndAudit.reviewer.auditing
                  : t.coverAndAudit.reviewer.auditButton}
              </span>
            </button>
          </section>

          {/* Right: Audit Results */}
          <section className="xl:col-span-7 space-y-4">
            {auditError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 text-sm text-red-900"
              >
                <ShieldAlert className="h-5 w-5 text-[#DC2626] shrink-0 mt-0.5" />
                <p className="text-xs text-red-800">{auditError}</p>
              </div>
            )}

            {isAuditing ? (
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 space-y-4">
                <div className="flex items-center gap-3 text-sm font-semibold text-[#0F172A]">
                  <Loader2 className="h-5 w-5 animate-spin text-[#1E3A8A]" />
                  <span>{t.coverAndAudit.reviewer.auditing}</span>
                </div>
                <div className="space-y-3">
                  <div className="h-16 rounded-lg bg-slate-100 animate-pulse" />
                  <div className="h-16 rounded-lg bg-slate-100 animate-pulse" />
                </div>
              </div>
            ) : auditReport && counts ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-[#0F172A]">
                        {t.coverAndAudit.reviewer.resultsTitle}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.coverAndAudit.reviewer.portalLabel}: {auditReport.portalDetected}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold font-tabular">
                      <span className="inline-flex items-center gap-1.5 text-[#DC2626]">
                        <ShieldAlert className="h-4 w-4" />
                        {counts.critical} {t.coverAndAudit.reviewer.criticalLabel}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[#D97706]">
                        <AlertTriangle className="h-4 w-4" />
                        {counts.warning} {t.coverAndAudit.reviewer.warningLabel}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[#16A34A]">
                        <CheckCircle2 className="h-4 w-4" />
                        {counts.ok} {t.coverAndAudit.reviewer.okLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {auditReport.findings.map((finding) => {
                    const isCritical = finding.severity === 'critical';
                    const isWarning = finding.severity === 'warning';

                    return (
                      <div
                        key={finding.id}
                        className={`rounded-xl border p-4 space-y-2 ${
                          isCritical
                            ? 'border-red-200 bg-red-50/70'
                            : isWarning
                            ? 'border-amber-200 bg-amber-50/70'
                            : 'border-emerald-200 bg-emerald-50/60'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {isCritical ? (
                              <ShieldAlert className="h-4 w-4 text-[#DC2626] shrink-0" />
                            ) : isWarning ? (
                              <AlertTriangle className="h-4 w-4 text-[#D97706] shrink-0" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" />
                            )}
                            <span
                              className={`text-xs font-bold uppercase tracking-wide ${
                                isCritical
                                  ? 'text-[#DC2626]'
                                  : isWarning
                                  ? 'text-[#D97706]'
                                  : 'text-[#16A34A]'
                              }`}
                            >
                              {isCritical
                                ? t.coverAndAudit.reviewer.criticalLabel
                                : isWarning
                                ? t.coverAndAudit.reviewer.warningLabel
                                : t.coverAndAudit.reviewer.okLabel}
                            </span>
                          </div>
                          <span className="text-xs text-slate-600 font-medium">
                            {t.coverAndAudit.reviewer.answerLabel}:{' '}
                            <strong className="text-[#0F172A]">{finding.detectedAnswer}</strong>
                          </span>
                        </div>

                        <h3 className="text-sm font-semibold text-[#0F172A]">
                          {finding.fieldOrQuestion}
                        </h3>
                        <p className="text-xs text-slate-700 leading-relaxed">{finding.issue}</p>
                        {finding.recommendation && (
                          <p className="text-xs font-medium text-[#0F172A] pt-1 border-t border-black/5">
                            {t.coverAndAudit.reviewer.recommendationLabel}:{' '}
                            {finding.recommendation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-10 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-[#1E3A8A]">
                  <FileSearch className="h-6 w-6" />
                </div>
                <h2 className="text-base font-semibold text-[#0F172A]">
                  {t.coverAndAudit.reviewer.emptyTitle}
                </h2>
                <p className="mx-auto max-w-md text-sm text-slate-500">
                  {t.coverAndAudit.reviewer.emptySubtitle}
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
