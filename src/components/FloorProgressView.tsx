import React, { useState, useMemo } from 'react';
import {
  Building,
  Layers,
  Plus,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  Filter,
  BarChart3,
  Calculator,
  ChevronRight,
  HardHat,
  ArrowUpRight,
  Check
} from 'lucide-react';
import { FloorWorkProgress, ProjectInfo, Subcontractor, UserRole } from '../types';

interface FloorProgressViewProps {
  floorProgresses: FloorWorkProgress[];
  project: ProjectInfo;
  subcontractors: Subcontractor[];
  onAddFloorProgress: (item: FloorWorkProgress) => void;
  onUpdateFloorProgress: (item: FloorWorkProgress) => void;
  onDeleteFloorProgress: (id: string) => void;
  userRole?: UserRole;
}

const COMMON_WORK_TYPES = [
  { label: 'Maçonnerie Brique 8T & 12T', defaultUnit: 'm²', color: 'amber' },
  { label: 'Enduit / Crépissage Ciment', defaultUnit: 'm²', color: 'blue' },
  { label: 'Finition Plâtre Intérieur', defaultUnit: 'm²', color: 'emerald' },
  { label: 'Revêtement Carrelage Sol', defaultUnit: 'm²', color: 'indigo' },
  { label: 'Faïence Murale (SDB / Cuisine)', defaultUnit: 'm²', color: 'teal' },
  { label: 'Peinture Intérieure', defaultUnit: 'm²', color: 'purple' },
  { label: 'Étanchéité Terrasse / Sous-Sol', defaultUnit: 'm²', color: 'cyan' },
  { label: 'Faux-Plafond BA13', defaultUnit: 'm²', color: 'rose' },
];

