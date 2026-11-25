import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import type { TranslationDictionary } from '../i18n/translations';

interface PWAInstallButtonProps {
  t: TranslationDictionary;
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ t, compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome !== 'unavailable') return;
    }
    setShowGuideModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
      >
        <Download className="h-3.5 w-3.5 text-[#1E3A8A]" />
        <span>{compact ? t.topbar.installAppShort : t.topbar.installApp}</span>
      </button>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
        >
          <div className="w-full max-w-sm rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h3 id="pwa-install-title" className="text-base font-semibold text-[#0F172A]">
                {isIOS ? t.pwa.iosTitle : t.pwa.desktopTitle}
              </h3>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label={t.pwa.close}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-[#0F172A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {isIOS ? t.pwa.iosSteps : t.pwa.desktopSteps}
            </p>
            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="mt-5 w-full rounded-lg bg-[#1E3A8A] py-2.5 text-sm font-semibold text-white hover:bg-[#1E40AF] transition-colors"
            >
              {t.pwa.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
