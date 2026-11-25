import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Database,
  Download,
  Eraser,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react';
import type { TranslationDictionary } from '../i18n/translations';
import type { CvMode, CvProfile, ExperienceItem } from '../types';
import { CvPdfPreview } from './CvPdfPreview';

interface CvBuilderTabProps {
  t: TranslationDictionary;
  profile: CvProfile;
  onChangeProfile: (next: CvProfile) => void;
  onLoadSample: () => void;
  onClearBlank: () => void;
  onDownloadPdf: () => void;
  isTailoring: boolean;
  onTailorWithAi: (jobAd: string) => Promise<void>;
}

type EditorSection = 'personal' | 'summary' | 'skills' | 'experience' | 'education' | 'certificates';

export const CvBuilderTab: React.FC<CvBuilderTabProps> = ({
  t,
  profile,
  onChangeProfile,
  onLoadSample,
  onClearBlank,
  onDownloadPdf,
  isTailoring,
  onTailorWithAi,
}) => {
  const [cvMode, setCvMode] = useState<CvMode>('instant');
  const [jobAd, setJobAd] = useState('');
  const [openSections, setOpenSections] = useState<Record<EditorSection, boolean>>({
    personal: true,
    summary: true,
    skills: false,
    experience: true,
    education: false,
    certificates: false,
  });

  const toggleSection = (key: EditorSection) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateExperience = (idx: number, patch: Partial<ExperienceItem>) => {
    const nextExp = profile.experiences.map((item, i) =>
      i === idx ? { ...item, ...patch } : item
    );
    onChangeProfile({ ...profile, experiences: nextExp });
  };

  const addExperience = () => {
    const nextItem: ExperienceItem = {
      id: `exp-${Date.now()}`,
      role: 'New Role Title',
      company: 'Organization Name',
      location: 'City, Country',
      period: '2025 – Present',
      bullets: ['Key achievement or measurable operational impact.'],
    };
    onChangeProfile({
      ...profile,
      experiences: [...profile.experiences, nextItem],
    });
    setOpenSections((prev) => ({ ...prev, experience: true }));
  };

  const removeExperience = (idx: number) => {
    onChangeProfile({
      ...profile,
      experiences: profile.experiences.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
            {t.cv.heading}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{t.cv.subheading}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Database className="h-3.5 w-3.5 text-[#1E3A8A]" />
            <span>{t.cv.loadSample}</span>
          </button>
          <button
            type="button"
            onClick={onClearBlank}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Eraser className="h-3.5 w-3.5" />
            <span>{t.cv.clearBlank}</span>
          </button>
          <button
            type="button"
            onClick={onDownloadPdf}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E40AF] transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t.cv.downloadPdf}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Generation Mode Switcher + Collapsible Manual Forms */}
        <div className="xl:col-span-5 space-y-5">
          {/* Generation Mode Card */}
          <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-4">
            <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setCvMode('instant')}
                className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                  cvMode === 'instant'
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                <Zap className="h-3.5 w-3.5 text-[#1E3A8A]" />
                <span>{t.cv.modeInstant}</span>
              </button>
              <button
                type="button"
                onClick={() => setCvMode('ai')}
                className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                  cvMode === 'ai'
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-[#1E3A8A]" />
                <span>{t.cv.modeAi}</span>
              </button>
            </div>

            {cvMode === 'instant' ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">{t.cv.instantModeDesc}</p>
                <p className="text-xs text-slate-500">{t.cv.englishOnlyNotice}</p>
              </div>
            ) : (
              <div>
                <div role="status" className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  AI Job-Tailored Mode is turned off in this public build. Use Instant Template Mode.
                  <span dir="rtl" className="block mt-1">وضع الذكاء الاصطناعي متوقف حاليا. استخدم الوضع الفوري.</span>
                </div>
                <label htmlFor="job-ad-input" className="text-sm font-semibold text-[#0F172A]">
                  {t.cv.jobAdTitle}
                </label>
                <p className="mt-1 text-xs text-slate-500">{t.cv.englishOnlyNotice}</p>
                <textarea
                  id="job-ad-input"
                  dir="auto"
                  rows={5}
                  disabled
                  value={jobAd}
                  onChange={(e) => setJobAd(e.target.value)}
                  placeholder={t.cv.jobAdPlaceholder}
                  className="mt-3 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
                />
                <div className="mt-3 flex items-center justify-end">
                  <button
                    type="button"
                    disabled={true}
                    onClick={() => void onTailorWithAi(jobAd)}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E40AF] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
                  >
                    {isTailoring ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    <span>{isTailoring ? t.cv.tailoring : t.cv.tailorWithAi}</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Collapsible Manual Profile Editor */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white divide-y divide-[#E2E8F0]">
            {/* 1. Personal Details */}
            <div>
              <button
                type="button"
                aria-expanded={openSections.personal}
                onClick={() => toggleSection('personal')}
                className="flex w-full items-center justify-between px-5 py-3.5 text-start hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-semibold text-[#0F172A]">
                  {t.cv.sections.personal}
                </span>
                {openSections.personal ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </button>
              {openSections.personal && (
                <div className="px-5 pb-5 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label htmlFor="cv-fullname" className="block text-xs font-medium text-slate-600 mb-1">
                      {t.cv.fields.fullName}
                    </label>
                    <input
                      id="cv-fullname"
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => onChangeProfile({ ...profile, fullName: e.target.value })}
                      className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="cv-role" className="block text-xs font-medium text-slate-600 mb-1">
                      {t.cv.fields.targetRole}
                    </label>
                    <input
                      id="cv-role"
                      type="text"
                      value={profile.targetRole}
                      onChange={(e) => onChangeProfile({ ...profile, targetRole: e.target.value })}
                      className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="cv-location" className="block text-xs font-medium text-slate-600 mb-1">
                      {t.cv.fields.location}
                    </label>
                    <input
                      id="cv-location"
                      type="text"
                      value={profile.location}
                      onChange={(e) => onChangeProfile({ ...profile, location: e.target.value })}
                      className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="cv-phone" className="block text-xs font-medium text-slate-600 mb-1">
                      {t.cv.fields.phone}
                    </label>
                    <input
                      id="cv-phone"
                      type="text"
                      dir="ltr"
                      value={profile.phone}
                      onChange={(e) => onChangeProfile({ ...profile, phone: e.target.value })}
                      className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] font-tabular focus:border-[#1E3A8A] focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="cv-email" className="block text-xs font-medium text-slate-600 mb-1">
                      {t.cv.fields.email}
                    </label>
                    <input
                      id="cv-email"
                      type="email"
                      dir="ltr"
                      value={profile.email}
                      onChange={(e) => onChangeProfile({ ...profile, email: e.target.value })}
                      className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="cv-linkedin" className="block text-xs font-medium text-slate-600 mb-1">
                      {t.cv.fields.linkedin}
                    </label>
                    <input
                      id="cv-linkedin"
                      type="url"
                      dir="ltr"
                      value={profile.linkedin}
                      onChange={(e) => onChangeProfile({ ...profile, linkedin: e.target.value })}
                      className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Professional Summary */}
            <div>
              <button
                type="button"
                aria-expanded={openSections.summary}
                onClick={() => toggleSection('summary')}
                className="flex w-full items-center justify-between px-5 py-3.5 text-start hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-semibold text-[#0F172A]">
                  {t.cv.sections.summary}
                </span>
                {openSections.summary ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </button>
              {openSections.summary && (
                <div className="px-5 pb-5 pt-1">
                  <label htmlFor="cv-summary" className="block text-xs font-medium text-slate-600 mb-1">
                    {t.cv.fields.summary}
                  </label>
                  <textarea
                    id="cv-summary"
                    rows={4}
                    dir="ltr"
                    value={profile.summary}
                    onChange={(e) => onChangeProfile({ ...profile, summary: e.target.value })}
                    className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* 3. Core Competencies */}
            <div>
              <button
                type="button"
                aria-expanded={openSections.skills}
                onClick={() => toggleSection('skills')}
                className="flex w-full items-center justify-between px-5 py-3.5 text-start hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-semibold text-[#0F172A]">
                  {t.cv.sections.skills}
                </span>
                {openSections.skills ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </button>
              {openSections.skills && (
                <div className="px-5 pb-5 pt-1">
                  <label htmlFor="cv-skills" className="block text-xs font-medium text-slate-600 mb-1">
                    {t.cv.fields.skillsHint}
                  </label>
                  <textarea
                    id="cv-skills"
                    rows={3}
                    dir="ltr"
                    value={profile.coreCompetencies.join(', ')}
                    onChange={(e) =>
                      onChangeProfile({
                        ...profile,
                        coreCompetencies: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* 4. Work Experience */}
            <div>
              <button
                type="button"
                aria-expanded={openSections.experience}
                onClick={() => toggleSection('experience')}
                className="flex w-full items-center justify-between px-5 py-3.5 text-start hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-semibold text-[#0F172A]">
                  {t.cv.sections.experience} ({profile.experiences.length})
                </span>
                {openSections.experience ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </button>
              {openSections.experience && (
                <div className="px-5 pb-5 pt-2 space-y-4">
                  {profile.experiences.map((exp, idx) => (
                    <div
                      key={exp.id}
                      className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#1E3A8A] font-tabular">
                          0{idx + 1}. {exp.role || t.cv.fields.role}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExperience(idx)}
                          aria-label={`${t.cv.fields.removeExperience} ${exp.role}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{t.cv.fields.removeExperience}</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        dir="ltr"
                        aria-label={t.cv.fields.role}
                        value={exp.role}
                        onChange={(e) => updateExperience(idx, { role: e.target.value })}
                        placeholder={t.cv.fields.role}
                        className="w-full rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-sm text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          dir="ltr"
                          aria-label={t.cv.fields.company}
                          value={exp.company}
                          onChange={(e) => updateExperience(idx, { company: e.target.value })}
                          placeholder={t.cv.fields.company}
                          className="w-full rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none"
                        />
                        <input
                          type="text"
                          dir="ltr"
                          aria-label={t.cv.fields.period}
                          value={exp.period}
                          onChange={(e) => updateExperience(idx, { period: e.target.value })}
                          placeholder={t.cv.fields.period}
                          className="w-full rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs text-[#0F172A] font-tabular focus:border-[#1E3A8A] focus:outline-none"
                        />
                      </div>
                      <textarea
                        rows={3}
                        dir="ltr"
                        aria-label={t.cv.fields.bulletsHint}
                        value={exp.bullets.join('\n')}
                        onChange={(e) =>
                          updateExperience(idx, {
                            bullets: e.target.value.split('\n'),
                          })
                        }
                        placeholder={t.cv.fields.bulletsHint}
                        className="w-full rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addExperience}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t.cv.fields.addExperience}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. Education */}
            <div>
              <button
                type="button"
                aria-expanded={openSections.education}
                onClick={() => toggleSection('education')}
                className="flex w-full items-center justify-between px-5 py-3.5 text-start hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-semibold text-[#0F172A]">
                  {t.cv.sections.education}
                </span>
                {openSections.education ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </button>
              {openSections.education && (
                <div className="px-5 pb-5 pt-1 space-y-3">
                  <div>
                    <label htmlFor="cv-degree" className="block text-xs font-medium text-slate-600 mb-1">
                      {t.cv.fields.degree}
                    </label>
                    <input
                      id="cv-degree"
                      type="text"
                      dir="ltr"
                      value={profile.education.degree}
                      onChange={(e) =>
                        onChangeProfile({
                          ...profile,
                          education: { ...profile.education, degree: e.target.value },
                        })
                      }
                      className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="cv-inst" className="block text-xs font-medium text-slate-600 mb-1">
                        {t.cv.fields.institution}
                      </label>
                      <input
                        id="cv-inst"
                        type="text"
                        dir="ltr"
                        value={profile.education.institution}
                        onChange={(e) =>
                          onChangeProfile({
                            ...profile,
                            education: { ...profile.education, institution: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="cv-grad" className="block text-xs font-medium text-slate-600 mb-1">
                        {t.cv.fields.graduation}
                      </label>
                      <input
                        id="cv-grad"
                        type="text"
                        dir="ltr"
                        value={profile.education.expectedGraduation}
                        onChange={(e) =>
                          onChangeProfile({
                            ...profile,
                            education: {
                              ...profile.education,
                              expectedGraduation: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Certificates */}
            <div>
              <button
                type="button"
                aria-expanded={openSections.certificates}
                onClick={() => toggleSection('certificates')}
                className="flex w-full items-center justify-between px-5 py-3.5 text-start hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-semibold text-[#0F172A]">
                  {t.cv.sections.certificates} ({profile.certificates.length})
                </span>
                {openSections.certificates ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </button>
              {openSections.certificates && (
                <div className="px-5 pb-5 pt-1">
                  <label htmlFor="cv-certs" className="block text-xs font-medium text-slate-600 mb-1">
                    {t.cv.fields.certificatesHint}
                  </label>
                  <textarea
                    id="cv-certs"
                    rows={6}
                    dir="ltr"
                    value={profile.certificates.join('\n')}
                    onChange={(e) =>
                      onChangeProfile({
                        ...profile,
                        certificates: e.target.value.split('\n'),
                      })
                    }
                    className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-xs text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time A4 PDF Canvas Preview (pdf.js) */}
        <CvPdfPreview profile={profile} t={t} />
      </div>
    </div>
  );
};
