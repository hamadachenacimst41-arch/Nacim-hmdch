import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  User, 
  HardHat, 
  MapPin, 
  CheckCircle2, 
  CloudSun, 
  TrendingUp, 
  Filter, 
  FileText, 
  ChevronRight, 
  Building,
  Check,
  Calculator,
  UserX,
  Users,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { DailyLog, Subcontractor, ProjectInfo, FinishingLot } from '../types';

interface DailyLogsViewProps {
  logs: DailyLog[];
  subcontractors: Subcontractor[];
  project: ProjectInfo;
  finishingLots?: FinishingLot[];
  onAddLog: (newLog: DailyLog) => void;
  onUpdateLog?: (updatedLog: DailyLog) => void;
  onDeleteLog: (logId: string) => void;
  onUpdateGlobalProgress?: (newPercent: number) => void;
  onUpdateSubcontractorProgress?: (subId: string, newPercent: number) => void;
  onUpdateFinishingLot?: (lot: FinishingLot) => void;
  onAddFinishingLot?: (lot: FinishingLot) => void;
}

export const DailyLogsView: React.FC<DailyLogsViewProps> = ({
  logs,
  subcontractors,
  project,
  finishingLots = [],
  onAddLog,
  onUpdateLog,
  onDeleteLog,
  onUpdateGlobalProgress,
  onUpdateSubcontractorProgress,
  onUpdateFinishingLot,
  onAddFinishingLot,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterSubId, setFilterSubId] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  const todayStr = new Date().toISOString().slice(0, 10);

  // Form State
  const [formDate, setFormDate] = useState(todayStr);
  const [formSubId, setFormSubId] = useState(subcontractors[0]?.id || '');
  const [formLotId, setFormLotId] = useState<string>('');
  const [isNewLotMode, setIsNewLotMode] = useState(false);
  const [newLotName, setNewLotName] = useState('');
  const [newLotTotalM2, setNewLotTotalM2] = useState<number>(5000);
  const [newLotCategory, setNewLotCategory] = useState<string>('maconnerie');

  const [formTrade, setFormTrade] = useState('');
  const [formWorkDescription, setFormWorkDescription] = useState('');
  const [formBloc, setFormBloc] = useState(project.blocs[0] || 'Bloc A');
  const [formFloor, setFormFloor] = useState(project.floors[1] || 'RDC');
  const [formFloors, setFormFloors] = useState<string[]>([project.floors[0] || 'Sous-Sol', project.floors[2] || '1er Étage']);
  const [formDetail, setFormDetail] = useState('');

  const toggleFloor = (floorName: string) => {
    if (formFloors.includes(floorName)) {
      if (formFloors.length <= 1) return; // Keep at least one floor selected
      setFormFloors(formFloors.filter((f) => f !== floorName));
    } else {
      setFormFloors([...formFloors, floorName]);
    }
  };

  // Workforce & Absences state
  const [formPlannedWorkers, setFormPlannedWorkers] = useState(8);
  const [formMasons, setFormMasons] = useState(4);
  const [formLaborers, setFormLaborers] = useState(3);
  const [formSupervisors, setFormSupervisors] = useState(1);
  const [formAbsenceReason, setFormAbsenceReason] = useState('');

  // Quantities & Progress
  const [formQuantity, setFormQuantity] = useState(85);
  const [formUnit, setFormUnit] = useState('m²');
  const [formWeather, setFormWeather] = useState<'Ensoleillé' | 'Nuageux' | 'Pluvieux' | 'Chaleur intense' | 'Venteux'>('Ensoleillé');
  const [formObservations, setFormObservations] = useState('');
  const [formRecommendations, setFormRecommendations] = useState('');

  // Derived selected lot
  const selectedLot = finishingLots.find((l) => l.id === formLotId);

  // Real-time calculations
  const totalPresentWorkers = formMasons + formLaborers + formSupervisors;
  const absentWorkers = Math.max(0, formPlannedWorkers - totalPresentWorkers);
  const attendanceRate = formPlannedWorkers > 0 ? Math.min(100, Math.round((totalPresentWorkers / formPlannedWorkers) * 100)) : 100;

  // Progress calculations
  const lotTotalTarget = isNewLotMode ? newLotTotalM2 : (selectedLot ? selectedLot.totalContractArea : 0);
  const lotPreviousCompleted = selectedLot ? selectedLot.completedArea : 0;
  const lotNewCompleted = lotPreviousCompleted + formQuantity;
  const lotNewPercentage = lotTotalTarget > 0 ? Math.min(100, (lotNewCompleted / lotTotalTarget) * 100) : 0;
  const calculatedDailyGainPct = lotTotalTarget > 0 ? parseFloat(((formQuantity / lotTotalTarget) * 100).toFixed(2)) : 1.0;
  const remainingTarget = Math.max(0, lotTotalTarget - lotNewCompleted);
  const calculatedGlobalImpact = parseFloat(((formQuantity / Math.max(1000, lotTotalTarget || 10000)) * 0.8).toFixed(2));

  const filteredLogs = logs.filter((log) => {
    const matchesSub = filterSubId === 'all' || log.subcontractorId === filterSubId;
    const matchesDate = !filterDate || log.date === filterDate;
    return matchesSub && matchesDate;
  });

  const handleOpenAddModal = () => {
    const defaultSub = subcontractors[0];
    const defaultSubId = defaultSub?.id || '';
    setFormSubId(defaultSubId);
    setFormPlannedWorkers(defaultSub?.nominalWorkers || defaultSub?.activeWorkers || 8);
    setFormMasons(Math.max(1, Math.floor((defaultSub?.activeWorkers || 8) * 0.5)));
    setFormLaborers(Math.max(1, Math.floor((defaultSub?.activeWorkers || 8) * 0.35)));
    setFormSupervisors(1);
    setFormAbsenceReason('');

    // Try finding an assigned lot for this subcontractor
    const subLots = finishingLots.filter((l) => l.subcontractorId === defaultSubId);
    if (subLots.length > 0) {
      setFormLotId(subLots[0].id);
      setFormTrade(subLots[0].name);
      setFormUnit(subLots[0].unit || 'm²');
      setIsNewLotMode(false);
    } else if (finishingLots.length > 0) {
      setFormLotId(finishingLots[0].id);
      setFormTrade(finishingLots[0].name);
      setFormUnit(finishingLots[0].unit || 'm²');
      setIsNewLotMode(false);
    } else {
      setFormLotId('');
      setFormTrade(defaultSub?.tradesList[0] || 'Maçonnerie Briques 8T/12T');
      setIsNewLotMode(false);
    }

    setFormDate(new Date().toISOString().slice(0, 10));
    setFormQuantity(85);
    setFormFloors(['Sous-Sol', '1er Étage']);
    setFormWorkDescription('');
    setFormObservations('');
    setFormRecommendations('');
    setIsModalOpen(true);
  };

  const handleSubChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    setFormSubId(sId);
    const sub = subcontractors.find((s) => s.id === sId);
    if (sub) {
      setFormPlannedWorkers(sub.nominalWorkers || sub.activeWorkers || 8);
      // Auto-select lot of this sub if available
      const subLots = finishingLots.filter((l) => l.subcontractorId === sId);
      if (subLots.length > 0) {
        setFormLotId(subLots[0].id);
        setFormTrade(subLots[0].name);
        setFormUnit(subLots[0].unit || 'm²');
        setIsNewLotMode(false);
      } else {
        setFormTrade(sub.tradesList[0] || sub.trade);
      }
    }
  };

  const handleLotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__new__') {
      setIsNewLotMode(true);
      setFormLotId('');
      setFormTrade(newLotName || 'Nouvel ouvrage');
    } else {
      setIsNewLotMode(false);
      setFormLotId(val);
      const found = finishingLots.find((l) => l.id === val);
      if (found) {
        setFormTrade(found.name);
        setFormUnit(found.unit || 'm²');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = subcontractors.find((s) => s.id === formSubId);
    const subName = sub ? sub.name : 'Sous-traitant';

    let lotIdToSave = formLotId;
    let lotTotal = lotTotalTarget;
    let lotPrev = lotPreviousCompleted;
    let lotNew = lotNewCompleted;

    // If new lot created on the fly
    if (isNewLotMode && newLotName.trim()) {
      const generatedId = `lot-${Date.now()}`;
      lotIdToSave = generatedId;
      lotTotal = newLotTotalM2;
      lotPrev = 0;
      lotNew = formQuantity;

      const createdLot: FinishingLot = {
        id: generatedId,
        name: newLotName.trim(),
        category: newLotCategory,
        unit: formUnit,
        totalContractArea: newLotTotalM2,
        completedArea: formQuantity,
        subcontractorId: formSubId,
        subcontractorName: subName,
        assignedBlocs: formBloc,
        targetDate: project.plannedCompletionDate || '2026-06-30',
        notes: `Créé automatiquement lors du pointage du ${formDate}`,
      };

      if (onAddFinishingLot) {
        onAddFinishingLot(createdLot);
      }
    } else if (selectedLot && onUpdateFinishingLot) {
      // Update existing lot completedArea
      const updatedLot: FinishingLot = {
        ...selectedLot,
        completedArea: lotNewCompleted,
      };
      onUpdateFinishingLot(updatedLot);
    }

    const selectedFloorsDisplay = formFloors.length > 0 ? formFloors.join(', ') : (formFloor || 'RDC');

    const newLog: DailyLog = {
      id: `log-${Date.now()}`,
      date: formDate,
      subcontractorId: formSubId,
      subcontractorName: subName,
      trade: isNewLotMode ? newLotName : (formTrade || 'Travaux de chantier'),
      lotId: lotIdToSave,
      workDescription: formWorkDescription || `Avancement des travaux de ${formTrade || 'maçonnerie'} - Rendement: ${formQuantity} ${formUnit} réalisé ce jour.`,
      location: {
        bloc: formBloc,
        floor: selectedFloorsDisplay,
        floors: formFloors.length > 0 ? formFloors : [formFloor],
        detail: formDetail,
      },
      workforce: {
        planned: formPlannedWorkers,
        masons: formMasons,
        laborers: formLaborers,
        supervisors: formSupervisors,
        absent: absentWorkers,
        absenceReason: absentWorkers > 0 ? formAbsenceReason : undefined,
      },
      quantityAchieved: {
        amount: formQuantity,
        unit: formUnit,
      },
      companyDailyYield: {
        totalQuantity: formQuantity,
        unit: formUnit,
        masonsCount: formMasons,
        averagePerMason: formMasons > 0 ? parseFloat((formQuantity / formMasons).toFixed(2)) : 0,
      },
      totalLotQuantity: lotTotal > 0 ? lotTotal : undefined,
      previousCompletedQuantity: lotPrev,
      newCompletedQuantity: lotNew,
      dailyProgressPct: calculatedDailyGainPct,
      globalProgressImpactPct: calculatedGlobalImpact,
      weather: formWeather,
      observations: formObservations,
      recommendationsGiven: formRecommendations,
      supervisorVisa: true,
      managerVisa: false,
      createdAt: new Date().toISOString(),
    };

    onAddLog(newLog);

    // Update subcontractor's real progress and active workers
    if (sub && onUpdateSubcontractorProgress) {
      const updatedSubRealProgress = Math.min(100, (sub.realProgress || 0) + calculatedDailyGainPct);
      onUpdateSubcontractorProgress(sub.id, parseFloat(updatedSubRealProgress.toFixed(1)));
    }

    // Update project's global progress
    if (calculatedGlobalImpact > 0 && onUpdateGlobalProgress) {
      const updatedGlobal = Math.min(100, (project.globalProgressPercentage || 0) + calculatedGlobalImpact);
      onUpdateGlobalProgress(parseFloat(updatedGlobal.toFixed(2)));
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Fiches Journalières</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{logs.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Historique de suivi consigné</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Avancement Global du Projet</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {project.globalProgressPercentage.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Mis à jour via les pointages journaliers</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Dernier Enregistrement</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 mt-2 truncate">
            {logs[0] ? `${logs[0].date} · ${logs[0].subcontractorName}` : 'Aucun pointage récent'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {logs[0] ? `${logs[0].location.bloc} - ${logs[0].location.floor}` : '-'}
          </div>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Sous-traitant filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterSubId}
              onChange={(e) => setFilterSubId(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-medium"
            >
              <option value="all">Tous les sous-traitants</option>
              {subcontractors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.trade})
                </option>
              ))}
            </select>
          </div>

          {/* Date filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-1 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="text-xs text-amber-600 hover:underline"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Add log button */}
        <button
          onClick={handleOpenAddModal}
          id="add-daily-log-btn"
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs sm:text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouveau Pointage Journalier
        </button>
      </div>

      {/* Logs Table / Cards List */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs p-5 transition-all"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-slate-900 text-amber-400 px-2.5 py-1 rounded-md">
                    {log.date}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    {log.subcontractorName}
                  </h4>
                  <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 font-semibold px-2 py-0.5 rounded-full">
                    {log.trade}
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                    <CloudSun className="w-3 h-3 text-amber-500" />
                    {log.weather}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1.5">
                  <span className="flex items-center gap-1 font-bold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    {log.location.bloc}
                  </span>
                  <span className="text-slate-300">|</span>
                  {log.location.floors && log.location.floors.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[11px] text-slate-500 font-semibold">Niveaux :</span>
                      {log.location.floors.map((fl) => (
                        <span key={fl} className="bg-amber-100 text-amber-950 font-bold px-2 py-0.5 rounded text-[11px] border border-amber-300 shadow-2xs">
                          {fl}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="bg-amber-100 text-amber-950 font-bold px-2 py-0.5 rounded text-[11px] border border-amber-300">
                      {log.location.floor}
                    </span>
                  )}
                  {log.location.detail && (
                    <span className="text-slate-500 italic text-[11px]">
                      ({log.location.detail})
                    </span>
                  )}
                </div>

                {log.companyDailyYield && (
                  <div className="mt-2 inline-flex flex-wrap items-center gap-2 text-xs bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 px-2.5 py-1 rounded-lg text-amber-950">
                    <span className="font-black text-[11px] uppercase tracking-wide flex items-center gap-1 text-amber-900">
                      <Calculator className="w-3.5 h-3.5 text-amber-700" />
                      Rendement Entreprise :
                    </span>
                    <span className="font-mono font-black text-slate-900">
                      {log.companyDailyYield.totalQuantity} {log.companyDailyYield.unit}
                    </span>
                    <span className="text-slate-600">
                      réalisés avec <strong className="font-mono text-amber-900">{log.companyDailyYield.masonsCount} maçons</strong>
                    </span>
                    <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded font-mono font-black text-[11px] border border-amber-300">
                      Moyenne: {log.companyDailyYield.averagePerMason} {log.companyDailyYield.unit}/maçon/jour
                    </span>
                  </div>
                )}
              </div>

              {/* Progress badges */}
              <div className="flex items-center gap-3 text-right">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">
                    Progression Sous-Traitant
                  </div>
                  <div className="text-base font-extrabold text-slate-900 font-mono">
                    +{log.dailyProgressPct}%
                  </div>
                </div>
                <div className="border-l border-slate-200 pl-3">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">
                    Impact Projet Global
                  </div>
                  <div className="text-base font-extrabold text-emerald-600 font-mono">
                    +{log.globalProgressImpactPct}%
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Quantities */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-3">
              <div className="md:col-span-2">
                <div className="text-slate-500 font-semibold uppercase text-[11px] mb-1">
                  Travaux réalisés dans la journée :
                </div>
                <p className="text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  {log.workDescription}
                </p>
              </div>

              <div className="space-y-2">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  <span className="text-slate-500 text-[11px] font-semibold uppercase block mb-1">
                    Quantité Réalisée :
                  </span>
                  <div className="text-base font-bold text-slate-900 font-mono">
                    {log.quantityAchieved.amount} {log.quantityAchieved.unit}
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  <span className="text-slate-500 text-[11px] font-semibold uppercase block mb-1">
                    Effectif Présent :
                  </span>
                  <div className="text-slate-800 font-medium">
                    <span className="font-bold text-amber-700">{log.workforce.masons}</span> Maçons ·{' '}
                    <span className="font-bold text-slate-700">{log.workforce.laborers}</span> Manœuvres ·{' '}
                    <span className="font-bold text-slate-700">{log.workforce.supervisors}</span> Encadrement
                  </div>
                </div>
              </div>
            </div>

            {/* Observations & Recommendations */}
            {(log.observations || log.recommendationsGiven) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
                {log.observations && (
                  <div>
                    <span className="font-semibold text-slate-700">Observations du conducteur GCB :</span>
                    <p className="text-slate-600 italic mt-0.5">{log.observations}</p>
                  </div>
                )}
                {log.recommendationsGiven && (
                  <div>
                    <span className="font-semibold text-amber-800">Instructions / Recommandations transmises :</span>
                    <p className="text-slate-700 font-medium mt-0.5">{log.recommendationsGiven}</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer visas */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Visé par Conducteur GCB
                </span>
                <span className={`flex items-center gap-1 font-semibold ${log.managerVisa ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {log.managerVisa ? 'Validé par Responsable Travaux' : 'En attente visa Responsable'}
                </span>
              </div>
              <button
                onClick={() => {
                  if (confirm('Supprimer cette entrée journalière ?')) {
                    onDeleteLog(log.id);
                  }
                }}
                className="text-slate-400 hover:text-red-600 text-xs font-medium"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center border border-dashed border-slate-300">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-700 font-bold">Aucune fiche de pointage trouvée</p>
            <p className="text-xs text-slate-400 mt-1">
              Enregistrez l'avancement quotidien de vos sous-traitants pour alimenter le rapport du responsable.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-600 inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Créer le premier pointage
            </button>
          </div>
        )}
      </div>

      {/* Add Log Modal with Automatic Calculation Engine */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 my-8">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-lg">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Pointage Journalier & Calcul Automatique de l'Avancement</h3>
                  <p className="text-xs text-slate-400">Entrez les m² réalisés ce jour, le système calcule automatiquement le cumul et le pourcentage</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
              {/* 1. DATE & SÉLECTION RAPIDE DU SOUS-TRAITANT (ENTRÉ UNE SEULE FOIS) */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Date du pointage *
                    </label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Tous les Sous-Traitants enregistrés
                    </label>
                    <select
                      value={formSubId}
                      onChange={handleSubChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-semibold bg-white"
                    >
                      {subcontractors.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.companyName}) — {s.trade}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SÉLECTION RAPIDE EN 1 CLIC DES 2 SOUS-TRAITANTS DE MAÇONNERIE DU CHANTIER */}
                <div className="p-3.5 bg-amber-500/10 border border-amber-300 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-950 uppercase flex items-center gap-1.5">
                      <HardHat className="w-4 h-4 text-amber-600" />
                      Sélection Rapide des 2 Entreprises de Maçonnerie (Chantier Actuel) :
                    </span>
                    <span className="text-[11px] text-amber-800 font-bold bg-amber-200/70 px-2 py-0.5 rounded-full">
                      Enregistré 1 seule fois
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {subcontractors
                      .filter((s) => s.trade === 'maconnerie' || s.tradesList.some((t) => t.toLowerCase().includes('maçon') || t.toLowerCase().includes('brique')))
                      .map((s, idx) => {
                        const isSelected = formSubId === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              handleSubChange({ target: { value: s.id } } as any);
                            }}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md ring-2 ring-amber-400'
                                : 'bg-white hover:bg-amber-50/50 text-slate-800 border-slate-300'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded ${
                                  isSelected ? 'bg-slate-950 text-amber-400' : 'bg-amber-100 text-amber-900'
                                }`}>
                                  ST N°{idx + 1}
                                </span>
                                <span className="text-xs font-black truncate">{s.name}</span>
                              </div>
                              <div className={`text-[11px] mt-0.5 truncate ${isSelected ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                                {s.companyName} · {s.assignedZone || 'Chantier GCB'}
                              </div>
                              <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-950 font-bold' : 'text-slate-400'}`}>
                                Effectif habituel : {s.activeWorkers || 8} ouvriers ({s.phone || 'Contact direct'})
                              </div>
                            </div>
                            <div className="shrink-0">
                              {isSelected ? (
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-950 text-amber-400 shadow-xs">
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </span>
                              ) : (
                                <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-md">
                                  Choisir
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* LIAISON AVEC LE LOT DE TRAVAUX (POUR CALCUL AUTOMATIQUE DU POURCENTAGE) */}
              <div className="p-4 bg-gradient-to-br from-blue-50/80 to-slate-50 rounded-xl border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-950 uppercase flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Ouvrage / Lot Contractuel Référencé (Calcul Auto de l'Avancement) :
                  </label>
                  <span className="text-[11px] text-blue-700 font-medium">
                    Surface totale entrée une seule fois
                  </span>
                </div>

                <select
                  value={isNewLotMode ? '__new__' : formLotId}
                  onChange={handleLotChange}
                  className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden bg-white font-bold text-slate-800"
                >
                  <optgroup label="Lots de Travaux Existants (Maçonnerie, Finitions & Tous Corps d'état)">
                    {finishingLots.map((lot) => (
                      <option key={lot.id} value={lot.id}>
                        {lot.name} — Total: {lot.totalContractArea} {lot.unit} ({((lot.completedArea / lot.totalContractArea) * 100).toFixed(1)}% fait)
                      </option>
                    ))}
                  </optgroup>
                  <option value="__new__">➕ Créer un nouvel ouvrage / lot (Définir la surface totale)...</option>
                </select>

                {/* Si création d'un nouveau lot à la volée */}
                {isNewLotMode && (
                  <div className="p-3 bg-white rounded-lg border border-blue-300 space-y-3">
                    <div className="text-xs font-bold text-blue-900 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      Définir le nouvel ouvrage (Maçonnerie, Finition ou Autre Corps d'état) :
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Intitulé de l'ouvrage *
                        </label>
                        <input
                          type="text"
                          required
                          value={newLotName}
                          onChange={(e) => setNewLotName(e.target.value)}
                          placeholder="Ex: Maçonnerie Brique 12T - Façades"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Surface / Quantité Totale *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={newLotTotalM2}
                          onChange={(e) => setNewLotTotalM2(parseFloat(e.target.value) || 1)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Résumé interactif des surfaces */}
                {lotTotalTarget > 0 && (
                  <div className="grid grid-cols-3 gap-2 text-center text-xs bg-white p-2.5 rounded-lg border border-blue-200">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Contractuel</span>
                      <strong className="text-slate-900 font-mono text-sm">{lotTotalTarget} {formUnit}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Cumul Précédent</span>
                      <strong className="text-blue-700 font-mono text-sm">{lotPreviousCompleted} {formUnit}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Reste à Réaliser</span>
                      <strong className="text-amber-800 font-mono text-sm">{remainingTarget} {formUnit}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. LOCALISATION & MULTI-SÉLECTION DES ÉTAGES (EX: SOUS-SOL + 1ER ÉTAGE SIMULTANÉMENT) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-amber-600" />
                    Localisation & Sélection Multi-Étages (Plusieurs Niveaux Simultanés) :
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormFloors(['Sous-Sol', '1er Étage'])}
                      className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded font-bold text-[11px] border border-amber-300 transition-colors cursor-pointer"
                    >
                      ⚡ Sous-Sol + 1er Étage
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormFloors([...project.floors])}
                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Tout le bâtiment
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Bâtiment / Bloc *
                    </label>
                    <select
                      value={formBloc}
                      onChange={(e) => setFormBloc(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden bg-white font-semibold"
                    >
                      {project.blocs.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Détail de la zone (Appartements, Façades...)
                    </label>
                    <input
                      type="text"
                      value={formDetail}
                      onChange={(e) => setFormDetail(e.target.value)}
                      placeholder="Ex: Appt 02, 03 & Façade Sud"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden bg-white"
                    />
                  </div>
                </div>

                {/* SÉLECTEUR MULTI-ÉTAGES INTERACTIF AVEC CASES / BADGES */}
                <div>
                  <div className="text-[11px] font-bold text-slate-700 uppercase mb-2 flex items-center justify-between">
                    <span>Cliquez pour cocher / décocher un ou plusieurs étages travaillés :</span>
                    <span className="text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      {formFloors.length} niveau(x) sélectionné(s)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {project.floors.map((floor) => {
                      const isSelected = formFloors.includes(floor);
                      return (
                        <button
                          key={floor}
                          type="button"
                          onClick={() => toggleFloor(floor)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm ring-1 ring-amber-400'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <span>{floor}</span>
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {formFloors.length > 0 && (
                    <div className="mt-2.5 p-2 bg-amber-50 text-amber-950 rounded-lg border border-amber-300 text-xs flex items-center gap-2">
                      <span className="font-black uppercase text-[10px]">Étages Enregistrés :</span>
                      <div className="flex flex-wrap gap-1">
                        {formFloors.map((fl) => (
                          <span key={fl} className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                            {fl}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. SAISIE RAPIDE DU RENDEMENT DE L'ENTREPRISE ET NOMBRE DE MAÇONS */}
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-xl border-2 border-amber-400 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-950 uppercase flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-amber-700" />
                    Rendement Journalier Global de l'Entreprise de Maçonnerie :
                  </label>
                  <span className="text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                    Saisie Rapide Spéciale Chantier
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Rendement global de l'entreprise */}
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase mb-1">
                      Rendement Total de la Journée ({formUnit}) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0.1"
                        step="0.5"
                        required
                        value={formQuantity}
                        onChange={(e) => setFormQuantity(parseFloat(e.target.value) || 0)}
                        className="w-full pl-3 pr-12 py-2.5 text-lg font-mono font-black border-2 border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden bg-white text-slate-950"
                      />
                      <span className="absolute right-3 top-3 text-xs font-black text-slate-500 uppercase">
                        {formUnit}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1">
                      Surface totale exécutée aujourd'hui par l'ensemble des ouvriers de l'entreprise.
                    </p>
                  </div>

                  {/* Nombre de maçons de l'entreprise */}
                  <div>
                    <label className="block text-xs font-black text-amber-950 uppercase mb-1">
                      Nombre de Maçons Ayant Travaillé ce Jour *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        required
                        value={formMasons}
                        onChange={(e) => setFormMasons(parseInt(e.target.value) || 1)}
                        className="w-full pl-3 pr-16 py-2.5 text-lg font-mono font-black border-2 border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden bg-white text-amber-950"
                      />
                      <span className="absolute right-3 top-3 text-xs font-black text-amber-800 uppercase">
                        Maçons
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1">
                      Effectif d'ouvriers qualifiés maçons présents sur le chantier ce jour.
                    </p>
                  </div>
                </div>

                {/* Manœuvres & encadrement */}
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Manœuvres / Aides Maçons
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formLaborers}
                      onChange={(e) => setFormLaborers(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Chefs d'équipe / Encadrement
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formSupervisors}
                      onChange={(e) => setFormSupervisors(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md font-mono bg-white"
                    />
                  </div>
                </div>

                {/* CALCULS AUTOMATIQUES EN TEMPS RÉEL (HUD GCB) */}
                <div className="p-3 bg-white rounded-xl border border-amber-300 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase flex items-center justify-between">
                    <span>Indicateurs de Performance & Cadence Calculés en Direct :</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      +{calculatedDailyGainPct}% pour le lot
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                    {/* Rendement Moyen par maçon */}
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Rendement Moyen / Maçon
                      </span>
                      <div className="text-lg font-black text-amber-950 font-mono mt-0.5">
                        {formMasons > 0 ? (formQuantity / formMasons).toFixed(1) : 0} {formUnit}/maçon
                      </div>
                      <span className="text-[10px] text-slate-600 font-semibold">
                        {formMasons > 0 && (formQuantity / formMasons) >= 12 ? '✓ Conforme DTR (12-16 m²)' : 'Cadence moyenne'}
                      </span>
                    </div>

                    {/* Équivalent briques posées */}
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Briques Posées ce Jour
                      </span>
                      <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                        ~{Math.round(formQuantity * 17).toLocaleString()} briques
                      </div>
                      <span className="text-[10px] text-slate-500">
                        (Règle GCB : 17 briques / m²)
                      </span>
                    </div>

                    {/* Équivalent palettes consommées */}
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Palettes Équivalentes
                      </span>
                      <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                        ~{((formQuantity * 17) / 335).toFixed(1)} palettes
                      </div>
                      <span className="text-[10px] text-slate-500">
                        (335 briques / palette)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* GESTION DYNAMIQUE DES EFFECTIFS ET DES ABSENCES */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-600" />
                    Pointage des Effectifs & Détection des Absences :
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">Taux de présence :</span>
                    <span className={`text-xs font-black font-mono px-2 py-0.5 rounded ${attendanceRate < 80 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}`}>
                      {attendanceRate}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Effectif Prévu (Nominal)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formPlannedWorkers}
                      onChange={(e) => setFormPlannedWorkers(parseInt(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md font-mono font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      Maçons Présents
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formMasons}
                      onChange={(e) => setFormMasons(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs border border-amber-300 rounded-md font-mono font-bold bg-white text-amber-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Manœuvres Présents
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formLaborers}
                      onChange={(e) => setFormLaborers(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md font-mono bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Encadrement Présent
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formSupervisors}
                      onChange={(e) => setFormSupervisors(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md font-mono bg-white"
                    />
                  </div>
                </div>

                {/* Bilan d'absences */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Total présents ce jour : <strong className="text-slate-900 font-bold">{totalPresentWorkers} ouvriers</strong></span>
                    {absentWorkers > 0 ? (
                      <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1 border border-red-200">
                        <UserX className="w-3 h-3" />
                        {absentWorkers} absent(s) constaté(s)
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[11px]">
                        ✓ Aucun absent
                      </span>
                    )}
                  </div>
                </div>

                {/* Champ motif d'absence si absents > 0 */}
                {absentWorkers > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-[11px] font-bold text-red-800 uppercase mb-1">
                      Motif ou Justification des Absences ({absentWorkers} absents) :
                    </label>
                    <input
                      type="text"
                      value={formAbsenceReason}
                      onChange={(e) => setFormAbsenceReason(e.target.value)}
                      placeholder="Ex: 2 manœuvres absents pour intempéries / transport non assuré..."
                      className="w-full px-3 py-1.5 text-xs border border-red-300 rounded-lg focus:ring-2 focus:ring-red-400 outline-hidden bg-white text-red-950 font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Description des travaux */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nature et Description des Travaux Réalisés ce Jour
                </label>
                <textarea
                  rows={2}
                  value={formWorkDescription}
                  onChange={(e) => setFormWorkDescription(e.target.value)}
                  placeholder="Ex: Pose de cloisons briques 8T, dressage d'enduit ciment, pose de carrelage avec croisillons..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              {/* Météo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Météo du Chantier
                </label>
                <select
                  value={formWeather}
                  onChange={(e) => setFormWeather(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden"
                >
                  <option value="Ensoleillé">☀️ Ensoleillé</option>
                  <option value="Nuageux">⛅ Nuageux</option>
                  <option value="Pluvieux">🌧️ Pluvieux</option>
                  <option value="Chaleur intense">🔥 Chaleur intense</option>
                  <option value="Venteux">💨 Venteux</option>
                </select>
              </div>

              {/* Observations & Recommandations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Observations du conducteur GCB
                  </label>
                  <textarea
                    rows={2}
                    value={formObservations}
                    onChange={(e) => setFormObservations(e.target.value)}
                    placeholder="Approvisionnement, cadence, propreté..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Instructions / Recommandations données
                  </label>
                  <textarea
                    rows={2}
                    value={formRecommendations}
                    onChange={(e) => setFormRecommendations(e.target.value)}
                    placeholder="Instructions techniques, renfort d'équipe..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-hidden"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer le Pointage & Mettre à Jour l'Avancement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
