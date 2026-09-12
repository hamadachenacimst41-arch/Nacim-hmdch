import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  MapPin, 
  HardHat, 
  FileCheck, 
  Sparkles, 
  Filter, 
  ArrowRight,
  Printer,
  ShieldAlert,
  HelpCircle,
  MessageSquareQuote,
  Tag,
  FolderPlus,
  Trash2,
  BookmarkCheck,
  Check,
  X,
  History,
  GitCommit,
  Layers,
  Wrench,
  ShieldCheck,
  RotateCcw,
  FileDown,
  Download,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { Anomaly, Subcontractor, ProjectInfo, ReserveType, UserRole, AnomalyTimelineEvent } from '../types';
import { Storage } from '../utils/storage';
import { AnomalyTimeline } from './AnomalyTimeline';
import { generateAnomaliesReportPDF, generateSingleAnomalyPDF } from '../utils/pdfGenerator';

interface AnomaliesViewProps {
  anomalies: Anomaly[];
  subcontractors: Subcontractor[];
  project: ProjectInfo;
  reserveTypes?: ReserveType[];
  onAddAnomaly: (anomaly: Anomaly) => void;
  onUpdateAnomaly: (anomaly: Anomaly) => void;
  onDeleteAnomaly: (id: string) => void;
  onAddReserveType?: (type: ReserveType) => void;
  onDeleteReserveType?: (id: string) => void;
  userRole?: UserRole;
}

