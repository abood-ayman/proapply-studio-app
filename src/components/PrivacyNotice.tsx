import React, { useState } from 'react';
import { Globe, ShieldCheck, X } from 'lucide-react';
import type { AppLanguage } from '../types';

interface PrivacyNoticeProps {
  lang: AppLanguage;
  onToggleLang: () => void;
  compact?: boolean;
}

const NOTICE = {
  en: {
    open: 'Privacy',
    title: 'Privacy notice',
    close: 'Close',
    switchLabel: 'العربية',
    paragraphs: [
      'No account is required. Your CV details and language setting are saved in your browser on this device. ID and certificate images are processed in your browser to create PDFs. The app does not upload or save those images, and they disappear from the page when it reloads.',
      'PDFs and backup files you download remain wherever you save them. Clearing site data does not delete those files. It removes the CV details and language setting saved in your browser.',
      'AI features are turned off, and your inputs are not sent to an AI service. Loading Google Fonts may share your IP address and browser details with Google. The hosting service may keep request logs that the app cannot control or display.',
      'This describes how the app works. It is not a legal agreement.',
    ],
  },
  ar: {
    open: 'الخصوصية',
    title: 'إشعار الخصوصية',
    close: 'إغلاق',
    switchLabel: 'English',
    paragraphs: [
      'التطبيق لا يحتاج حسابًا. بيانات السيرة وإعداد اللغة بتتحفظ في متصفحك على الجهاز. صور البطاقة والشهادات بتتعالج داخل المتصفح لإنشاء PDF، ومش بتترفع أو تتحفظ بواسطة التطبيق، وبتختفي من الصفحة عند إعادة تحميلها.',
      'ملفات PDF والنسخ الاحتياطية اللي بتنزّلها بتفضل في المكان اللي حفظتها فيه، ومسح بيانات الموقع مش بيمسحها. مسح بيانات الموقع بيمسح بيانات السيرة وإعداد اللغة المحفوظين في المتصفح.',
      'ميزات الذكاء الاصطناعي متوقفة، ومدخلاتك مش بتتبعت لخدمة ذكاء اصطناعي. تحميل خطوط Google ممكن يشارك عنوان IP وبيانات المتصفح مع جوجل. الاستضافة ممكن تحتفظ بسجلات طلبات لا يتحكم فيها التطبيق ولا يعرضها.',
      'ده وصف لطريقة عمل التطبيق، مش اتفاق قانوني.',
    ],
  },
} as const;

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ lang, onToggleLang, compact = false }) => {
  const [open, setOpen] = useState(false);
  const c = NOTICE[lang];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={c.open}
        className={
          compact
            ? 'inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0F172A] whitespace-nowrap'
            : 'inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors whitespace-nowrap w-full'
        }
      >
        <ShieldCheck className="h-3.5 w-3.5 text-[#1E3A8A]" />
        {!compact && <span>{c.open}</span>}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-notice-title"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h3 id="privacy-notice-title" className="text-base font-semibold text-[#0F172A]">
                {c.title}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={c.close}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700">
              {c.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="mt-4">
              <button
                type="button"
                data-testid="clear-all-data-btn"
                onClick={() => {
                  const ok = window.confirm(
                    lang === 'ar'
                      ? 'هتتمسح بيانات السيرة وإعداد اللغة المحفوظين في المتصفح ده. ملفات PDF اللي نزّلتها مش هتتأثر. تكمل؟'
                      : 'This erases the CV details and language setting saved in this browser. PDFs you already downloaded are not affected. Continue?'
                  );
                  if (!ok) return;
                  try {
                    window.localStorage.clear();
                    window.sessionStorage.clear();
                  } catch {
                    // storage blocked: nothing to clear
                  }
                  window.location.reload();
                }}
                className="w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
              >
                {lang === 'ar' ? 'امسح كل بياناتي من المتصفح' : 'Erase all my data from this browser'}
              </button>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onToggleLang}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
              >
                <Globe className="h-3.5 w-3.5 text-[#1E3A8A]" />
                <span>{c.switchLabel}</span>
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-[#1E3A8A] px-4 py-2 text-xs font-bold text-white"
              >
                {c.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
