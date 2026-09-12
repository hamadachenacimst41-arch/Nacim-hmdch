import React from 'react';
import { Sparkles, BookOpen, Layers, Ruler, Users, ShieldCheck, Calculator } from 'lucide-react';

interface EngineeringToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EngineeringToolsModal: React.FC<EngineeringToolsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Abaques & Normes Techniques GCB (DTR)</h3>
              <p className="text-xs text-slate-400">Règles de l'art, cadences et tolérances d'exécution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs text-slate-700">
          {/* Section 1: Standard Briques GCB */}
          <div className="bg-amber-500/10 border border-amber-300 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm mb-2">
              <Calculator className="w-4 h-4 text-amber-700" />
              Standard Briques & Palettes (Chantier GCB)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border border-amber-200">
                <span className="font-bold text-slate-900 block text-xs">Capacité Palette Standard</span>
                <span className="text-base font-black text-amber-600 font-mono">335 briques / palette</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Norme certifiée pour le chargement et le déchargement par grue / manitou.
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-amber-200">
                <span className="font-bold text-slate-900 block text-xs">Ratios de Consommation au m²</span>
                <ul className="text-[11px] space-y-0.5 mt-1 font-mono">
                  <li>• Brique 8T (simple paroi) : <strong>17 pcs / m²</strong></li>
                  <li>• Brique 12T (simple paroi) : <strong>17 pcs / m²</strong></li>
                  <li>• Double paroi (12T + 8T) : <strong>34 pcs / m²</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Cadences moyennes par binôme */}
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              Rendements Moyens de Production (Binôme 1 Maçon + 1 Manœuvre)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">Maçonnerie Brique 8T/12T</span>
                <div className="text-emerald-700 font-mono font-black text-sm mt-0.5">
                  14 à 18 m² / jour
                </div>
                <div className="text-[11px] text-slate-500">Soit ~1 à 1.5 palette posée/jour/binôme</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">Enduit Ciment Intérieur (Corps + Finition)</span>
                <div className="text-emerald-700 font-mono font-black text-sm mt-0.5">
                  20 à 25 m² / jour
                </div>
                <div className="text-[11px] text-slate-500">Avec dressage parfait à la règle</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">Revêtement Sol Carrelage 45x45</span>
                <div className="text-emerald-700 font-mono font-black text-sm mt-0.5">
                  18 à 22 m² / jour
                </div>
                <div className="text-[11px] text-slate-500">Pose à niveau avec joints 2-3 mm</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">Faïence Murale (SDB / Cuisine)</span>
                <div className="text-emerald-700 font-mono font-black text-sm mt-0.5">
                  10 à 14 m² / jour
                </div>
                <div className="text-[11px] text-slate-500">Double encollage et calepinage soigné</div>
              </div>
            </div>
          </div>

          {/* Section 3: Tolérances DTR */}
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-2">
              <Ruler className="w-4 h-4 text-emerald-600" />
              Tolérances d'Exécution DTR (Critères d'Acceptation & Refus)
            </div>
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                <span className="font-medium text-slate-800">Verticalité / Aplomb des cloisons :</span>
                <span className="font-mono font-bold text-slate-900">&le; 5 mm sous règle de 2m (Max 10 mm/étage)</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                <span className="font-medium text-slate-800">Planéité des enduits talochés :</span>
                <span className="font-mono font-bold text-slate-900">&le; 5 mm sous la règle de 2 m</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                <span className="font-medium text-slate-800">Désaffleurement entre carreaux :</span>
                <span className="font-mono font-bold text-slate-900">&le; 1 mm (défaut de planéité local)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-800">Mortier de pose pour briques :</span>
                <span className="font-mono font-bold text-slate-900">Dosage 350 kg de ciment CPJ par m³ de sable</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