export const AnomaliesView: React.FC<AnomaliesViewProps> = ({
  anomalies,
  subcontractors,
  project,
  reserveTypes,
  onAddAnomaly,
  onUpdateAnomaly,
  onDeleteAnomaly,
  onAddReserveType,
  onDeleteReserveType,
  userRole = 'superviseur',
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'ouverte' | 'en_cours' | 'resolue'>('all');
  const [subFilter, setSubFilter] = useState<string>('all');
  const [reserveTypeFilter, setReserveTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReserveTypesModalOpen, setIsReserveTypesModalOpen] = useState(false);
  const [selectedAnomalyForPrint, setSelectedAnomalyForPrint] = useState<Anomaly | null>(null);

  // PDF Export states
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Dedicated lifecycle transition modals
  const [anomalyToResolve, setAnomalyToResolve] = useState<Anomaly | null>(null);
  const [resolveActionTaken, setResolveActionTaken] = useState('');
  const [resolveClosureNotes, setResolveClosureNotes] = useState('');
  const [resolveDate, setResolveDate] = useState(new Date().toISOString().slice(0, 10));
  const [resolveVerifiedBy, setResolveVerifiedBy] = useState(project.supervisorName || 'Conducteur de Travaux GCB');

  const [anomalyToInProgress, setAnomalyToInProgress] = useState<Anomaly | null>(null);
  const [inProgressDateVal, setInProgressDateVal] = useState(new Date().toISOString().slice(0, 10));
  const [inProgressNotesVal, setInProgressNotesVal] = useState('');

  // Available Reserve Types (props or fallback from storage)
  const availableReserveTypes = reserveTypes && reserveTypes.length > 0 ? reserveTypes : Storage.loadReserveTypes();

  // Form state for Anomalies
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formSubId, setFormSubId] = useState(subcontractors[0]?.id || '');
  const [formLocation, setFormLocation] = useState('Bloc A - 1er Étage');
  const [formCategory, setFormCategory] = useState<'maconnerie' | 'finition' | 'securite' | 'materiaux'>('maconnerie');
  const [formSeverity, setFormSeverity] = useState<'mineure' | 'majeure' | 'critique'>('majeure');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formRecommendation, setFormRecommendation] = useState('');
  const [formDeadline, setFormDeadline] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)
  );
  const [selectedReserveTypeId, setSelectedReserveTypeId] = useState<string>('');
  const [isInlineCreateType, setIsInlineCreateType] = useState<boolean>(false);

  // Form state for creating custom reserve types
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCategory, setNewTypeCategory] = useState('Maçonnerie');
  const [newTypeSeverity, setNewTypeSeverity] = useState<'mineure' | 'majeure' | 'critique'>('majeure');
  const [newTypeDescription, setNewTypeDescription] = useState('');

  // Handle selection of reserve type
  const handleSelectReserveType = (typeId: string) => {
    setSelectedReserveTypeId(typeId);
    if (typeId === '__new__') {
      setIsInlineCreateType(true);
      return;
    }
    setIsInlineCreateType(false);
    const rt = availableReserveTypes.find((r) => r.id === typeId);
    if (rt) {
      setFormTitle(rt.name);
      setFormSeverity(rt.defaultSeverity);
      const catLower = rt.category.toLowerCase();
      if (catLower.includes('maçonnerie') || catLower.includes('maconnerie')) {
        setFormCategory('maconnerie');
      } else if (catLower.includes('sécurité') || catLower.includes('securite') || catLower.includes('hse')) {
        setFormCategory('securite');
      } else if (catLower.includes('matériaux') || catLower.includes('materiaux')) {
        setFormCategory('materiaux');
      } else {
        setFormCategory('finition');
      }
      if (rt.description) {
        setFormDescription(rt.description);
      }
    }
  };

  // Handle adding new custom reserve type
  const handleCreateNewReserveType = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTypeName.trim()) return;

    const newType: ReserveType = {
      id: `res-${Date.now()}`,
      name: newTypeName.trim(),
      category: newTypeCategory,
      defaultSeverity: newTypeSeverity,
      description: newTypeDescription.trim(),
      isCustom: true,
    };

    if (onAddReserveType) {
      onAddReserveType(newType);
    } else {
      const updated = [...availableReserveTypes, newType];
      Storage.saveReserveTypes(updated);
    }

    // Auto-select this newly created type in the active form
    setSelectedReserveTypeId(newType.id);
    setFormTitle(newType.name);
    setFormSeverity(newType.defaultSeverity);
    setIsInlineCreateType(false);
    setNewTypeName('');
    setNewTypeDescription('');
  };

  const handleDeleteCustomType = (id: string) => {
    if (confirm('Voulez-vous supprimer ce type de réserve ?')) {
      if (onDeleteReserveType) {
        onDeleteReserveType(id);
      } else {
        const updated = availableReserveTypes.filter((t) => t.id !== id);
        Storage.saveReserveTypes(updated);
      }
    }
  };

  // Helper presets for quick DTR recommendations
  const applyPresetRecommendation = (type: 'aplomb' | 'fissure' | 'mortier' | 'carrelage') => {
    switch (type) {
      case 'aplomb':
        setFormTitle('Défaut d’aplomb hors tolérances DTR sur cloison maçonnerie');
        setFormCategory('maconnerie');
        setFormSeverity('critique');
        setFormDescription('Écart de verticalité mesuré supérieur à 15 mm sur hauteur d’étage. Risque d’épaisseur excessive lors de l’application de l’enduit.');
        setFormRecommendation('Démolition immédiate de la partie non conforme et reconstruction avec respect du fil à plomb et calepinage des briques.');
        break;
      case 'fissure':
        setFormTitle('Fissuration de retrait sur enduit de façade / intérieur');
        setFormCategory('finition');
        setFormSeverity('majeure');
        setFormDescription('Faïençage et micro-fissures suite à un temps sec et manque d’humidification préalable du support en brique.');
        setFormRecommendation('Piquage des parties non adhérentes, arrosage abondant du support en brique avant gobetis et pose d’une trame de fibre de verre aux jonctions.');
        break;
      case 'mortier':
        setFormTitle('Réhumidification de mortier de pose déjà pris (Mortier remouillé)');
        setFormCategory('maconnerie');
        setFormSeverity('critique');
        setFormDescription('Les maçons ont rajouté de l’eau à un mortier dont la prise avait déjà débuté, entraînant une chute drastique de résistance.');
        setFormRecommendation('Évacuation immédiate de la gâchée impropre. Interdiction formelle de réutiliser un mortier après début de prise. Gâchage au fur et à mesure des besoins.');
        break;
      case 'carrelage':
        setFormTitle('Défaut de planéité et carrelage sonnant le creux');
        setFormCategory('finition');
        setFormSeverity('majeure');
        setFormDescription('Carreaux 45x45 présentant un désaffleurement > 2mm et adhérence insuffisante au niveau des angles.');
        setFormRecommendation('Dépose sans délai des carreaux sonnant le creux, nettoyage soigné du support et repose à double encollage avec mortier-colle C2.');
        break;
    }
  };

  const filteredAnomalies = anomalies.filter((a) => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSub = subFilter === 'all' || a.subcontractorId === subFilter;
    const matchesReserveType = reserveTypeFilter === 'all' || a.reserveTypeId === reserveTypeFilter || a.reserveTypeName === reserveTypeFilter;
    return matchesStatus && matchesSub && matchesReserveType;
  });

  const openCount = anomalies.filter((a) => a.status === 'ouverte').length;
  const inProgressCount = anomalies.filter((a) => a.status === 'en_cours').length;
  const resolvedCount = anomalies.filter((a) => a.status === 'resolue').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = subcontractors.find((s) => s.id === formSubId);
    const chosenType = availableReserveTypes.find((r) => r.id === selectedReserveTypeId);

    const initialEvent: AnomalyTimelineEvent = {
      id: `evt-${Date.now()}-1`,
      stage: 'ouverture',
      title: 'Constat & Notification de non-conformité',
      date: formDate,
      author: project.supervisorName || 'Superviseur GCB',
      comment: `Notification émise avec date limite de reprise au ${formDeadline}. Recommandation : ${formRecommendation}`,
      statusSnapshot: 'ouverte',
    };

    const newAnomaly: Anomaly = {
      id: `anom-${Date.now()}`,
      date: formDate,
      subcontractorId: formSubId,
      subcontractorName: sub ? sub.name : 'Sous-traitant',
      location: formLocation,
      category: formCategory,
      reserveTypeId: chosenType?.id,
      reserveTypeName: chosenType ? chosenType.name : (formTitle || 'Autre réserve'),
      severity: formSeverity,
      title: formTitle,
      description: formDescription,
      recommendation: formRecommendation,
      deadlineDate: formDeadline,
      status: 'ouverte',
      verifiedBy: project.supervisorName,
      history: [initialEvent],
    };

    onAddAnomaly(newAnomaly);
    setIsModalOpen(false);
    // Reset
    setFormTitle('');
    setFormDescription('');
    setFormRecommendation('');
    setSelectedReserveTypeId('');
    setIsInlineCreateType(false);
  };

  // Dedicated Open In-Progress Modal Handler
  const handleOpenInProgressModal = (anomaly: Anomaly) => {
    setAnomalyToInProgress(anomaly);
    setInProgressDateVal(new Date().toISOString().slice(0, 10));
    setInProgressNotesVal(anomaly.inProgressNotes || 'Ordre de reprise notifié au sous-traitant. Équipes mobilisées sur place.');
  };

  const handleConfirmInProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anomalyToInProgress) return;

    const newEvent: AnomalyTimelineEvent = {
      id: `evt-${Date.now()}`,
      stage: 'prise_en_charge',
      title: 'Prise en charge & Intervention sous-traitant',
      date: inProgressDateVal,
      author: `${anomalyToInProgress.subcontractorName} / ${project.supervisorName}`,
      comment: inProgressNotesVal || 'Ordre de reprise pris en compte. Travaux de réfection engagés.',
      statusSnapshot: 'en_cours',
    };

    const updatedHistory = [...(anomalyToInProgress.history || []), newEvent];
    const updated: Anomaly = {
      ...anomalyToInProgress,
      status: 'en_cours',
      inProgressDate: inProgressDateVal,
      inProgressNotes: inProgressNotesVal,
      history: updatedHistory,
    };

    onUpdateAnomaly(updated);
    setAnomalyToInProgress(null);
  };

  // Dedicated Open Resolve / Close Modal Handler
  const handleOpenResolveModal = (anomaly: Anomaly) => {
    setAnomalyToResolve(anomaly);
    setResolveDate(new Date().toISOString().slice(0, 10));
    setResolveActionTaken(anomaly.actionTaken || 'Démolition de la partie non conforme et reconstruction conforme au DTR.');
    setResolveClosureNotes(anomaly.closureNotes || 'Contrôle contradictoire de récolement satisfaisant. Quitus accordé.');
    setResolveVerifiedBy(project.supervisorName || 'Conducteur de Travaux GCB');
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anomalyToResolve) return;

    const newEvent: AnomalyTimelineEvent = {
      id: `evt-${Date.now()}`,
      stage: 'cloture',
      title: 'Réserve Levée & Visa de Récolement GCB',
      date: resolveDate,
      author: resolveVerifiedBy,
      comment: `${resolveActionTaken} — ${resolveClosureNotes}`,
      statusSnapshot: 'resolue',
    };

    const updatedHistory = [...(anomalyToResolve.history || []), newEvent];
    const updated: Anomaly = {
      ...anomalyToResolve,
      status: 'resolue',
      resolvedDate: resolveDate,
      actionTaken: resolveActionTaken,
      closureNotes: resolveClosureNotes,
      verifiedBy: resolveVerifiedBy,
      history: updatedHistory,
    };

    onUpdateAnomaly(updated);
    setAnomalyToResolve(null);
  };

  const handleMarkResolved = (anomaly: Anomaly) => {
    handleOpenResolveModal(anomaly);
  };

  const handlePrintAnomaly = (anomaly: Anomaly) => {
    setSelectedAnomalyForPrint(anomaly);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleExportAnomaliesPDF = (mode: 'filtered' | 'all' = 'filtered') => {
    setIsExportingPDF(true);
    setExportDropdownOpen(false);

    setTimeout(() => {
      try {
        const targetList = mode === 'all' ? anomalies : filteredAnomalies;
        const subName = subFilter !== 'all' ? subcontractors.find((s) => s.id === subFilter)?.name : undefined;
        const reserveTypeName = reserveTypeFilter !== 'all' ? availableReserveTypes.find((r) => r.id === reserveTypeFilter)?.name : undefined;

        generateAnomaliesReportPDF({
          project,
          anomalies: targetList,
          subcontractors,
          filterContext: {
            statusFilter: mode === 'all' ? 'all' : statusFilter,
            subFilterName: subName,
            reserveTypeName: reserveTypeName,
          },
        });

        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3500);
      } catch (err) {
        console.error('Erreur export PDF anomalies:', err);
        alert('Une erreur est survenue lors de la génération du rapport PDF.');
      } finally {
        setIsExportingPDF(false);
      }
    }, 200);
  };

  const handleExportSinglePDF = (anomaly: Anomaly) => {
    try {
      generateSingleAnomalyPDF({ project, anomaly });
    } catch (err) {
      console.error('Erreur export PDF fiche:', err);
      alert('Erreur lors de la génération du PDF pour cette anomalie.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Constats</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{anomalies.length}</div>
            <div className="text-[11px] text-slate-500">Fiches de non-conformité</div>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-xs flex items-center justify-between bg-red-50/20">
          <div>
            <span className="text-xs font-semibold text-red-600 uppercase">Anomalies Ouvertes</span>
            <div className="text-2xl font-black text-red-600 mt-1">{openCount}</div>
            <div className="text-[11px] text-red-500">En attente d'intervention</div>
          </div>
          <div className="p-3 bg-red-100 text-red-700 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between bg-amber-50/20">
          <div>
            <span className="text-xs font-semibold text-amber-700 uppercase">En Cours de Reprise</span>
            <div className="text-2xl font-black text-amber-700 mt-1">{inProgressCount}</div>
            <div className="text-[11px] text-amber-600">Délai accordé en cours</div>
          </div>
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between bg-emerald-50/20">
          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase">Réserves Levées</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{resolvedCount}</div>
            <div className="text-[11px] text-emerald-600">Validées après contrôle</div>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Toutes ({anomalies.length})
            </button>
            <button
              onClick={() => setStatusFilter('ouverte')}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === 'ouverte' ? 'bg-red-500 text-white shadow-xs font-bold' : 'text-red-700'
              }`}
            >
              Ouvertes ({openCount})
            </button>
            <button
              onClick={() => setStatusFilter('en_cours')}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === 'en_cours' ? 'bg-amber-500 text-white shadow-xs font-bold' : 'text-amber-800'
              }`}
            >
              En cours ({inProgressCount})
            </button>
            <button
              onClick={() => setStatusFilter('resolue')}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === 'resolue' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-emerald-800'
              }`}
            >
              Résolues ({resolvedCount})
            </button>
          </div>

          {/* Subcontractor filter */}
          <div className="flex items-center gap-1.5 ml-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={subFilter}
              onChange={(e) => setSubFilter(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg outline-hidden bg-white"
            >
              <option value="all">Tous les sous-traitants</option>
              {subcontractors.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Reserve Type filter */}
          <div className="flex items-center gap-1.5 ml-2 text-xs">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={reserveTypeFilter}
              onChange={(e) => setReserveTypeFilter(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg outline-hidden bg-white max-w-[200px] truncate font-medium text-slate-700"
            >
              <option value="all">Tous les types de réserves</option>
              {availableReserveTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle (Cards with Timeline vs Global Master Timeline) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 ml-2">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Affichage fiches avec chronologie intégrée"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Fiches & Timelines</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Affichage sous forme d'axe chronologique global du chantier"
            >
              <GitCommit className="w-3.5 h-3.5 text-blue-600" />
              <span>Axe Chronologique Global</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* PDF Export Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              disabled={isExportingPDF}
              id="export-anomalies-pdf-btn"
              className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-extrabold rounded-lg border shadow-xs transition-all cursor-pointer ${
                exportSuccess
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
              }`}
              title="Générer et télécharger le rapport officiel format A4 avec la liste des anomalies et chronologies"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Génération A4...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Rapport A4 Téléchargé !</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-amber-400" />
                  <span>Exporter PDF (A4)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </>
              )}
            </button>

            {exportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-2 text-xs divide-y divide-slate-100">
                <div className="px-3 py-2 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  Options d'Export Format A4 (GCB)
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => handleExportAnomaliesPDF('filtered')}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-start gap-2 text-slate-800 font-semibold cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Vue en cours ({filteredAnomalies.length} fiches)</div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        Rapport avec le filtre actif ({statusFilter === 'all' ? 'Tous statuts' : statusFilter}) et chronologies
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportAnomaliesPDF('all')}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-start gap-2 text-slate-800 font-semibold cursor-pointer mt-1"
                  >
                    <Download className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Registre complet ({anomalies.length} fiches)</div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        Toutes les non-conformités du chantier avec l'intégralité des chronologies vectorielles
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {userRole === 'superviseur' ? (
            <>
              <button
                type="button"
                onClick={() => setIsReserveTypesModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs sm:text-sm border border-slate-300 shadow-2xs transition-all cursor-pointer"
                title="Gérer les types de réserves & ajouter des types personnalisés"
              >
                <Tag className="w-4 h-4 text-amber-600" />
                <span>Types de Réserves ({availableReserveTypes.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedReserveTypeId('');
                  setIsInlineCreateType(false);
                  setIsModalOpen(true);
                }}
                id="add-anomaly-btn"
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Signaler une Non-Conformité</span>
              </button>
            </>
          ) : (
            <div className="text-xs bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
              <span>Mode Responsable : Contrôle & Levée des Réserves</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Either Detailed Cards with Visual Timeline OR Global Chronological Master Timeline */}
      {viewMode === 'cards' ? (
        <div className="space-y-4">
          {filteredAnomalies.map((anomaly) => {
            const isOverdue = anomaly.status !== 'resolue' && new Date(anomaly.deadlineDate) < new Date();

            return (
              <div
                key={anomaly.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                  anomaly.status === 'resolue'
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : anomaly.severity === 'critique'
                    ? 'border-red-300 ring-1 ring-red-200'
                    : 'border-slate-200'
                }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          anomaly.severity === 'critique'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : anomaly.severity === 'majeure'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Gravité {anomaly.severity}
                      </span>
                      <span className="text-xs font-mono text-slate-500 font-semibold">
                        Constat du {anomaly.date}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          anomaly.status === 'resolue'
                            ? 'bg-emerald-100 text-emerald-800'
                            : anomaly.status === 'en_cours'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {anomaly.status === 'resolue' ? '✓ Réserve levée' : anomaly.status === 'en_cours' ? '⏳ Reprise en cours' : '⚠️ Non traitée'}
                      </span>
                      {anomaly.reserveTypeName && (
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-blue-600" />
                          {anomaly.reserveTypeName}
                        </span>
                      )}
                      {isOverdue && (
                        <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                          Délai Dépassé !
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 mt-1">
                      {anomaly.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="font-semibold text-amber-700">
                        Sous-traitant : {anomaly.subcontractorName}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {anomaly.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportSinglePDF(anomaly)}
                      title="Télécharger la fiche formelle A4 avec la chronologie détaillée"
                      className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-900 rounded-lg text-xs flex items-center gap-1 border border-blue-200 font-semibold cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">PDF A4</span>
                    </button>

                    <button
                      onClick={() => handlePrintAnomaly(anomaly)}
                      title="Imprimer la Fiche de Non-Conformité (Ordre de Reprise & Traçabilité)"
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1 border border-slate-200"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Fiche d'ordre</span>
                    </button>

                    {anomaly.status === 'ouverte' && (
                      <button
                        onClick={() => handleOpenInProgressModal(anomaly)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Prendre en charge</span>
                      </button>
                    )}

                    {anomaly.status !== 'resolue' && (
                      <button
                        onClick={() => handleOpenResolveModal(anomaly)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Lever la réserve
                      </button>
                    )}

                    {userRole === 'superviseur' && (
                      <button
                        onClick={() => {
                          if (confirm('Supprimer cette fiche d’anomalie ?')) {
                            onDeleteAnomaly(anomaly.id);
                          }
                        }}
                        className="text-slate-400 hover:text-red-600 p-1 rounded"
                        title="Supprimer la fiche"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Body: Description & Recommendation given to subcontractor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-700 uppercase text-[11px] mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      Description de la non-conformité constatée :
                    </div>
                    <p className="text-slate-800 leading-relaxed">
                      {anomaly.description}
                    </p>
                  </div>

                  <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-200">
                    <div className="font-bold text-amber-900 uppercase text-[11px] mb-1 flex items-center gap-1.5">
                      <MessageSquareQuote className="w-3.5 h-3.5 text-amber-700" />
                      Recommandation & Instruction technique donnée au sous-traitant :
                    </div>
                    <p className="text-slate-900 font-medium leading-relaxed">
                      {anomaly.recommendation}
                    </p>
                    <div className="mt-2 text-[11px] text-amber-800 font-semibold flex items-center justify-between border-t border-amber-200/60 pt-1.5">
                      <span>Date limite d'exécution :</span>
                      <span className="font-mono font-bold">{anomaly.deadlineDate}</span>
                    </div>
                  </div>
                </div>

                {/* Resolved notes */}
                {anomaly.status === 'resolue' && anomaly.actionTaken && (
                  <div className="mt-3 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <strong>Mesure corrective effectuée :</strong> {anomaly.actionTaken}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-mono">
                      Levée le {anomaly.resolvedDate} par {anomaly.verifiedBy}
                    </span>
                  </div>
                )}

                {/* Chronologie (Timeline) Visuelle du Cycle de Vie */}
                <AnomalyTimeline
                  anomaly={anomaly}
                  userRole={userRole}
                  currentUserName={project.supervisorName || 'Conducteur de Travaux GCB'}
                  onUpdateAnomaly={onUpdateAnomaly}
                  onOpenResolveModal={handleOpenResolveModal}
                  onOpenInProgressModal={handleOpenInProgressModal}
                />
              </div>
            );
          })}

          {filteredAnomalies.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center border border-dashed border-slate-300">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="text-slate-800 font-bold">Aucune anomalie enregistrée dans cette catégorie</p>
              <p className="text-xs text-slate-500 mt-1">
                Excellente conformité des travaux maçonnerie et finitions.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Global Master Timeline View */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-blue-600" />
                <span>Axe Chronologique Global du Cycle de Vie des Réserves</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Traçabilité continue de tous les constats, prises en charge, interventions et levées de réserves du chantier.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExportAnomaliesPDF('filtered')}
                disabled={isExportingPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer"
              >
                {isExportingPDF ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <FileDown className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Exporter Rapport A4</span>
              </button>
              <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                {filteredAnomalies.length} réserve(s) suivie(s)
              </div>
            </div>
          </div>

          <div className="relative pl-6 sm:pl-8 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 space-y-6">
            {filteredAnomalies.flatMap((anom) => {
              if (anom.history && anom.history.length > 0) {
                return anom.history.map((h) => ({
                  ...h,
                  anomalyId: anom.id,
                  anomalyTitle: anom.title,
                  anomalySeverity: anom.severity,
                  subcontractorName: anom.subcontractorName,
                  location: anom.location,
                  status: anom.status,
                }));
              }
              const events: any[] = [
                {
                  id: `evt-${anom.id}-open`,
                  stage: 'ouverture' as const,
                  title: 'Constat & Notification de non-conformité',
                  date: anom.date,
                  author: anom.verifiedBy || 'Superviseur GCB',
                  comment: anom.description,
                  statusSnapshot: 'ouverte' as const,
                  anomalyId: anom.id,
                  anomalyTitle: anom.title,
                  anomalySeverity: anom.severity,
                  subcontractorName: anom.subcontractorName,
                  location: anom.location,
                  status: anom.status,
                },
              ];
              if (anom.inProgressDate || anom.status === 'en_cours') {
                events.push({
                  id: `evt-${anom.id}-prog`,
                  stage: 'prise_en_charge' as const,
                  title: 'Prise en charge & Démarrage reprise',
                  date: anom.inProgressDate || anom.date,
                  author: anom.subcontractorName,
                  comment: anom.inProgressNotes || 'Ordre de reprise pris en compte.',
                  statusSnapshot: 'en_cours' as const,
                  anomalyId: anom.id,
                  anomalyTitle: anom.title,
                  anomalySeverity: anom.severity,
                  subcontractorName: anom.subcontractorName,
                  location: anom.location,
                  status: anom.status,
                });
              }
              if (anom.resolvedDate || anom.status === 'resolue') {
                events.push({
                  id: `evt-${anom.id}-res`,
                  stage: 'cloture' as const,
                  title: 'Levée de Réserve & Validation GCB',
                  date: anom.resolvedDate || anom.date,
                  author: anom.verifiedBy || 'Conducteur de Travaux GCB',
                  comment: anom.actionTaken || 'Mesure corrective validée conforme.',
                  statusSnapshot: 'resolue' as const,
                  anomalyId: anom.id,
                  anomalyTitle: anom.title,
                  anomalySeverity: anom.severity,
                  subcontractorName: anom.subcontractorName,
                  location: anom.location,
                  status: anom.status,
                });
              }
              return events;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((evt) => {
              const isClosure = evt.stage === 'cloture';
              const isInProgress = evt.stage === 'prise_en_charge';
              const isAction = evt.stage === 'action_corrective';

              return (
                <div key={evt.id} className="relative group">
                  {/* Timeline Dot on line */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 ring-white shadow-xs ${
                      isClosure
                        ? 'bg-emerald-600'
                        : isAction
                        ? 'bg-blue-600'
                        : isInProgress
                        ? 'bg-amber-500'
                        : 'bg-red-600'
                    }`}
                  >
                    {isClosure ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : isAction ? (
                      <Clock className="w-3.5 h-3.5" />
                    ) : isInProgress ? (
                      <Wrench className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Card for Event */}
                  <div className="bg-slate-50 hover:bg-white border border-slate-200 rounded-xl p-4 transition-all hover:shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isClosure
                              ? 'bg-emerald-100 text-emerald-800'
                              : isAction
                              ? 'bg-blue-100 text-blue-800'
                              : isInProgress
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isClosure
                            ? 'Étape 4 · Clôture'
                            : isAction
                            ? 'Étape 3 · Mesure Corrective'
                            : isInProgress
                            ? 'Étape 2 · Prise en charge'
                            : 'Étape 1 · Constat'}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{evt.title}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {evt.date}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mb-2 flex flex-wrap items-center gap-3">
                      <span>Anomalie : <strong className="text-slate-800">{evt.anomalyTitle}</strong></span>
                      <span>·</span>
                      <span>Sous-traitant : <strong className="text-amber-800">{evt.subcontractorName}</strong></span>
                      <span>·</span>
                      <span>Lieu : <strong>{evt.location}</strong></span>
                      <span>·</span>
                      <span>Auteur : <strong>{evt.author}</strong></span>
                    </div>

                    {evt.comment && (
                      <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                        {evt.comment}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hidden Printable Sheet for Single Anomaly / Order to Subcontractor */}
      {selectedAnomalyForPrint && (
        <div className="hidden print:block printable-report bg-white p-8 text-black">
          <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-center">
            <div>
              <div className="font-black text-xl tracking-wider">GCB - GÉNIE CIVIL ET BÂTIMENT</div>
              <div className="text-sm font-semibold">DIRECTION BÂTIMENT · SUIVI DES SOUS-TRAITANTS</div>
              <div className="text-xs mt-1 font-mono">Chantier : {project.name} · Code : {project.code}</div>
            </div>
            <div className="text-right">
              <div className="text-base font-black border-2 border-black px-3 py-1 uppercase">
                FICHE DE NON-CONFORMITÉ & TRAÇABILITÉ N° {selectedAnomalyForPrint.id}
              </div>
              <div className="text-xs mt-1">Date d'émission : {selectedAnomalyForPrint.date}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border border-black p-3 mb-4 text-xs">
            <div>
              <strong>Sous-Traitant Destinataire :</strong> {selectedAnomalyForPrint.subcontractorName}
            </div>
            <div>
              <strong>Localisation Précise :</strong> {selectedAnomalyForPrint.location}
            </div>
            <div>
              <strong>Corps d'état :</strong> {selectedAnomalyForPrint.category.toUpperCase()}
            </div>
            <div>
              <strong>Niveau de Gravité :</strong> {selectedAnomalyForPrint.severity.toUpperCase()}
            </div>
            <div>
              <strong>Date Limite de Reprise :</strong> {selectedAnomalyForPrint.deadlineDate}
            </div>
            <div>
              <strong>Statut Actuel :</strong> {selectedAnomalyForPrint.status.toUpperCase()}
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="border border-black p-3">
              <strong className="block text-sm mb-1 uppercase">1. Constat du Désordre / Malfaçon :</strong>
              <div className="font-bold mb-1">{selectedAnomalyForPrint.title}</div>
              <p>{selectedAnomalyForPrint.description}</p>
            </div>

            <div className="border-2 border-black p-3 bg-slate-50">
              <strong className="block text-sm mb-1 uppercase">2. Instructions & Recommandations Techniques (Ordre de Reprise) :</strong>
              <p className="leading-relaxed font-semibold">{selectedAnomalyForPrint.recommendation}</p>
            </div>

            {/* Lifecycle Timeline Table in Print */}
            <div className="border border-black p-3">
              <strong className="block text-sm mb-2 uppercase">3. Chronologie & Suivi du Cycle de Vie des Travaux :</strong>
              <table className="w-full border-collapse border border-slate-400 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-left">
                    <th className="border border-slate-400 p-1.5">Étape du Cycle</th>
                    <th className="border border-slate-400 p-1.5">Date</th>
                    <th className="border border-slate-400 p-1.5">Intervenant / Visa</th>
                    <th className="border border-slate-400 p-1.5">Observations / Mesures Effectuées</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-400 p-1.5 font-bold">1. Constat & Notification</td>
                    <td className="border border-slate-400 p-1.5 font-mono">{selectedAnomalyForPrint.date}</td>
                    <td className="border border-slate-400 p-1.5">{selectedAnomalyForPrint.verifiedBy || 'Superviseur GCB'}</td>
                    <td className="border border-slate-400 p-1.5">Ordre de reprise notifié. Délai : {selectedAnomalyForPrint.deadlineDate}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-1.5 font-bold">2. Prise en charge</td>
                    <td className="border border-slate-400 p-1.5 font-mono">{selectedAnomalyForPrint.inProgressDate || 'En attente'}</td>
                    <td className="border border-slate-400 p-1.5">{selectedAnomalyForPrint.subcontractorName}</td>
                    <td className="border border-slate-400 p-1.5">{selectedAnomalyForPrint.inProgressNotes || 'Mobilisation sous-traitant'}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-1.5 font-bold">3. Mesure Corrective</td>
                    <td className="border border-slate-400 p-1.5 font-mono">{selectedAnomalyForPrint.resolvedDate || 'En cours'}</td>
                    <td className="border border-slate-400 p-1.5">{selectedAnomalyForPrint.subcontractorName}</td>
                    <td className="border border-slate-400 p-1.5">{selectedAnomalyForPrint.actionTaken || 'Travaux de réfection selon DTR'}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 p-1.5 font-bold">4. Clôture & Quitus GCB</td>
                    <td className="border border-slate-400 p-1.5 font-mono">{selectedAnomalyForPrint.resolvedDate || 'Non validée'}</td>
                    <td className="border border-slate-400 p-1.5">{selectedAnomalyForPrint.verifiedBy || 'Conducteur GCB'}</td>
                    <td className="border border-slate-400 p-1.5">{selectedAnomalyForPrint.closureNotes || (selectedAnomalyForPrint.status === 'resolue' ? 'Réserve levée après contrôle contradictoire' : 'Contre-visite contradictoire finale requise')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-12 pt-6 text-xs text-center border-t border-black">
            <div>
              <div className="font-bold uppercase">Le Conducteur de Travaux GCB</div>
              <div className="mt-12 text-slate-400 italic">Signature & Cachet</div>
            </div>
            <div>
              <div className="font-bold uppercase">Accusé de Réception par le Sous-Traitant</div>
              <div className="mt-12 text-slate-400 italic">Nom, Date & Signature</div>
            </div>
          </div>
        </div>
      )}

      {/* Add Anomaly Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-base">Fiche de Non-Conformité & Recommandation</h3>
                  <p className="text-xs text-red-200">Notification d'anomalie et instruction technique au sous-traitant</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-red-200 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Type de Réserve Selector */}
              <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-blue-900 uppercase flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-700" />
                    Type de Réserve / Défaut Référencé
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsInlineCreateType(!isInlineCreateType)}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 underline cursor-pointer"
                  >
                    {isInlineCreateType ? 'Annuler' : '➕ Créer un nouveau type...'}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <select
                    value={selectedReserveTypeId}
                    onChange={(e) => handleSelectReserveType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-blue-300 rounded-lg outline-hidden font-semibold bg-white text-slate-800"
                  >
                    <option value="">-- Choisir un type de réserve prédéfini --</option>
                    {availableReserveTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        [{rt.category}] {rt.name} (Gravité {rt.defaultSeverity})
                      </option>
                    ))}
                    <option value="__new__">➕ Créer un nouveau type de réserve personnalisé...</option>
                  </select>
                </div>

                {/* Inline Creation Box if user clicked '+ Créer' or selected __new__ */}
                {isInlineCreateType && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-blue-300 shadow-2xs space-y-2.5">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <FolderPlus className="w-3.5 h-3.5 text-amber-600" />
                      Nouveau Type de Réserve Personnalisé
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">
                          Intitulé de la Réserve *
                        </label>
                        <input
                          type="text"
                          value={newTypeName}
                          onChange={(e) => setNewTypeName(e.target.value)}
                          placeholder="Ex: Défaut d'étanchéité acrotère"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">
                          Catégorie
                        </label>
                        <select
                          value={newTypeCategory}
                          onChange={(e) => setNewTypeCategory(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md outline-hidden"
                        >
                          <option value="Maçonnerie">Maçonnerie</option>
                          <option value="Finitions">Finitions</option>
                          <option value="Gros Œuvre">Gros Œuvre</option>
                          <option value="Sécurité / HSE">Sécurité / HSE</option>
                          <option value="Matériaux">Matériaux</option>
                          <option value="Menuiserie">Menuiserie</option>
                          <option value="Plomberie">Plomberie</option>
                          <option value="Électricité">Électricité</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">
                          Gravité par Défaut
                        </label>
                        <select
                          value={newTypeSeverity}
                          onChange={(e) => setNewTypeSeverity(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md outline-hidden font-semibold"
                        >
                          <option value="mineure">Mineure</option>
                          <option value="majeure">Majeure</option>
                          <option value="critique">Critique</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">
                          Description technique / Règle
                        </label>
                        <input
                          type="text"
                          value={newTypeDescription}
                          onChange={(e) => setNewTypeDescription(e.target.value)}
                          placeholder="Ex: Tolérance max 10mm, ref DTR E 2.4"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md outline-hidden"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsInlineCreateType(false)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
                      >
                        Fermer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCreateNewReserveType()}
                        disabled={!newTypeName.trim()}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-md text-xs shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        Ajouter ce type
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Presets buttons */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Modèles DTR Rapides (Cliquez pour pré-remplir la recommandation) :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyPresetRecommendation('aplomb')}
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:border-amber-500 rounded text-xs font-medium text-slate-700 cursor-pointer"
                  >
                    Défaut d'aplomb maçonnerie
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetRecommendation('fissure')}
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:border-amber-500 rounded text-xs font-medium text-slate-700 cursor-pointer"
                  >
                    Fissure enduit de façade
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetRecommendation('mortier')}
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:border-amber-500 rounded text-xs font-medium text-slate-700 cursor-pointer"
                  >
                    Mortier remouillé
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetRecommendation('carrelage')}
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:border-amber-500 rounded text-xs font-medium text-slate-700 cursor-pointer"
                  >
                    Carrelage qui sonne le creux
                  </button>
                </div>
              </div>

              {/* Sous-traitant & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Sous-Traitant Responsable *
                  </label>
                  <select
                    required
                    value={formSubId}
                    onChange={(e) => setFormSubId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-hidden font-semibold"
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
                    Date du Constat *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-hidden font-medium"
                  />
                </div>
              </div>

              {/* Localisation, Catégorie & Gravité */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Localisation Précise *
                  </label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Ex: Bloc B - 2ème étage - Appt 06"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Catégorie
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden"
                  >
                    <option value="maconnerie">Maçonnerie</option>
                    <option value="finition">Finition</option>
                    <option value="materiaux">Qualité Matériaux</option>
                    <option value="securite">Sécurité / HSE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Niveau de Gravité
                  </label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden font-bold"
                  >
                    <option value="mineure">Mineure (Tolérable temporairement)</option>
                    <option value="majeure">Majeure (À corriger sous 48h)</option>
                    <option value="critique">Critique (Arrêt immédiat du poste)</option>
                  </select>
                </div>
              </div>

              {/* Intitulé & Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Objet de la Non-Conformité *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Faux-aplomb excessif sur cloison maçonnerie"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Description détaillée du défaut constaté *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Décrivez les désordres mesurés (écart en mm, surface touchée, manque de dosage...)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-hidden"
                />
              </div>

              {/* Recommandation & Délai */}
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-amber-900 uppercase mb-1">
                    Instruction / Recommandation Technique Donnée au Sous-Traitant *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formRecommendation}
                    onChange={(e) => setFormRecommendation(e.target.value)}
                    placeholder="Précisez la solution technique imposée (Démolition, piquage, double encollage, arrosage abondant selon DTR...)"
                    className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-900 uppercase mb-1">
                    Date Limite de Levée de Réserve (Délai accordé) *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-amber-300 rounded-lg font-mono font-bold bg-white"
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
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm shadow-sm cursor-pointer"
                >
                  Enregistrer l'Anomalie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Reserve Types Manager Modal */}
      {isReserveTypesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Tag className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base">Référentiel des Types de Réserves & Non-Conformités</h3>
                  <p className="text-xs text-slate-400">
                    Ajoutez vos propres types de réserves pour standardiser le contrôle de vos chantiers GCB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReserveTypesModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Add New Type Box */}
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-amber-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Ajouter un Nouveau Type de Réserve Personnalisé
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Intitulé / Désignation de la Réserve *
                    </label>
                    <input
                      type="text"
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      placeholder="Ex: Faux-aplomb linteau, Fissuration enduit..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Catégorie de Travaux
                    </label>
                    <select
                      value={newTypeCategory}
                      onChange={(e) => setNewTypeCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden bg-white"
                    >
                      <option value="Maçonnerie">Maçonnerie</option>
                      <option value="Finitions">Finitions</option>
                      <option value="Gros Œuvre">Gros Œuvre</option>
                      <option value="Sécurité / HSE">Sécurité / HSE</option>
                      <option value="Matériaux">Matériaux</option>
                      <option value="Menuiserie">Menuiserie</option>
                      <option value="Plomberie">Plomberie</option>
                      <option value="Électricité">Électricité</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gravité par Défaut
                    </label>
                    <select
                      value={newTypeSeverity}
                      onChange={(e) => setNewTypeSeverity(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden bg-white font-bold"
                    >
                      <option value="mineure">Mineure (Tolérable temporairement)</option>
                      <option value="majeure">Majeure (À corriger sous 48h)</option>
                      <option value="critique">Critique (Arrêt immédiat du poste)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Règle Technique / Description / Tolérance
                    </label>
                    <input
                      type="text"
                      value={newTypeDescription}
                      onChange={(e) => setNewTypeDescription(e.target.value)}
                      placeholder="Ex: Selon DTR E 2.4 - Écart max 10 mm"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleCreateNewReserveType()}
                    disabled={!newTypeName.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold rounded-lg text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Enregistrer ce Type de Réserve
                  </button>
                </div>
              </div>

              {/* List of Existing Reserve Types */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-slate-500">
                    Types de réserves disponibles ({availableReserveTypes.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Cliquez sur la corbeille pour supprimer un type personnalisé
                  </span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-72 overflow-y-auto bg-slate-50/50">
                  {availableReserveTypes.map((rt) => (
                    <div
                      key={rt.id}
                      className="p-3 bg-white flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-900">
                            {rt.name}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                            {rt.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              rt.defaultSeverity === 'critique'
                                ? 'bg-red-100 text-red-700'
                                : rt.defaultSeverity === 'majeure'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            Gravité {rt.defaultSeverity}
                          </span>
                          {rt.isCustom && (
                            <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded-full">
                              Personnalisé
                            </span>
                          )}
                        </div>
                        {rt.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {rt.description}
                          </p>
                        )}
                      </div>

                      {rt.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomType(rt.id)}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                          title="Supprimer ce type personnalisé"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsReserveTypesModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
              >
                Fermer le Gestionnaire
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Prise en charge par le Sous-Traitant */}
      {anomalyToInProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-amber-500 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                <h3 className="font-extrabold text-base">Prise en charge de la Réserve</h3>
              </div>
              <button
                onClick={() => setAnomalyToInProgress(null)}
                className="text-white/80 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmInProgress} className="p-6 space-y-4 text-xs">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
                <div className="font-bold text-xs uppercase mb-1">Non-conformité concernée :</div>
                <div className="font-extrabold text-sm">{anomalyToInProgress.title}</div>
                <div className="text-[11px] text-amber-800 mt-1">
                  Sous-traitant : <strong>{anomalyToInProgress.subcontractorName}</strong> · Lieu : {anomalyToInProgress.location}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Date de démarrage des travaux d'intervention *
                </label>
                <input
                  type="date"
                  required
                  value={inProgressDateVal}
                  onChange={(e) => setInProgressDateVal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold outline-hidden focus:border-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Dispositions prises & Mobilisation du sous-traitant *
                </label>
                <textarea
                  rows={3}
                  required
                  value={inProgressNotesVal}
                  onChange={(e) => setInProgressNotesVal(e.target.value)}
                  placeholder="Ex: Équipe de 2 maçons mobilisée, piquetage de l'enduit dégradé, évacuation gravats et reprise du dressage..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-hidden focus:border-amber-500 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAnomalyToInProgress(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Enregistrer la Prise en Charge</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Clôture & Levée Contradictoire de la Réserve */}
      {anomalyToResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-extrabold text-base">Contrôle de Récolement & Levée de Réserve</h3>
              </div>
              <button
                onClick={() => setAnomalyToResolve(null)}
                className="text-white/80 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="p-6 space-y-4 text-xs">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900">
                <div className="font-bold text-xs uppercase mb-1">Non-conformité à clôturer :</div>
                <div className="font-extrabold text-sm">{anomalyToResolve.title}</div>
                <div className="text-[11px] text-emerald-800 mt-1">
                  Constat initial du <strong>{anomalyToResolve.date}</strong> · Délai fixé au {anomalyToResolve.deadlineDate}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Date effective de levée *
                  </label>
                  <input
                    type="date"
                    required
                    value={resolveDate}
                    onChange={(e) => setResolveDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold outline-hidden focus:border-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Vérificateur / Visa GCB *
                  </label>
                  <input
                    type="text"
                    required
                    value={resolveVerifiedBy}
                    onChange={(e) => setResolveVerifiedBy(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold outline-hidden focus:border-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Mesures correctives effectivement exécutées *
                </label>
                <textarea
                  rows={2}
                  required
                  value={resolveActionTaken}
                  onChange={(e) => setResolveActionTaken(e.target.value)}
                  placeholder="Ex: Démolition de la zone hors aplomb, pose de nouveaux blocs de brique au fil à plomb selon tolérances DTR..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-hidden focus:border-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Observations de clôture & Quitus technique GCB
                </label>
                <input
                  type="text"
                  value={resolveClosureNotes}
                  onChange={(e) => setResolveClosureNotes(e.target.value)}
                  placeholder="Ex: Contrôle contradictoire concluant. Écart mesuré < 3mm. Quitus accordé."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-hidden focus:border-emerald-500 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAnomalyToResolve(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider la Levée & Clôturer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
