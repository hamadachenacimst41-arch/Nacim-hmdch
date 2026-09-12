import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { InstallAppModal } from './InstallAppModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'badge' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '', 
  variant = 'header' 
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already running as standalone app on mobile, display a subtle indicator or hide
  if (isInstalled) {
    if (variant === 'badge') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 rounded-lg text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>App Installée</span>
        </div>
      );
    }
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  if (variant === 'card') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className={`w-full p-3 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 hover:from-amber-500/20 hover:to-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition-all flex items-center justify-between shadow-xs cursor-pointer ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-lg shadow-sm">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-amber-400 text-xs">
                Installer l'application sur Téléphone (PWA)
              </div>
              <div className="text-[11px] text-slate-300 font-normal">
                تثبيت التطبيق على هاتف أندرويد أو آيفون بدون متجر
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-amber-500 text-slate-950 px-2.5 py-1 rounded-md text-[11px] font-bold">
            <Download className="w-3 h-3" />
            <span>Installer</span>
          </div>
        </button>

        <InstallAppModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        id="pwa-install-header-btn"
        className={`flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-amber-500/30 hover:from-amber-500/30 hover:to-amber-500/40 text-amber-300 border border-amber-500/50 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${className}`}
        title="Installer l'application sur votre smartphone (Android / iOS)"
      >
        <Smartphone className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span className="hidden sm:inline">Installer sur Mobile</span>
        <span className="sm:hidden">App Mobile</span>
      </button>

      <InstallAppModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
