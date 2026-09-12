import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Wrench,
  CheckCircle2,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Anomaly, AnomalyTimelineEvent, UserRole } from '../types';

interface AnomalyTimelineProps {
  anomaly: Anomaly;
  userRole?: UserRole;
  currentUserName?: string;
  onUpdateAnomaly: (anomaly: Anomaly) => void;
  onOpenResolveModal?: (anomaly: Anomaly) => void;
  onOpenInProgressModal?: (anomaly: Anomaly) => void;
}

export const AnomalyTimeline: React.FC<AnomalyTimelineProps> = ({
  anomaly,
  userRole = 'superviseur',
  currentUserName = 'Conducteur de Travaux GCB',
  onUpdateAnomaly,
  onOpenResolveModal,
  onOpenInProgressModal,
}) => {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [eventStage, setEventStage] = useState<'prise_en_charge' | 'action_corrective' | 'cloture'>('prise_en_charge');
  const [eventTitle, setEventTitle] = useState('');
  const [eventComment, setEventComment] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));

  // Determine current lifecycle step index:
  // 0: Ouverte (Constat émis)
  // 1: Prise en charge / En cours
  // 2: Correction effectuée
  // 3: Clôture & Levée validée
  const currentStep = anomaly.status === 'resolue' ? 3 : anomaly.status === 'en_cours' ? 1 : 0;

  // Calcul des jours & délais
  const openDateObj = new Date(anomaly.date);
  const deadlineDateObj = new Date(anomaly.deadlineDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTimeSinceOpen = Math.floor((today.getTime() - openDateObj.getTime()) / (1000 * 3600 * 24));
  const diffTimeDeadline = Math.floor((deadlineDateObj.getTime() - today.getTime()) / (1000 * 3600 * 24));
  const isOverdue = anomaly.status !== 'resolue' && diffTimeDeadline < 0;

  // Durée de traitement si résolue
  let resolutionDays: number | null = null;
  if (anomaly.status === 'resolue' && anomaly.resolvedDate) {
    const resDateObj = new Date(anomaly.resolvedDate);
    resolutionDays = Math.max(0, Math.floor((resDateObj.getTime() - openDateObj.getTime()) / (1000 * 3600 * 24)));
  }

  // Construct standard 4-step visual lifecycle milestones
  const steps = [
    {
      id: 'step-open',
      index: 0,
      title: '1. Constat & Notification',
      shortTitle: 'Constat',
      date: anomaly.date,
      author: anomaly.verifiedBy || 'Superviseur GCB',
      status: 'completed' as const,
      description: `Ordre de reprise notifié à ${anomaly.subcontractorName}`,
      icon: AlertTriangle,
    },
    {
      id: 'step-progress',
      index: 1,
      title: '2. Prise en charge & Intervention',
      shortTitle: 'Prise en charge',
      date: anomaly.inProgressDate || (currentStep >= 1 ? anomaly.date : 'En attente'),
      author: anomaly.subcontractorName,
      status: currentStep >= 1 ? 'completed' : 'pending',
      description: anomaly.inProgressNotes || (currentStep >= 1 ? 'Travaux de démolition/réfection engagés' : 'Démarrage sous-traitant attendu'),
      icon: Wrench,
    },
    {
      id: 'step-correction',
      index: 2,
      title: '3. Mesure Corrective Réalisée',
      shortTitle: 'Réparation',
      date: anomaly.resolvedDate || (currentStep >= 3 ? anomaly.resolvedDate : 'En cours'),
      author: anomaly.subcontractorName,
      status: currentStep >= 3 ? 'completed' : currentStep === 1 ? 'current' : 'pending',
      description: anomaly.actionTaken || (currentStep === 1 ? 'Reprise en cours d\'exécution' : 'En attente de réfection'),
      icon: Clock,
    },
    {
      id: 'step-closed',
      index: 3,
      title: '4. Contrôle & Clôture Définitive',
      shortTitle: 'Levée validée',
      date: anomaly.resolvedDate || 'Non validée',
      author: anomaly.verifiedBy || 'Conducteur de Travaux GCB',
      status: currentStep === 3 ? 'completed' : 'pending',
      description: anomaly.closureNotes || (currentStep === 3 ? 'Contrôle contradictoire concluant (Conforme DTR)' : 'Contre-visite finale à effectuer'),
      icon: CheckCircle2,
    },
  ];

  // Quick Action to move to In Progress
  const handleQuickMoveToInProgress = () => {
    if (onOpenInProgressModal) {
      onOpenInProgressModal(anomaly);
      return;
    }
    const notes = prompt('Précisez les mesures d\'intervention du sous-traitant (ex: Équipe mobilisée, démolition entamée...) :');
    if (notes === null) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const newEvent: AnomalyTimelineEvent = {
      id: `evt-${Date.now()}`,
      stage: 'prise_en_charge',
      title: 'Démarrage de la reprise par le sous-traitant',
      date: todayStr,
      author: `${anomaly.subcontractorName} / ${currentUserName}`,
      comment: notes || 'Ordre de reprise pris en compte. Équipes sur place.',
      statusSnapshot: 'en_cours',
    };

    const updatedHistory = [...(anomaly.history || []), newEvent];
    const updated: Anomaly = {
      ...anomaly,
      status: 'en_cours',
      inProgressDate: todayStr,
      inProgressNotes: notes || 'Équipe mobilisée sur site.',
      history: updatedHistory,
    };
    onUpdateAnomaly(updated);
  };

  // Quick Action to resolve
  const handleQuickResolve = () => {
    if (onOpenResolveModal) {
      onOpenResolveModal(anomaly);
      return;
    }
    const action = prompt('Description des travaux correctifs effectués (ex: Reconstitution d\'aplomb, ponçage, reprise conforme...) :');
    if (action === null) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const newEvent: AnomalyTimelineEvent = {
      id: `evt-${Date.now()}`,
      stage: 'cloture',
      title: 'Réserve Levée & Contrôle de conformité validé',
      date: todayStr,
      author: currentUserName,
      comment: action || 'Reprise vérifiée conforme aux tolérances DTR.',
      statusSnapshot: 'resolue',
    };

    const updatedHistory = [...(anomaly.history || []), newEvent];
    const updated: Anomaly = {
      ...anomaly,
      status: 'resolue',
      resolvedDate: todayStr,
      actionTaken: action || 'Reprise conforme validée par GCB.',
      closureNotes: 'Contrôle contradictoire validé.',
      verifiedBy: currentUserName,
      history: updatedHistory,
    };
    onUpdateAnomaly(updated);
  };

  // Quick Action to reopen
  const handleReopenAnomaly = () => {
    const reason = prompt('Motif de réouverture (ex: Malfaçon persistante lors de la contre-visite...) :');
    if (reason === null) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const newEvent: AnomalyTimelineEvent = {
      id: `evt-${Date.now()}`,
      stage: 'ouverture',
      title: 'Réouverture de la non-conformité',
      date: todayStr,
      author: currentUserName,
      comment: reason || 'Réouverture suite à non-conformité résiduelle.',
      statusSnapshot: 'en_cours',
    };

    const updatedHistory = [...(anomaly.history || []), newEvent];
    const updated: Anomaly = {
      ...anomaly,
      status: 'en_cours',
      resolvedDate: undefined,
      history: updatedHistory,
    };
    onUpdateAnomaly(updated);
  };

  // Add custom event to history
  const handleAddCustomEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEvent: AnomalyTimelineEvent = {
      id: `evt-${Date.now()}`,
      stage: eventStage,
      title: eventTitle.trim(),
      date: eventDate,
      author: currentUserName,
      comment: eventComment.trim(),
      statusSnapshot: anomaly.status,
    };

    const updatedHistory = [...(anomaly.history || []), newEvent];
    const updated: Anomaly = {
      ...anomaly,
      history: updatedHistory,
    };
    onUpdateAnomaly(updated);

    // Reset
    setEventTitle('');
    setEventComment('');
    setIsAddEventOpen(false);
  };

  // Progress percentage of lifecycle
  const progressPct = anomaly.status === 'resolue' ? 100 : anomaly.status === 'en_cours' ? 50 : 25;

  return (
    <div className="mt-4 pt-4 border-t border-slate-200/80">
      {/* Header of Timeline */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Cycle de Vie & Chronologie</span>
          </div>

          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
              anomaly.status === 'resolue'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : anomaly.status === 'en_cours'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {anomaly.status === 'resolue'
              ? 'Étape 4/4 · Clôture Validée (100%)'
              : anomaly.status === 'en_cours'
              ? 'Étape 2/4 · Traitement en cours (50%)'
              : 'Étape 1/4 · Constat Ouvert (25%)'}
          </span>
        </div>

        {/* SLA / Time indicator */}
        <div className="flex items-center gap-3 text-xs">
          {anomaly.status === 'resolue' ? (
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Délai de résolution : {resolutionDays !== null ? `${resolutionDays} jour(s)` : 'Effectuée'}</span>
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">
                Ouverte depuis <strong className="text-slate-700">{diffTimeSinceOpen}j</strong>
              </span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${
                  isOverdue
                    ? 'bg-red-100 text-red-700 border border-red-200 font-bold'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {isOverdue ? `Échue depuis ${Math.abs(diffTimeDeadline)}j` : `Reste ${diffTimeDeadline}j`}
              </span>
            </div>
          )}

          {/* Lifecycle quick transition buttons */}
          <div className="flex items-center gap-1.5">
            {anomaly.status === 'ouverte' && (
              <button
                type="button"
                onClick={handleQuickMoveToInProgress}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                title="Démarrer la prise en charge par le sous-traitant"
              >
                <Wrench className="w-3 h-3" />
                <span>Passer En cours</span>
              </button>
            )}

            {anomaly.status === 'en_cours' && (
              <button
                type="button"
                onClick={handleQuickResolve}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                title="Valider la levée de réserve et clôturer la fiche"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Lever la Réserve</span>
              </button>
            )}

            {anomaly.status === 'resolue' && (
              <button
                type="button"
                onClick={handleReopenAnomaly}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] rounded-lg border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                title="Rouvrir cette anomalie si le défaut réapparaît"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>Rouvrir</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar with Milestones */}
      <div className="relative mb-5 pt-2">
        {/* Progress Background Line */}
        <div className="absolute top-6 left-6 right-6 h-1.5 bg-slate-200 rounded-full z-0">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              anomaly.status === 'resolue'
                ? 'bg-emerald-500'
                : anomaly.status === 'en_cours'
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* 4 Step Nodes */}
        <div className="grid grid-cols-4 relative z-10 text-center">
          {steps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center px-1">
                {/* Node Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-xs ${
                    isCompleted
                      ? idx === 3
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : isCurrent
                      ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                      : 'bg-white text-slate-400 border-2 border-slate-300'
                  }`}
                  title={step.title}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Node Label & Date */}
                <div className="mt-2 text-center w-full">
                  <div
                    className={`text-[11px] font-bold leading-tight line-clamp-1 ${
                      isCompleted
                        ? 'text-slate-900'
                        : isCurrent
                        ? 'text-amber-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.shortTitle}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    {step.date}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
                    {step.author}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Structured Lifecycle Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 text-xs">
        {/* Stage 1: Constat initial */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase mb-1">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-red-500" />
              1. Notification
            </span>
            <span className="text-emerald-700 font-mono">Fait</span>
          </div>
          <div className="font-semibold text-slate-800 text-[11px] line-clamp-1">{anomaly.title}</div>
          <div className="text-[10px] text-slate-500 mt-1">
            Délai fixé au : <strong className="text-slate-700 font-mono">{anomaly.deadlineDate}</strong>
          </div>
        </div>

        {/* Stage 2: Prise en charge */}
        <div
          className={`p-2.5 rounded-xl border shadow-2xs ${
            currentStep >= 1
              ? 'bg-white border-slate-200'
              : 'bg-slate-50/60 border-dashed border-slate-200 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
            <span className="flex items-center gap-1 text-slate-500">
              <Wrench className="w-3 h-3 text-amber-500" />
              2. Prise en charge
            </span>
            <span className={`font-mono ${currentStep >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
              {currentStep >= 1 ? 'Engagée' : 'En attente'}
            </span>
          </div>
          <div className="text-[11px] text-slate-800 line-clamp-2">
            {anomaly.inProgressNotes || (currentStep >= 1 ? 'Ordre de reprise notifié au sous-traitant' : 'En attente de démarrage')}
          </div>
          {anomaly.inProgressDate && (
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              Le {anomaly.inProgressDate}
            </div>
          )}
        </div>

        {/* Stage 3: Travaux correctifs */}
        <div
          className={`p-2.5 rounded-xl border shadow-2xs ${
            currentStep >= 2
              ? 'bg-white border-slate-200'
              : 'bg-slate-50/60 border-dashed border-slate-200 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3 text-blue-500" />
              3. Réparation
            </span>
            <span className={`font-mono ${anomaly.actionTaken ? 'text-emerald-600' : 'text-slate-400'}`}>
              {anomaly.actionTaken ? 'Effectuée' : 'À réaliser'}
            </span>
          </div>
          <div className="text-[11px] text-slate-800 line-clamp-2">
            {anomaly.actionTaken || 'Mesure corrective imposée selon prescriptions GCB'}
          </div>
        </div>

        {/* Stage 4: Contrôle & Quitus */}
        <div
          className={`p-2.5 rounded-xl border shadow-2xs ${
            anomaly.status === 'resolue'
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
              : 'bg-slate-50/60 border-dashed border-slate-200 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className={`w-3 h-3 ${anomaly.status === 'resolue' ? 'text-emerald-600' : 'text-slate-400'}`} />
              4. Clôture GCB
            </span>
            <span className={`font-mono ${anomaly.status === 'resolue' ? 'text-emerald-700' : 'text-slate-400'}`}>
              {anomaly.status === 'resolue' ? 'Levée ✓' : 'Non validée'}
            </span>
          </div>
          <div className="text-[11px] font-medium line-clamp-2">
            {anomaly.status === 'resolue'
              ? anomaly.closureNotes || `Visa de conformité accordé par ${anomaly.verifiedBy}`
              : 'Visite de contrôle contradictoire finale requise'}
          </div>
          {anomaly.resolvedDate && (
            <div className="text-[10px] text-emerald-800 font-mono mt-1">
              Clôturée le {anomaly.resolvedDate}
            </div>
          )}
        </div>
      </div>

      {/* Accordion Toggle for Detailed Audit Log / History Events */}
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
          className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {isHistoryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>
            {isHistoryExpanded ? 'Masquer le journal d\'audit' : 'Afficher le journal d\'audit complet'} ({anomaly.history?.length || 1} événement{(anomaly.history?.length || 1) > 1 ? 's' : ''})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsAddEventOpen(!isAddEventOpen)}
          className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
        >
          {isAddEventOpen ? 'Annuler' : '➕ Ajouter une note d\'étape au journal...'}
        </button>
      </div>

      {/* Inline Form to Add Event */}
      {isAddEventOpen && (
        <form onSubmit={handleAddCustomEvent} className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2.5 text-xs">
          <div className="font-bold text-blue-900 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-700" />
            <span>Ajouter une observation ou jalon dans la chronologie</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">Étape du cycle</label>
              <select
                value={eventStage}
                onChange={(e) => setEventStage(e.target.value as any)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white font-medium outline-hidden"
              >
                <option value="prise_en_charge">2. Prise en charge</option>
                <option value="action_corrective">3. Mesure corrective</option>
                <option value="cloture">4. Clôture / Contrôle</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">Date de l'événement</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white font-medium outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">Intitulé de l'action *</label>
              <input
                type="text"
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Ex: Évacuation gravats, pose trame..."
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white font-medium outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">Commentaires & Détails techniques</label>
            <textarea
              rows={2}
              value={eventComment}
              onChange={(e) => setEventComment(e.target.value)}
              placeholder="Précisez le constat intermédiaire, les effectifs ou le résultat de l'essai..."
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddEventOpen(false)}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-900"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-2xs cursor-pointer"
            >
              Enregistrer l'événement
            </button>
          </div>
        </form>
      )}

      {/* Expanded Audit Log Items */}
      {isHistoryExpanded && (
        <div className="mt-3 bg-slate-50/80 rounded-xl p-3 border border-slate-200 divide-y divide-slate-200/70 space-y-2">
          {anomaly.history && anomaly.history.length > 0 ? (
            anomaly.history.map((evt) => (
              <div key={evt.id} className="pt-2 first:pt-0 flex items-start gap-2.5 text-xs">
                <div
                  className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    evt.stage === 'cloture'
                      ? 'bg-emerald-100 text-emerald-800'
                      : evt.stage === 'action_corrective'
                      ? 'bg-blue-100 text-blue-800'
                      : evt.stage === 'prise_en_charge'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {evt.stage === 'cloture' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : evt.stage === 'action_corrective' ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : evt.stage === 'prise_en_charge' ? (
                    <Wrench className="w-3.5 h-3.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-bold text-slate-900">{evt.title}</span>
                    <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {evt.date}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Intervenant : <strong>{evt.author}</strong></span>
                  </div>
                  {evt.comment && (
                    <p className="text-slate-700 text-[11px] mt-1 bg-white p-2 rounded-md border border-slate-200/60 leading-relaxed">
                      {evt.comment}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            // Fallback default events based on anomaly state
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-red-100 text-red-800 rounded-lg shrink-0 mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Constat & Notification de non-conformité</span>
                    <span className="text-[10px] font-mono text-slate-500">{anomaly.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{anomaly.description}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Émis par : {anomaly.verifiedBy || 'Superviseur GCB'}</p>
                </div>
              </div>

              {anomaly.status === 'resolue' && (
                <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200">
                  <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">Levée de Réserve & Validation GCB</span>
                      <span className="text-[10px] font-mono text-slate-500">{anomaly.resolvedDate || anomaly.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{anomaly.actionTaken || 'Reprise conforme validée.'}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Validé par : {anomaly.verifiedBy || 'Conducteur de Travaux GCB'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
