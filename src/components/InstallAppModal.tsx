import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  X, 
  Share2, 
  PlusSquare, 
  MoreVertical, 
  CheckCircle2, 
  Copy, 
  Check, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'share'>('android');

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDirectInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500/20 via-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-md shadow-amber-500/20">
              GCB
            </div>
            <div>
              <h3 className="font-extrabold text-base text-amber-400">
                تثبيت التطبيق على الهاتف (Application Mobile PWA)
              </h3>
              <p className="text-xs text-slate-300">
                Installer GCB Suivi Chantier sur Android ou iPhone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Direct 1-Click Install Button if supported by current browser */}
          {isInstallable && (
            <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-amber-500/20">
              <div>
                <div className="font-black text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>تثبيت فوري بضغطة زر واحدة</span>
                </div>
                <div className="text-xs font-medium text-slate-900 mt-0.5">
                  متصفحك يدعم التثبيت المباشر على الشاشة الرئيسية لهاتفك الآن
                </div>
              </div>
              <button
                onClick={handleDirectInstall}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold rounded-lg text-xs transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Installer sur Téléphone</span>
              </button>
            </div>
          )}

          {/* Already installed banner */}
          {isInstalled && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>التطبيق مثبت بالفعل ويعمل كـ Application Standalone على هذا الجهاز.</span>
            </div>
          )}

          {/* OS Switcher Tabs */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'android'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>هواتف أندرويد (Android)</span>
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'ios'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>آيفون (iPhone / iPad)</span>
            </button>
            <button
              onClick={() => setActiveTab('share')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'share'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة الرابط</span>
            </button>
          </div>

          {/* Tab 1: Android Guide */}
          {activeTab === 'android' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/80 space-y-3">
                <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-black">1</span>
                  <span>خطوات التثبيت على هواتف أندرويد (Google Chrome / Samsung Internet) :</span>
                </h4>
                
                <ol className="space-y-3 pr-2 text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-amber-400">1.</span>
                    <div>
                      افتح رابط التطبيق في هاتفك عبر متصفح <strong>Google Chrome</strong>.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-amber-400">2.</span>
                    <div>
                      اضغط على قائمة الخيارات (الثلاث نقاط الرأسية <MoreVertical className="w-3.5 h-3.5 inline text-amber-400" /> في أعلى يمين أو يسار المتصفح).
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-amber-400">3.</span>
                    <div>
                      اختر <strong className="text-white bg-slate-700 px-1.5 py-0.5 rounded border border-slate-600">« Installer l'application »</strong> أو <strong className="text-white bg-slate-700 px-1.5 py-0.5 rounded border border-slate-600">« Ajouter à l'écran d'accueil »</strong> (إضافة إلى الشاشة الرئيسية).
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-amber-400">4.</span>
                    <div>
                      اضغط على <strong>« Installer »</strong> أو <strong>« Ajouter »</strong>.
                    </div>
                  </li>
                </ol>

                <div className="mt-3 p-3 bg-slate-900/90 rounded-lg border border-slate-700 text-[11px] text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>سيظهر تطبيق <strong>GCB Suivi</strong> فوراً كأيقونة تطبيق حقيقي في شاشة هاتفك مع باقي التطبيقات، ويفتح بشاشة كاملة وبدون شريط المتصفح.</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: iPhone iOS Guide */}
          {activeTab === 'ios' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/80 space-y-3">
                <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-black">1</span>
                  <span>خطوات التثبيت على هواتف آيفون (Apple Safari) :</span>
                </h4>
                
                <ol className="space-y-3 pr-2 text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-amber-400">1.</span>
                    <div>
                      افتح رابط التطبيق عبر متصفح <strong>Safari</strong> الأصلي على جهاز الـ iPhone.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-amber-400">2.</span>
                    <div>
                      اضغط على زر المشاركة بالأسفل (<Share2 className="w-3.5 h-3.5 inline text-amber-400" /> <strong>Bouton Partager</strong>).
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-amber-400">3.</span>
                    <div>
                      مرر القائمة لأسفل واختر <strong className="text-white bg-slate-700 px-1.5 py-0.5 rounded border border-slate-600">« Sur l'écran d'accueil »</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-amber-400" /> Add to Home Screen).
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-amber-400">4.</span>
                    <div>
                      اضغط على <strong>« Ajouter »</strong> في أعلى اليمين.
                    </div>
                  </li>
                </ol>

                <div className="mt-3 p-3 bg-slate-900/90 rounded-lg border border-slate-700 text-[11px] text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>سيضاف التطبيق مباشرة إلى شاشة هاتفك الرئيسية، ويعمل بتجربة تطبيق Native سريع ومستقر.</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Share Link */}
          {activeTab === 'share' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/80 space-y-3">
                <h4 className="font-bold text-amber-400 text-sm">
                  مشاركة رابط التطبيق مع طاقم الورشة والمشرفين :
                </h4>
                <p className="text-slate-300">
                  انسخ هذا الرابط وأرسله عبر WhatsApp أو البريد الإلكتروني لأي مشرف أو مسؤول لفتحه وتثبيته على هاتفه في ثوانٍ معدودة:
                </p>

                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-700">
                  <span className="font-mono text-xs text-amber-300 truncate flex-1 select-all">
                    {currentUrl}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-slate-950" />
                        <span>تم النسخ !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الرابط</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Key Advantages of Mobile PWA for GCB Construction Sites */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-200">بدون Play Store</div>
                <div className="text-slate-400 text-[10px]">تثبيت فوري بدون تعقيدات المتاجر</div>
              </div>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-200">سريع في الورشة</div>
                <div className="text-slate-400 text-[10px]">تخزين مؤقت للبيانات لسرعة فائقة</div>
              </div>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-200">تحديثات تلقائية</div>
                <div className="text-slate-400 text-[10px]">أي تعديل أو ميزة تظهر مباشرة</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            GCB · Plateforme Mobile Suivi Chantier
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Fermer (إغلاق)
          </button>
        </div>

      </div>
    </div>
  );
};
