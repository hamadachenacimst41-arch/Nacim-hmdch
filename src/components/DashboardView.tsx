import React from 'react';
import { 
  Building2, 
  HardHat, 
  Calculator, 
  AlertTriangle, 
  Layers, 
  FileText, 
  CalendarRange, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Package, 
  ArrowRight,
  Clock,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { ProjectInfo, Subcontractor, DailyLog, BrickFloorCalculation, Anomaly, FinishingLot, UserRole } from '../types';
import { CircularProgress } from './CircularProgress';

interface DashboardViewProps {
  project: ProjectInfo;
  subcontractors: Subcontractor[];
  logs: DailyLog[];
  calculations: BrickFloorCalculation[];
  anomalies: Anomaly[];
  finishingLots: FinishingLot[];
  onNavigateTab: (tabId: string) => void;
  onEditProject: () => void;
  userRole?: UserRole;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  project,
  subcontractors,
  logs,
  calculations,
  anomalies,
  finishingLots,
  onNavigateTab,
  onEditProject,
  userRole = 'superviseur',
}) => {
  const openAnomalies = anomalies.filter((a) => a.status === 'ouverte');
  const criticalAnomalies = anomalies.filter((a) => a.status === 'ouverte' && a.severity === 'critique');
  const totalWorkers = subcontractors.reduce((sum, s) => sum + s.activeWorkers, 0);

  // Brick calculation stats
  const totalPalletsPlanned = calculations.reduce((sum, c) => sum + c.palletsNeededDecimal, 0);
  const totalBricksPlanned = calculations.reduce((sum, c) => sum + c.totalBricksNeeded, 0);

  // Finishing stats
  const totalFinishingM2 = finishingLots.reduce((sum, f) => sum + f.totalContractArea, 0);
  const completedFinishingM2 = finishingLots.reduce((sum, f) => sum + f.completedArea, 0);
  const finishingRate = totalFinishingM2 > 0 ? (completedFinishingM2 / totalFinishingM2) * 100 : 0;

  // Latest log
  const latestLog = logs[0];

  return (
    <div className="space-y-6">
      {/* Welcome & Global Project Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Background graphic accents */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider">
                GCB Direction Bâtiment
              </span>
              <span className="text-xs font-mono text-amber-300 font-semibold">
                Code : {project.code}
              </span>
              <span className="text-xs text-slate-400">
                Lieu : {project.location}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {project.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Supervision technique des travaux de maçonnerie et finition. Suivi continu des sous-traitants,
              gestion rigoureuse des approvisionnements en briques et palettes (335 pcs/pal) et reporting hiérarchique.
            </p>

            <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-400">
              <div>
                Conducteur Suivi : <strong className="text-slate-200">{project.supervisorName}</strong>
              </div>
              <div>
                Responsable Travaux : <strong className="text-slate-200">{project.worksManagerName}</strong>
              </div>
            </div>
          </div>

          {/* Big Progress Gauge Card with Circular Relative Percentage */}
          <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-2xl shrink-0 w-full lg:w-88 shadow-xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Évolution des Travaux
              </span>
              {userRole === 'superviseur' ? (
                <button
                  onClick={onEditProject}
                  className="text-[11px] text-amber-400 hover:underline font-semibold"
                >
                  Modifier %
                </button>
              ) : (
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Directeur / Resp.
                </span>
              )}
            </div>

            {/* Circular Gauge */}
            <CircularProgress
              percentage={project.globalProgressPercentage ?? 0}
              size={175}
              strokeWidth={14}
              label="Taux Réalisé du Chantier"
              sublabel={`Prévu pour : ${project.plannedCompletionDate || project.targetCompletionDate || 'En cours'}`}
            />

            {/* Sub-lots Progress Breakdown Mini-Pills */}
            <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-700/80 text-xs">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/60 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Métré Finition</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {finishingRate.toFixed(1)}%
                </span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/60 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Sous-Traitants</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {subcontractors.length} actifs
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Subcontractors */}
        <div
          onClick={() => onNavigateTab('subcontractors')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sous-Traitants Actifs
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <HardHat className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {subcontractors.length} <span className="text-xs font-normal text-slate-500">entreprises</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {totalWorkers} ouvriers mobilisés
            </span>
            <span className="text-amber-700 font-bold group-hover:translate-x-1 transition-transform">
              Gérer →
            </span>
          </div>
        </div>

        {/* Metric 2: Bricks & Pallets */}
        <div
          onClick={() => onNavigateTab('brick-calc')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Briques & Palettes
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {Math.ceil(totalPalletsPlanned)} <span className="text-xs font-normal text-slate-500">palettes</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span className="font-mono text-amber-700 font-bold">
              1 pal = 335 briques
            </span>
            <span className="text-blue-700 font-bold group-hover:translate-x-1 transition-transform">
              Calculer →
            </span>
          </div>
        </div>

        {/* Metric 3: Finishing m2 */}
        <div
          onClick={() => onNavigateTab('finishing')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Lots de Finition
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {finishingRate.toFixed(1)}% <span className="text-xs font-normal text-slate-500">réalisé</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span className="font-mono text-slate-600">
              {completedFinishingM2.toLocaleString()} / {totalFinishingM2.toLocaleString()} m²
            </span>
            <span className="text-emerald-700 font-bold group-hover:translate-x-1 transition-transform">
              Suivre →
            </span>
          </div>
        </div>

        {/* Metric 4: Anomalies */}
        <div
          onClick={() => onNavigateTab('anomalies')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-red-400 shadow-xs hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Anomalies & Réserves
            </span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600 font-mono">
            {openAnomalies.length} <span className="text-xs font-normal text-slate-500">en attente</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            {criticalAnomalies.length > 0 ? (
              <span className="text-red-700 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                {criticalAnomalies.length} critique(s) !
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold">Aucun point bloquant</span>
            )}
            <span className="text-red-700 font-bold group-hover:translate-x-1 transition-transform">
              Voir →
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons Grid (Superviseur vs Responsable) */}
      <div className="bg-slate-100 p-4 sm:p-5 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {userRole === 'superviseur' 
              ? 'Actions Rapides Conducteur de Travaux & Superviseur' 
              : 'Accès Rapide Décisionnel & Rapports (Mode Responsable)'}
          </h3>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            userRole === 'superviseur' 
              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          }`}>
            {userRole === 'superviseur' ? 'Saisie & Gestion Ouverte' : 'Consultation & Synthèses'}
          </span>
        </div>

        {userRole === 'superviseur' ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <button
              onClick={() => onNavigateTab('floor-progress')}
              className="p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl text-left transition-all shadow-xs group"
            >
              <Building2 className="w-5 h-5 text-amber-600 mb-1 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-slate-900 text-xs sm:text-sm">Avancement Étages</div>
              <div className="text-[11px] text-slate-500">Métrés par bloc & niveau</div>
            </button>

            <button
              onClick={() => onNavigateTab('daily-logs')}
              className="p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl text-left transition-all shadow-xs group"
            >
              <Clock className="w-5 h-5 text-amber-600 mb-1 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-slate-900 text-xs sm:text-sm">Nouveau Pointage</div>
              <div className="text-[11px] text-slate-500">Effectifs et travaux du jour</div>
            </button>

            <button
              onClick={() => onNavigateTab('brick-calc')}
              className="p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl text-left transition-all shadow-xs group"
            >
              <Calculator className="w-5 h-5 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-slate-900 text-xs sm:text-sm">Calculateur Briques</div>
              <div className="text-[11px] text-slate-500">Métré et palettes (335 pcs)</div>
            </button>

            <button
              onClick={() => onNavigateTab('anomalies')}
              className="p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl text-left transition-all shadow-xs group"
            >
              <AlertTriangle className="w-5 h-5 text-red-600 mb-1 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-slate-900 text-xs sm:text-sm">Signaler une Réserve</div>
              <div className="text-[11px] text-slate-500">Ordre de reprise au sous-traitant</div>
            </button>

            <button
              onClick={() => onNavigateTab('daily-report')}
              className="p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl text-left transition-all shadow-xs group"
            >
              <FileText className="w-5 h-5 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-slate-900 text-xs sm:text-sm">Rapport Journalier</div>
              <div className="text-[11px] text-slate-500">Exporter PDF pour la hiérarchie</div>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigateTab('floor-progress')}
              className="p-3.5 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl text-left transition-all shadow-xs group flex items-start gap-3"
            >
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Avancement par Étage & Bloc</div>
                <div className="text-xs text-slate-500">Métrés et % par étage de chaque bâtiment</div>
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('daily-report')}
              className="p-3.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 rounded-xl text-left transition-all shadow-xs group flex items-start gap-3"
            >
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Consulter le Rapport Journalier</div>
                <div className="text-xs text-slate-500">Visa hiérarchique, effectifs réels et météo</div>
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('finishing')}
              className="p-3.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-400 rounded-xl text-left transition-all shadow-xs group flex items-start gap-3"
            >
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Suivi des Métrés & Lots (m²)</div>
                <div className="text-xs text-slate-500">Avancement des enduits, maçonneries et carrelages</div>
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('weekly-reports')}
              className="p-3.5 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-400 rounded-xl text-left transition-all shadow-xs group flex items-start gap-3"
            >
              <div className="p-2 bg-purple-100 text-purple-700 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <CalendarRange className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Synthèse Hebdomadaire GCB</div>
                <div className="text-xs text-slate-500">Rapports d'avancement pour la Direction</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Two columns: Subcontractors status on left, Latest logs and alerts on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Subcontractors Status (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Avancement par Entreprise Sous-Traitante
              </h3>
              <p className="text-xs text-slate-500">
                Taux d'exécution contractuelle vs engagé
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('subcontractors')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              Voir tous ({subcontractors.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {subcontractors.map((sub) => {
              const planned = sub.plannedProgress ?? sub.contractualProgress ?? 0;
              const real = sub.realProgress ?? 0;
              const zoneText = sub.assignedZone || (Array.isArray(sub.assignedBlocs) ? sub.assignedBlocs.join(', ') : 'Zone chantier');
              const lotText = sub.tradeDescription || (sub.tradesList && sub.tradesList.length > 0 ? sub.tradesList.join(' · ') : (sub.trade === 'maconnerie' ? 'Maçonnerie' : 'Finition'));

              return (
                <div key={sub.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{sub.name}</h4>
                      <span className="text-xs text-slate-500 font-medium">
                        Lot : {lotText}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black font-mono text-slate-900">
                        {real}%
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Prévu : {planned}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        real >= planned ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, real))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Effectif actif : <strong className="text-slate-800">{sub.activeWorkers ?? 0} ouvriers</strong></span>
                    <span>Zone : <strong className="text-slate-800">{zoneText}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Latest Daily Logs & Pending Anomalies (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Latest Daily Activity */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Dernières Activités Enregistrées
              </h3>
              <button
                onClick={() => onNavigateTab('daily-logs')}
                className="text-xs font-bold text-amber-700"
              >
                Journal →
              </button>
            </div>

            <div className="space-y-3">
              {logs.slice(0, 3).map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-amber-500 pl-3 py-0.5 space-y-0.5">
                  <div className="flex justify-between font-semibold text-slate-900">
                    <span>{log.subcontractorName}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{log.date}</span>
                  </div>
                  <p className="text-slate-600 line-clamp-1">{log.workDescription}</p>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Fait : {log.quantityAchieved.amount} {log.quantityAchieved.unit} · {log.location.bloc} ({log.location.floor})
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Anomalies box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Réserves & Anomalies en Attente ({openAnomalies.length})
              </h3>
              <button
                onClick={() => onNavigateTab('anomalies')}
                className="text-xs font-bold text-red-600"
              >
                Tout voir →
              </button>
            </div>

            <div className="space-y-2">
              {openAnomalies.slice(0, 3).map((anom) => (
                <div key={anom.id} className="p-2.5 bg-red-50/60 rounded-xl border border-red-200 text-xs space-y-1">
                  <div className="flex items-start justify-between font-bold text-red-900">
                    <span className="line-clamp-1">{anom.title}</span>
                    <span className="text-[10px] uppercase font-black px-1.5 py-0.2 bg-red-200 rounded">
                      {anom.severity}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    S/T : <strong>{anom.subcontractorName}</strong> ({anom.location})
                  </div>
                  <div className="text-amber-900 font-medium text-[11px] line-clamp-1">
                    Recommandation : {anom.recommendation}
                  </div>
                </div>
              ))}

              {openAnomalies.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-400">
                  Aucune anomalie ouverte.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