export const FloorProgressView: React.FC<FloorProgressViewProps> = ({
  floorProgresses,
  project,
  subcontractors,
  onAddFloorProgress,
  onUpdateFloorProgress,
  onDeleteFloorProgress,
  userRole = 'superviseur',
}) => {
  // Filter states
  const [selectedBloc, setSelectedBloc] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedWorkType, setSelectedWorkType] = useState<string>('all');

  // Modal State for New / Edit Work Area
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FloorWorkProgress | null>(null);

  // Form states for creating / editing an item
  const [formBloc, setFormBloc] = useState<string>(project.blocs[0] || 'Bloc A');
  const [formFloor, setFormFloor] = useState<string>(project.floors[0] || 'Sous-Sol');
  const [formWorkType, setFormWorkType] = useState<string>('Maçonnerie Brique 8T & 12T');
  const [customWorkType, setCustomWorkType] = useState<string>('');
  const [formUnit, setFormUnit] = useState<string>('m²');
  const [formTotalTargetArea, setFormTotalTargetArea] = useState<number>(600);
  const [formCompletedArea, setFormCompletedArea] = useState<number>(0);
  const [formSubcontractor, setFormSubcontractor] = useState<string>(subcontractors[0]?.name || '');
  const [formNotes, setFormNotes] = useState<string>('');

  // Daily Quick Input Modal state
  const [quickInputItem, setQuickInputItem] = useState<FloorWorkProgress | null>(null);
  const [quickDailyAmount, setQuickDailyAmount] = useState<number>(45);
  const [quickDate, setQuickDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [quickNotes, setQuickNotes] = useState<string>('');

  // Open modal to add new
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormBloc(selectedBloc !== 'all' ? selectedBloc : project.blocs[0] || 'Bloc A');
    setFormFloor(selectedFloor !== 'all' ? selectedFloor : project.floors[0] || 'Sous-Sol');
    setFormWorkType('Maçonnerie Brique 8T & 12T');
    setCustomWorkType('');
    setFormUnit('m²');
    setFormTotalTargetArea(550);
    setFormCompletedArea(0);
    setFormSubcontractor(subcontractors[0]?.name || '');
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Open modal to edit existing
  const handleOpenEdit = (item: FloorWorkProgress) => {
    setEditingItem(item);
    setFormBloc(item.bloc);
    setFormFloor(item.floor);
    const isStandard = COMMON_WORK_TYPES.some((t) => t.label === item.workType);
    if (isStandard) {
      setFormWorkType(item.workType);
      setCustomWorkType('');
    } else {
      setFormWorkType('Autre');
      setCustomWorkType(item.workType);
    }
    setFormUnit(item.unit || 'm²');
    setFormTotalTargetArea(item.totalTargetArea);
    setFormCompletedArea(item.completedArea);
    setFormSubcontractor(item.subcontractorName || '');
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  // Submit add/edit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalWorkType = formWorkType === 'Autre' && customWorkType.trim() ? customWorkType.trim() : formWorkType;

    const newItem: FloorWorkProgress = {
      id: editingItem ? editingItem.id : `fwp-${Date.now()}`,
      bloc: formBloc,
      floor: formFloor,
      workType: finalWorkType,
      unit: formUnit,
      totalTargetArea: Math.max(0.1, formTotalTargetArea),
      completedArea: Math.max(0, Math.min(formTotalTargetArea, formCompletedArea)),
      subcontractorName: formSubcontractor,
      notes: formNotes,
      lastUpdatedDate: new Date().toISOString().slice(0, 10),
      dailyInputs: editingItem?.dailyInputs || [],
    };

    if (editingItem) {
      onUpdateFloorProgress(newItem);
    } else {
      onAddFloorProgress(newItem);
    }

    setIsModalOpen(false);
  };

  // Open quick daily input modal
  const handleOpenQuickInput = (item: FloorWorkProgress) => {
    setQuickInputItem(item);
    setQuickDailyAmount(50);
    setQuickDate(new Date().toISOString().slice(0, 10));
    setQuickNotes('');
  };

  // Save daily input and update completed area
  const handleSaveDailyInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInputItem) return;

    const newCompleted = Math.min(
      quickInputItem.totalTargetArea,
      parseFloat((quickInputItem.completedArea + quickDailyAmount).toFixed(2))
    );

    const newDailyEntry = {
      id: `in-${Date.now()}`,
      date: quickDate,
      amountAchieved: quickDailyAmount,
      notes: quickNotes || `Saisie journalière de ${quickDailyAmount} ${quickInputItem.unit}`,
    };

    const updatedItem: FloorWorkProgress = {
      ...quickInputItem,
      completedArea: newCompleted,
      lastUpdatedDate: quickDate,
      dailyInputs: [newDailyEntry, ...(quickInputItem.dailyInputs || [])],
    };

    onUpdateFloorProgress(updatedItem);
    setQuickInputItem(null);
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return floorProgresses.filter((item) => {
      if (selectedBloc !== 'all' && item.bloc !== selectedBloc) return false;
      if (selectedFloor !== 'all' && item.floor !== selectedFloor) return false;
      if (selectedWorkType !== 'all' && item.workType !== selectedWorkType) return false;
      return true;
    });
  }, [floorProgresses, selectedBloc, selectedFloor, selectedWorkType]);

  // Aggregate stats
  const totalTargetAll = filteredItems.reduce((sum, it) => sum + it.totalTargetArea, 0);
  const totalCompletedAll = filteredItems.reduce((sum, it) => sum + it.completedArea, 0);
  const globalProgressRate = totalTargetAll > 0 ? (totalCompletedAll / totalTargetAll) * 100 : 0;

  // Breakdown by Bloc
  const blocStats = useMemo(() => {
    const map = new Map<string, { target: number; completed: number; itemsCount: number }>();
    project.blocs.forEach((b) => map.set(b, { target: 0, completed: 0, itemsCount: 0 }));

    floorProgresses.forEach((item) => {
      const current = map.get(item.bloc) || { target: 0, completed: 0, itemsCount: 0 };
      current.target += item.totalTargetArea;
      current.completed += item.completedArea;
      current.itemsCount += 1;
      map.set(item.bloc, current);
    });

    return Array.from(map.entries()).map(([bloc, data]) => ({
      bloc,
      target: data.target,
      completed: data.completed,
      pct: data.target > 0 ? (data.completed / data.target) * 100 : 0,
      itemsCount: data.itemsCount,
    }));
  }, [floorProgresses, project.blocs]);

  // List of distinct work types in database
  const distinctWorkTypes = useMemo(() => {
    const set = new Set<string>();
    floorProgresses.forEach((it) => set.add(it.workType));
    return Array.from(set);
  }, [floorProgresses]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider">
                Suivi Par Niveau & Par Bâtiment
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Maçonnerie · Crépissage · Finitions
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
              <Building className="w-6 h-6 text-amber-400" />
              Avancement Détaillé par Étage & par Bloc (Métrés & Pourcentages)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Définissez pour chaque étage la surface totale requise (m²) pour chaque type d'ouvrage 
              (Maçonnerie, Enduit/Crépissage, Carrelage, etc.) et enregistrez le pointage journalier. 
              L'application calcule automatiquement les taux d'avancement exacts par étage, par bloc et pour tout le projet.
            </p>
          </div>

          {/* Overall Gauge */}
          <div className="bg-slate-800/95 border border-slate-700 p-4 rounded-xl shrink-0 w-full sm:w-80 shadow-lg">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider">
                {selectedBloc === 'all' ? 'Taux Global Tout Chantier' : `Avancement ${selectedBloc}`}
              </span>
              <span className="text-xl font-black text-amber-400 font-mono">
                {globalProgressRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-3.5 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, globalProgressRate))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-300 font-mono mt-2 pt-2 border-t border-slate-700">
              <span>{totalCompletedAll.toLocaleString()} m² exécutés</span>
              <span>Total : {totalTargetAll.toLocaleString()} m²</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bloc Progress Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {blocStats.map((b) => (
          <button
            key={b.bloc}
            type="button"
            onClick={() => setSelectedBloc(selectedBloc === b.bloc ? 'all' : b.bloc)}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              selectedBloc === b.bloc
                ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400'
                : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                {b.bloc}
              </span>
              <span className="text-xs font-black font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                {b.pct.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, b.pct))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-2">
              <span>{b.completed.toLocaleString()} / {b.target.toLocaleString()} m²</span>
              <span className="text-[10px] text-slate-400">{b.itemsCount} poste(s)</span>
            </div>
          </button>
        ))}
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-black text-slate-800 uppercase">
              Filtres & Sélection d'Affichage :
            </span>
          </div>

          {userRole === 'superviseur' && (
            <button
              type="button"
              onClick={handleOpenAdd}
              id="add-floor-progress-btn"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-xs shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Poste par Étage</span>
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Bloc Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Bâtiment / Bloc
            </label>
            <select
              value={selectedBloc}
              onChange={(e) => setSelectedBloc(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden bg-white font-medium"
            >
              <option value="all">Tous les Bâtiments (Chantier Global)</option>
              {project.blocs.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Floor Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Étage / Niveau
            </label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden bg-white font-medium"
            >
              <option value="all">Tous les Étages</option>
              {project.floors.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Work Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Type de Travail / Ouvrage
            </label>
            <select
              value={selectedWorkType}
              onChange={(e) => setSelectedWorkType(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden bg-white font-medium"
            >
              <option value="all">Tous les Ouvrages (Maçonnerie, Finitions...)</option>
              {distinctWorkTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main List of Floor Progresses */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <Building className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">
            Aucun poste d'avancement par étage correspondant aux filtres
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Sélectionnez un autre filtre ou cliquez sur "Nouveau Poste par Étage" pour définir 
            les surfaces (m²) pour vos blocs et étages.
          </p>
          {userRole === 'superviseur' && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs"
            >
              <Plus className="w-4 h-4" />
              Ajouter un Niveau & Surface
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const percentage = item.totalTargetArea > 0 ? (item.completedArea / item.totalTargetArea) * 100 : 0;
            const remainingArea = Math.max(0, item.totalTargetArea - item.completedArea);
            const isCompleted = percentage >= 100;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs p-5 flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Card Header: Bloc + Floor + WorkType */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-amber-950 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                          {item.bloc}
                        </span>
                        <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.floor}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base mt-1.5">
                        {item.workType}
                      </h4>
                      {item.subcontractorName && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <HardHat className="w-3.5 h-3.5 text-amber-600" />
                          <span>Exécuté par : <strong>{item.subcontractorName}</strong></span>
                        </p>
                      )}
                    </div>

                    {/* Progress Badge */}
                    <div className="text-right shrink-0">
                      <span className={`inline-block font-mono font-black text-lg px-2.5 py-1 rounded-xl ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : percentage > 50
                          ? 'bg-amber-100 text-amber-950 border border-amber-300'
                          : 'bg-slate-100 text-slate-800 border border-slate-300'
                      }`}>
                        {percentage.toFixed(1)}%
                      </span>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                        {isCompleted ? 'Achevé' : 'En cours'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-mono text-slate-600">
                      <span className="font-bold text-slate-900">
                        {item.completedArea.toLocaleString()} {item.unit} réalisés
                      </span>
                      <span className="text-slate-500">
                        Total requis : <strong>{item.totalTargetArea.toLocaleString()} {item.unit}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Stat Highlights */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-3">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Reste à faire :</span>
                      <span className="font-mono font-bold text-amber-800">
                        {remainingArea.toLocaleString()} {item.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Dernière mise à jour :</span>
                      <span className="font-mono text-slate-700 text-[11px]">
                        {item.lastUpdatedDate || 'Aujourd\'hui'}
                      </span>
                    </div>
                  </div>

                  {/* Notes if any */}
                  {item.notes && (
                    <p className="text-[11px] text-slate-600 italic bg-amber-50/60 p-2 rounded-lg border border-amber-200/70 mb-3">
                      "{item.notes}"
                    </p>
                  )}

                  {/* Recent daily entries log */}
                  {item.dailyInputs && item.dailyInputs.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Dernières Saisies Journalières :
                      </span>
                      <div className="space-y-1">
                        {item.dailyInputs.slice(0, 2).map((di) => (
                          <div key={di.id} className="flex items-center justify-between text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-100">
                            <span>{di.date}</span>
                            <span className="font-bold text-emerald-700">+{di.amountAchieved} {item.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions bottom bar */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                  {userRole === 'superviseur' ? (
                    <div className="flex items-center gap-2 w-full justify-between">
                      {/* Quick Daily Pointing Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenQuickInput(item)}
                        disabled={isCompleted}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
                        }`}
                        title="Ajouter la quantité réalisée aujourd'hui"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Saisir Avancement Jour (+{item.unit})</span>
                      </button>

                      {/* Edit / Delete Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Modifier les surfaces totales ou informations"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Supprimer le poste d'avancement "${item.workType}" pour ${item.bloc} - ${item.floor} ?`)) {
                              onDeleteFloorProgress(item.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer ce poste"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">
                      Mode consultation responsable
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT FLOOR WORK AREA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-base">
                  {editingItem ? 'Modifier le Poste d\'Étage' : 'Nouveau Poste de Travaux par Étage'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Bloc & Floor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Bâtiment / Bloc *
                  </label>
                  <select
                    required
                    value={formBloc}
                    onChange={(e) => setFormBloc(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden bg-white"
                  >
                    {project.blocs.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Étage / Niveau *
                  </label>
                  <select
                    required
                    value={formFloor}
                    onChange={(e) => setFormFloor(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden bg-white"
                  >
                    {project.floors.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Work Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Type de Travail / Ouvrage *
                </label>
                <select
                  value={formWorkType}
                  onChange={(e) => setFormWorkType(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden bg-white"
                >
                  {COMMON_WORK_TYPES.map((t) => (
                    <option key={t.label} value={t.label}>
                      {t.label}
                    </option>
                  ))}
                  <option value="Autre">Autre travail personnalisé...</option>
                </select>

                {formWorkType === 'Autre' && (
                  <input
                    type="text"
                    required
                    placeholder="Ex: Enduit monocouche, Faux-plafond démontable..."
                    value={customWorkType}
                    onChange={(e) => setCustomWorkType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden bg-white mt-2"
                  />
                )}
              </div>

              {/* Surfaces & Units */}
              <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-xl space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-black text-amber-950 uppercase mb-1">
                      Surface Totale Prévue ({formUnit}) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      required
                      value={formTotalTargetArea}
                      onChange={(e) => setFormTotalTargetArea(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-base font-mono font-black border-2 border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden bg-white text-slate-900"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Métré global requis pour cet étage
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Unité
                    </label>
                    <select
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="m²">m² (Mètres Carrés)</option>
                      <option value="ml">ml (Mètres Linéaires)</option>
                      <option value="pièces">pièces / unités</option>
                    </select>
                  </div>
                </div>

                {/* Already Completed Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Surface Déjà Réalisée à ce jour ({formUnit})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max={formTotalTargetArea}
                    value={formCompletedArea}
                    onChange={(e) => setFormCompletedArea(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden bg-white text-slate-900"
                  />
                </div>

                {/* Calculated Live Result */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-200">
                  <span className="text-slate-600 font-bold uppercase text-[10px]">
                    Taux d'avancement calculé :
                  </span>
                  <span className="font-mono font-black text-amber-950 text-sm">
                    {formTotalTargetArea > 0 ? ((formCompletedArea / formTotalTargetArea) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              {/* Subcontractor Assignment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Sous-Traitant Assigné (Optionnel)
                </label>
                <select
                  value={formSubcontractor}
                  onChange={(e) => setFormSubcontractor(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Aucun sous-traitant spécifique --</option>
                  {subcontractors.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.trade})
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Observations / Remarques de Chantier
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ex: Cloisons F3 & F4 en cours, approvisionnement briques régulier..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden bg-white"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-black shadow-xs"
                >
                  {editingItem ? 'Mettre à Jour' : 'Enregistrer le Poste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK DAILY INPUT MODAL */}
      {quickInputItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-amber-500 text-slate-950 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-slate-950" />
                <div>
                  <h3 className="font-black text-sm uppercase">Saisie de l'Avancement Journalier</h3>
                  <p className="text-[11px] font-bold text-amber-950">
                    {quickInputItem.bloc} · {quickInputItem.floor} · {quickInputItem.workType}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickInputItem(null)}
                className="text-slate-900 hover:text-black text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDailyInput} className="p-5 space-y-4">
              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Date de la Réalisation *
                </label>
                <input
                  type="date"
                  required
                  value={quickDate}
                  onChange={(e) => setQuickDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden bg-white"
                />
              </div>

              {/* Amount added today */}
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase mb-1">
                  Quantité Réalisée ce Jour ({quickInputItem.unit}) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    max={quickInputItem.totalTargetArea - quickInputItem.completedArea}
                    required
                    value={quickDailyAmount}
                    onChange={(e) => setQuickDailyAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-12 py-2.5 text-xl font-mono font-black border-2 border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden bg-white text-slate-950"
                  />
                  <span className="absolute right-3 top-3.5 text-xs font-black text-slate-400 uppercase">
                    {quickInputItem.unit}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Reste maximum avant achèvement : {(quickInputItem.totalTargetArea - quickInputItem.completedArea).toLocaleString()} {quickInputItem.unit}
                </span>
              </div>

              {/* Quick note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Détail de la zone (Appartements, Cages...)
                </label>
                <input
                  type="text"
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder="Ex: Appartement 02 et 03"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>

              {/* Impact Calculation Preview */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 space-y-1 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Cumul actuel :</span>
                  <span className="font-mono font-bold">{quickInputItem.completedArea} / {quickInputItem.totalTargetArea} {quickInputItem.unit}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Nouveau cumul après saisie :</span>
                  <span className="font-mono font-black">
                    {Math.min(quickInputItem.totalTargetArea, quickInputItem.completedArea + quickDailyAmount).toFixed(1)} {quickInputItem.unit}
                  </span>
                </div>
                <div className="flex justify-between text-slate-950 font-black pt-1 border-t border-amber-200">
                  <span>Nouveau taux d'avancement :</span>
                  <span className="font-mono text-amber-950">
                    {((Math.min(quickInputItem.totalTargetArea, quickInputItem.completedArea + quickDailyAmount) / quickInputItem.totalTargetArea) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickInputItem(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-black shadow-xs"
                >
                  Valider le Pointage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
