import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  CheckCircle2, 
  TrendingUp, 
  Edit3, 
  Building, 
  Calendar, 
  User, 
  Trash2, 
  ArrowUpRight,
  Maximize2
} from 'lucide-react';
import { FinishingLot, Subcontractor, ProjectInfo, UserRole } from '../types';

interface FinishingProgressViewProps {
  finishingLots: FinishingLot[];
  subcontractors: Subcontractor[];
  project: ProjectInfo;
  onAddLot: (lot: FinishingLot) => void;
  onUpdateLot: (lot: FinishingLot) => void;
  onDeleteLot: (id: string) => void;
  userRole?: UserRole;
}

export const FinishingProgressView: React.FC<FinishingProgressViewProps> = ({
  finishingLots,
  subcontractors,
  project,
  onAddLot,
  onUpdateLot,
  onDeleteLot,
  userRole = 'superviseur',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<FinishingLot | null>(null);

  // Quick meter update modal
  const [quickUpdateLot, setQuickUpdateLot] = useState<FinishingLot | null>(null);
  const [addedM2, setAddedM2] = useState<number>(100);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<any>('enduit_interieur');
  const [totalContractArea, setTotalContractArea] = useState<number>(10000);
  const [completedArea, setCompletedArea] = useState<number>(2000);
  const [subcontractorId, setSubcontractorId] = useState(subcontractors[0]?.id || '');
  const [assignedBlocs, setAssignedBlocs] = useState('Bloc A, Bloc B');
  const [targetDate, setTargetDate] = useState('2025-10-31');
  const [notes, setNotes] = useState('');

  // Overall calculations across all finishing lots
  const grandTotalM2 = finishingLots.reduce((sum, l) => sum + l.totalContractArea, 0);
  const grandCompletedM2 = finishingLots.reduce((sum, l) => sum + l.completedArea, 0);
  const grandRemainingM2 = Math.max(0, grandTotalM2 - grandCompletedM2);
  const globalFinishingRate = grandTotalM2 > 0 ? (grandCompletedM2 / grandTotalM2) * 100 : 0;

  const handleOpenAdd = () => {
    setEditingLot(null);
    setName('');
    setCategory('enduit_interieur');
    setTotalContractArea(5000);
    setCompletedArea(0);
    setSubcontractorId(subcontractors[0]?.id || '');
    setAssignedBlocs(project.blocs.join(', '));
    setTargetDate('2025-11-30');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lot: FinishingLot) => {
    setEditingLot(lot);
    setName(lot.name);
    setCategory(lot.category);
    setTotalContractArea(lot.totalContractArea);
    setCompletedArea(lot.completedArea);
    setSubcontractorId(lot.subcontractorId);
    setAssignedBlocs(lot.assignedBlocs);
    setTargetDate(lot.targetDate);
    setNotes(lot.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = subcontractors.find((s) => s.id === subcontractorId);
    const subName = sub ? sub.name : 'Sous-traitant';

    const lotData: FinishingLot = {
      id: editingLot ? editingLot.id : `fin-${Date.now()}`,
      name,
      category,
      unit: 'm²',
      totalContractArea,
      completedArea,
      subcontractorId,
      subcontractorName: subName,
      assignedBlocs,
      targetDate,
      notes,
    };

    if (editingLot) {
      onUpdateLot(lotData);
    } else {
      onAddLot(lotData);
    }

    setIsModalOpen(false);
  };

  const handleQuickAddM2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUpdateLot) return;
    const newCompleted = Math.min(quickUpdateLot.totalContractArea, quickUpdateLot.completedArea + addedM2);
    const updated = {
      ...quickUpdateLot,
      completedArea: parseFloat(newCompleted.toFixed(1)),
    };
    onUpdateLot(updated);
    setQuickUpdateLot(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Global Finishing Metrics */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500 text-white font-bold text-xs uppercase tracking-wider">
                Suivi Métré Finition
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Surfaces Totales vs Réalisées (m²)
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-100">
              Avancement des Lots de Finition par Surface Totale (m²)
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              Suivi précis des surfaces contractuelles, métrés cumulés exécutés et cadences
              pour l'ensemble des corps d'état secondaires : enduits, carrelage, faïence, peinture et faux-plafonds.
            </p>
          </div>

          {/* Grand Gauge */}
          <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-xl shrink-0 w-full sm:w-72">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-semibold uppercase">Taux Global Finitions</span>
              <span className="text-lg font-black text-amber-400 font-mono">
                {globalFinishingRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, globalFinishingRate))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-700">
              <span>{grandCompletedM2.toLocaleString()} m² faits</span>
              <span>Total : {grandTotalM2.toLocaleString()} m²</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Surface Totale Prévue</span>
            <Maximize2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {grandTotalM2.toLocaleString()} <span className="text-xs font-normal text-slate-500">m²</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Sur l'ensemble des bâtiments</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Surface Réalisée à Date</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {grandCompletedM2.toLocaleString()} <span className="text-xs font-normal text-emerald-600">m²</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Validé sur attachements de chantier</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Reste à Réaliser</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {grandRemainingM2.toLocaleString()} <span className="text-xs font-normal text-amber-600">m²</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Solde restant à planifier</div>
        </div>
      </div>

      {/* Toolbar & Add Lot */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            Détail des Lots de Finition ({finishingLots.length} lots sous contrat)
          </h3>
          <p className="text-xs text-slate-500">
            Suivi individuel par ouvrage, métré restant et sous-traitant responsable
          </p>
        </div>

        {userRole === 'superviseur' ? (
          <button
            onClick={handleOpenAdd}
            id="add-finishing-lot-btn"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs sm:text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Ajouter un Lot de Finition
          </button>
        ) : (
          <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg font-bold">
            Mode Responsable · Consultation des métrés
          </span>
        )}
      </div>

      {/* Finishing Lots Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {finishingLots.map((lot) => {
          const pct = lot.totalContractArea > 0 ? (lot.completedArea / lot.totalContractArea) * 100 : 0;
          const remainingM2 = Math.max(0, lot.totalContractArea - lot.completedArea);

          return (
            <div
              key={lot.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs p-5 flex flex-col justify-between transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-base text-slate-900">
                      {lot.name}
                    </h4>
                    <div className="text-xs text-amber-700 font-semibold mt-0.5">
                      Sous-traitant : {lot.subcontractorName}
                    </div>
                  </div>

                  {userRole === 'superviseur' ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setQuickUpdateLot(lot);
                          setAddedM2(50);
                        }}
                        title="Ajouter un métré réalisé"
                        className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 rounded text-xs font-bold"
                      >
                        + m² fait
                      </button>
                      <button
                        onClick={() => handleOpenEdit(lot)}
                        title="Modifier"
                        className="p-1.5 text-slate-400 hover:text-slate-800 rounded"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer le lot "${lot.name}" ?`)) {
                            onDeleteLot(lot.id);
                          }
                        }}
                        title="Supprimer"
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      Lot sous contrat
                    </span>
                  )}
                </div>

                {/* Blocs and Target date */}
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 bg-slate-50 p-2 rounded-lg">
                  <span className="flex items-center gap-1 font-medium">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {lot.assignedBlocs}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Objectif : {lot.targetDate}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Taux d'Avancement Réalisé</span>
                    <span className="font-black text-slate-900 font-mono text-sm">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-150 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                    />
                  </div>
                </div>

                {/* Surface detail numbers */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-slate-50 rounded-xl border border-slate-150">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Prévu Total</span>
                    <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">
                      {lot.totalContractArea.toLocaleString()} m²
                    </span>
                  </div>
                  <div className="border-x border-slate-200">
                    <span className="text-[10px] text-emerald-600 uppercase font-semibold block">Exécuté</span>
                    <span className="font-black text-emerald-700 font-mono text-xs sm:text-sm">
                      {lot.completedArea.toLocaleString()} m²
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-600 uppercase font-semibold block">Reste à Faire</span>
                    <span className="font-bold text-amber-700 font-mono text-xs sm:text-sm">
                      {remainingM2.toLocaleString()} m²
                    </span>
                  </div>
                </div>
              </div>

              {lot.notes && (
                <div className="text-[11px] text-slate-500 italic mt-3 pt-2 border-t border-slate-100">
                  {lot.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Add M2 Modal */}
      {quickUpdateLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                Ajouter un Métré Réalisé · {quickUpdateLot.name}
              </h3>
              <button
                onClick={() => setQuickUpdateLot(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleQuickAddM2} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Surface Totale :</span>
                  <strong className="font-mono">{quickUpdateLot.totalContractArea} m²</strong>
                </div>
                <div className="flex justify-between">
                  <span>Surface Réalisée Actuelle :</span>
                  <strong className="font-mono text-emerald-700">{quickUpdateLot.completedArea} m²</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Métré Supplémentaire Exécuté Aujourd'hui (m²) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  required
                  value={addedM2}
                  onChange={(e) => setAddedM2(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-base font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden text-amber-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setQuickUpdateLot(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-sm"
                >
                  Confirmer l'ajout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Lot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-lg">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingLot ? 'Modifier le Lot de Finition' : 'Nouveau Lot de Finition'}
                  </h3>
                  <p className="text-xs text-slate-400">Surface totale contractuelle et suivi des métrés</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Intitulé du Lot / Ouvrage *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Enduit ciment intérieur, Revêtement sol carrelage 45x45..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Sous-Traitant Responsable *
                  </label>
                  <select
                    required
                    value={subcontractorId}
                    onChange={(e) => setSubcontractorId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-semibold"
                  >
                    {subcontractors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.trade})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Date Objectif de Finition
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Surface Totale Contractuelle (m²) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={totalContractArea}
                    onChange={(e) => setTotalContractArea(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-mono font-bold text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">
                    Surface Réalisée à ce jour (m²) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={completedArea}
                    onChange={(e) => setCompletedArea(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-hidden font-mono font-bold text-emerald-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Bâtiments / Blocs Concernés
                </label>
                <input
                  type="text"
                  value={assignedBlocs}
                  onChange={(e) => setAssignedBlocs(e.target.value)}
                  placeholder="Ex: Bloc A & Bloc B (Du RDC au 4ème)"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Notes & Conditions particulières
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Spécifications mortier-colle C2, pose avec croisillons 3mm..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-sm shadow-sm"
                >
                  {editingLot ? 'Mettre à jour' : 'Créer le lot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
