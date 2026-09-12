import React, { useState } from 'react';
import { 
  Calculator, 
  Layers3, 
  Package, 
  Plus, 
  Trash2, 
  Edit, 
  Download, 
  Info, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  TrendingDown,
  Building,
  RefreshCw
} from 'lucide-react';
import { BrickFloorCalculation, ProjectInfo } from '../types';

interface BrickCalculatorViewProps {
  calculations: BrickFloorCalculation[];
  project: ProjectInfo;
  onAddCalculation: (calc: BrickFloorCalculation) => void;
  onUpdateCalculation: (calc: BrickFloorCalculation) => void;
  onDeleteCalculation: (id: string) => void;
}

export const BrickCalculatorView: React.FC<BrickCalculatorViewProps> = ({
  calculations,
  project,
  onAddCalculation,
  onUpdateCalculation,
  onDeleteCalculation,
}) => {
  const BRICKS_PER_PALLET = 335; // Règle stricte demandée par l'utilisateur: 335 briques / palette

  // Interactive Live Calculator State
  const [selectedBloc, setSelectedBloc] = useState(project.blocs[0] || 'Bloc A');
  const [selectedFloor, setSelectedFloor] = useState(project.floors[1] || 'RDC');
  const [wallGrossArea, setWallGrossArea] = useState<number>(350);
  const [openingsArea, setOpeningsArea] = useState<number>(50);
  const [brickType, setBrickType] = useState<'brique_8t' | 'brique_12t' | 'double_paroi' | 'custom'>('brique_8t');
  const [customRatio, setCustomRatio] = useState<number>(17);
  const [wasteRate, setWasteRate] = useState<number>(5); // 5% de casse/chutes
  const [notes, setNotes] = useState<string>('');

  // Quick bidirectional converter
  const [quickBricks, setQuickBricks] = useState<number>(3350);
  const [quickPallets, setQuickPallets] = useState<number>(10);

  // Math derivations
  const wallNetArea = Math.max(0, wallGrossArea - openingsArea);

  const getBricksPerM2 = () => {
    switch (brickType) {
      case 'brique_8t':
        return 17;
      case 'brique_12t':
        return 17;
      case 'double_paroi':
        return 34; // 17 (12T) + 17 (8T)
      case 'custom':
        return customRatio;
      default:
        return 17;
    }
  };

  const getBrickLabel = () => {
    switch (brickType) {
      case 'brique_8t':
        return 'Brique creuse 8 trous (simple paroi)';
      case 'brique_12t':
        return 'Brique creuse 12 trous (simple paroi)';
      case 'double_paroi':
        return 'Double paroi extérieure (12T + 8T avec isolant)';
      case 'custom':
        return `Ratio personnalisé (${customRatio} briques/m²)`;
    }
  };

  const ratio = getBricksPerM2();
  const rawBricks = wallNetArea * ratio;
  const wasteBricks = rawBricks * (wasteRate / 100);
  const totalBricksNeeded = Math.ceil(rawBricks + wasteBricks);

  const palletsDecimal = totalBricksNeeded / BRICKS_PER_PALLET;
  const fullPallets = Math.floor(palletsDecimal);
  const remainingBricks = totalBricksNeeded % BRICKS_PER_PALLET;
  const palletsToOrder = remainingBricks > 0 ? fullPallets + 1 : fullPallets;

  // Estimation mortier de pose
  // Règle de l'art chantier : ~0.035 m³ de mortier par m² de maçonnerie brique 8T/12T
  const mortarVolumeM3 = parseFloat(((wallNetArea * (brickType === 'double_paroi' ? 0.065 : 0.035))).toFixed(2));
  const cementBags50kg = Math.ceil((mortarVolumeM3 * 350) / 50); // dosage 350 kg/m³
  const sandVolumeM3 = parseFloat((mortarVolumeM3 * 1.1).toFixed(2));

  const handleSaveToProject = () => {
    const newCalc: BrickFloorCalculation = {
      id: `brick-${Date.now()}`,
      bloc: selectedBloc,
      floorName: selectedFloor,
      wallAreaGross: wallGrossArea,
      openingsArea: openingsArea,
      wallAreaNet: wallNetArea,
      brickType: brickType,
      brickLabel: getBrickLabel(),
      bricksPerM2: ratio,
      wastePercentage: wasteRate,
      totalBricksNeeded: totalBricksNeeded,
      bricksPerPallet: BRICKS_PER_PALLET,
      palletsNeededDecimal: parseFloat(palletsDecimal.toFixed(2)),
      fullPallets: fullPallets,
      remainingBricks: remainingBricks,
      deliveredPallets: palletsToOrder,
      consumedPallets: 0,
      notes: notes || `Métré calculé pour ${selectedBloc} - ${selectedFloor}`,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    onAddCalculation(newCalc);
    alert(`Calcul pour ${selectedBloc} - ${selectedFloor} enregistré avec succès !`);
  };

  // Grand totals across all floors
  const totalProjectBricks = calculations.reduce((sum, c) => sum + c.totalBricksNeeded, 0);
  const totalProjectPallets = calculations.reduce((sum, c) => sum + c.palletsNeededDecimal, 0);
  const totalDeliveredPallets = calculations.reduce((sum, c) => sum + (c.deliveredPallets || 0), 0);
  const totalConsumedPallets = calculations.reduce((sum, c) => sum + (c.consumedPallets || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner with GCB Official Brick Standard */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider">
                Norme Chantier GCB
              </span>
              <span className="text-xs text-amber-400 font-mono font-semibold">
                1 Palette = 335 Briques
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-100">
              Calculateur de Briques & Palettes par Étage
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Calculez avec exactitude le cubage en briques 8 trous, 12 trous ou double paroi pour chaque étage,
              le nombre précis de palettes (335 pcs/pal) à commander et les quantités de mortier nécessaires.
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-xl flex items-center gap-4 shrink-0">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Capacité Standard</div>
              <div className="text-xl font-black text-amber-400 font-mono">335 briques</div>
              <div className="text-[10px] text-slate-400">par palette livrée</div>
            </div>
            <Package className="w-8 h-8 text-amber-400/80" />
          </div>
        </div>
      </div>

      {/* Main Interactive Calculation Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Nouveau Métré de Maçonnerie par Étage
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Ajustez les surfaces pour calculer les palettes en temps réel
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left inputs column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Bloc and Floor selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Bâtiment / Bloc *
                </label>
                <select
                  value={selectedBloc}
                  onChange={(e) => setSelectedBloc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-semibold"
                >
                  {project.blocs.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Étage / Niveau Concerne *
                </label>
                <select
                  value={selectedFloor}
                  onChange={(e) => setSelectedFloor(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-semibold"
                >
                  {project.floors.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Surfaces */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Surface Brute (m²)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={wallGrossArea}
                  onChange={(e) => setWallGrossArea(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg font-mono font-bold bg-white"
                />
                <span className="text-[10px] text-slate-400">Linéaire × Hauteur</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Déduction Baies (m²)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={openingsArea}
                  onChange={(e) => setOpeningsArea(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg font-mono font-bold bg-white text-red-600"
                />
                <span className="text-[10px] text-slate-400">Portes & fenêtres</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-900 uppercase mb-1">
                  Surface Nette (m²)
                </label>
                <div className="px-3 py-1.5 text-sm border border-amber-300 rounded-lg font-mono font-black bg-amber-50 text-amber-900">
                  {wallNetArea.toFixed(1)} m²
                </div>
                <span className="text-[10px] text-amber-700 font-medium">À maçonner</span>
              </div>
            </div>

            {/* Type de brique */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Type de Brique et Mode de Pose
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBrickType('brique_8t')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    brickType === 'brique_8t'
                      ? 'border-amber-500 bg-amber-50/70 text-slate-900 font-bold ring-2 ring-amber-400/30'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">Brique 8 Trous</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Simple paroi (10 cm)</div>
                  <div className="text-xs font-mono font-semibold text-amber-700 mt-1">17 briques / m²</div>
                </button>

                <button
                  type="button"
                  onClick={() => setBrickType('brique_12t')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    brickType === 'brique_12t'
                      ? 'border-amber-500 bg-amber-50/70 text-slate-900 font-bold ring-2 ring-amber-400/30'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">Brique 12 Trous</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Simple paroi (15 cm)</div>
                  <div className="text-xs font-mono font-semibold text-amber-700 mt-1">17 briques / m²</div>
                </button>

                <button
                  type="button"
                  onClick={() => setBrickType('double_paroi')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    brickType === 'double_paroi'
                      ? 'border-amber-500 bg-amber-50/70 text-slate-900 font-bold ring-2 ring-amber-400/30'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">Double Paroi Ext.</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">12T + isolant + 8T</div>
                  <div className="text-xs font-mono font-semibold text-amber-700 mt-1">34 briques / m²</div>
                </button>
              </div>
            </div>

            {/* Casse & Perte */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Marge de Casse & Chutes (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="1"
                    value={wasteRate}
                    onChange={(e) => setWasteRate(parseInt(e.target.value) || 0)}
                    className="flex-1 accent-amber-600"
                  />
                  <span className="font-mono text-sm font-bold w-12 text-slate-800">
                    +{wasteRate}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Standard GCB recommandé : 5% à 7%
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Remarque / Localisation exacte
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Cloisonnement F3 et F4 Est"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Right Live Results Card (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-slate-50 p-5 rounded-2xl border border-amber-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-4">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Résultat Immédiat ({selectedBloc} · {selectedFloor})
                </span>
                <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  {BRICKS_PER_PALLET} pcs/pal
                </span>
              </div>

              {/* Total Pallets to order */}
              <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs mb-3">
                <div className="text-xs text-slate-500 font-semibold uppercase">
                  Nombre de Palettes à Prévoir
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-amber-600 font-mono">
                    {palletsToOrder}
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    palettes complètes à commander
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-mono mt-1 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>Calcul exact décimal :</span>
                  <span className="font-bold text-slate-900">{palletsDecimal.toFixed(2)} palettes</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Soit : <strong className="text-slate-800">{fullPallets} palettes entières</strong> + <strong className="text-slate-800">{remainingBricks} briques</strong> en vrac.
                </div>
              </div>

              {/* Total Bricks */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs mb-3">
                <div className="text-xs text-slate-500 font-semibold uppercase">
                  Nombre Total de Briques Nécessaires
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {totalBricksNeeded.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    briques (dont ~{Math.round(wasteBricks)} de casse)
                  </span>
                </div>
              </div>

              {/* Mortier associé */}
              <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs space-y-1.5">
                <div className="font-bold text-amber-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers3 className="w-3.5 h-3.5" />
                  Mortier de Pose Estimé
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Volume mortier :</span>
                  <span className="font-mono font-bold text-white">{mortarVolumeM3} m³</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Ciment CPJ 42.5 (350 kg/m³) :</span>
                  <span className="font-mono font-bold text-amber-300">{cementBags50kg} sacs (50 kg)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Sable propre 0/4 :</span>
                  <span className="font-mono font-bold text-white">{sandVolumeM3} m³</span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 mt-2">
              <button
                type="button"
                id="save-floor-calc-btn"
                onClick={handleSaveToProject}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                Enregistrer ce métré pour l'étage
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary of all floor calculations table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Tableau Récapitulatif des Étages et Consommation Briques
            </h3>
            <p className="text-xs text-slate-500">
              Suivi des palettes calculées, livrées et posées par niveau
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-slate-100 px-3 py-1.5 rounded-lg">
              <span className="text-slate-500">Total Briques : </span>
              <strong className="text-slate-900">{totalProjectBricks.toLocaleString()}</strong>
            </div>
            <div className="bg-amber-100 px-3 py-1.5 rounded-lg text-amber-900">
              <span>Total Palettes : </span>
              <strong>{totalProjectPallets.toFixed(1)}</strong>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Bâtiment / Niveau</th>
                <th className="px-4 py-3">Type Brique</th>
                <th className="px-4 py-3">Surface Nette</th>
                <th className="px-4 py-3 text-right">Briques Calculées</th>
                <th className="px-4 py-3 text-right">Palettes (335 pcs)</th>
                <th className="px-4 py-3 text-right">Détail Palettes</th>
                <th className="px-4 py-3 text-right">Livrées</th>
                <th className="px-4 py-3 text-right">Consommées</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {calculations.map((calc) => (
                <tr key={calc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    <div>{calc.bloc} - {calc.floorName}</div>
                    {calc.notes && <div className="text-[10px] text-slate-400 font-normal">{calc.notes}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                      {calc.brickLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {calc.wallAreaNet} m²
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    {calc.totalBricksNeeded.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-extrabold text-amber-600">
                    {calc.palletsNeededDecimal.toFixed(2)} pal
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[11px] text-slate-600">
                    {calc.fullPallets} pal + {calc.remainingBricks} briques
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-blue-700">
                    {calc.deliveredPallets ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-emerald-700">
                    {calc.consumedPallets ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer le calcul pour ${calc.bloc} - ${calc.floorName} ?`)) {
                          onDeleteCalculation(calc.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {calculations.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    Aucun calcul d'étage enregistré pour l'instant. Utilisez le formulaire ci-dessus.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Bidirectional Converter tool */}
      <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Convertisseur Rapide de Chantier (335 briques / palette)
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-slate-500 font-medium">Nombre de Briques :</span>
              <input
                type="number"
                value={quickBricks}
                onChange={(e) => {
                  const b = parseInt(e.target.value) || 0;
                  setQuickBricks(b);
                  setQuickPallets(parseFloat((b / BRICKS_PER_PALLET).toFixed(2)));
                }}
                className="w-28 px-2 py-1 border rounded text-sm font-mono font-bold block mt-1"
              />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="text-right">
              <span className="text-slate-500 font-medium">Équivalent en Palettes :</span>
              <div className="text-base font-black text-amber-600 font-mono mt-1">
                {(quickBricks / BRICKS_PER_PALLET).toFixed(2)} pal
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-slate-500 font-medium">Nombre de Palettes :</span>
              <input
                type="number"
                value={quickPallets}
                onChange={(e) => {
                  const p = parseFloat(e.target.value) || 0;
                  setQuickPallets(p);
                  setQuickBricks(Math.round(p * BRICKS_PER_PALLET));
                }}
                className="w-28 px-2 py-1 border rounded text-sm font-mono font-bold block mt-1"
              />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="text-right">
              <span className="text-slate-500 font-medium">Équivalent en Briques :</span>
              <div className="text-base font-black text-slate-900 font-mono mt-1">
                {Math.round(quickPallets * BRICKS_PER_PALLET).toLocaleString()} pcs
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
