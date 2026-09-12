import React from 'react';
import { 
  Building2, 
  Building,
  HardHat, 
  Calculator, 
  AlertTriangle, 
  Layers, 
  FileText, 
  CalendarRange, 
  Settings, 
  Download, 
  Upload, 
  Sparkles,
  CheckCircle2,
  Clock,
  Layers3,
  UserCheck,
  ShieldCheck,
  Eye,
  LogOut,
  Users
} from 'lucide-react';
import { ProjectInfo, UserRole, UserSession } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  project: ProjectInfo;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onEditProject: () => void;
  onOpenBackup: () => void;
  onOpenEngineeringTools: () => void;
  onOpenAccessManagement: () => void;
  openAnomaliesCount: number;
  totalSubcontractorsCount: number;
  userRole: UserRole;
  currentSession: UserSession | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  activeTab,
  setActiveTab,
  onEditProject,
  onOpenBackup,
  onOpenEngineeringTools,
  onOpenAccessManagement,
  openAnomaliesCount,
  totalSubcontractorsCount,
  userRole,
  currentSession,
  onLogout,
}) => {
  // Navigation tabs visible according to role
  // Superviseur: full access to input and view everything
  // Responsable: strictly consultation of dashboard, finishing m², anomalies, daily reports, weekly reports
  const allTabs = [
    { id: 'dashboard', label: 'Tableau de Bord & Synthèse', icon: Building2, roles: ['superviseur', 'responsable'] },
    { id: 'floor-progress', label: 'Avancement par Étage & Bloc', icon: Building, roles: ['superviseur', 'responsable'] },
    { id: 'subcontractors', label: 'Sous-Traitants', icon: HardHat, badge: totalSubcontractorsCount, roles: ['superviseur'] },
    { id: 'daily-logs', label: 'Pointage Journalier', icon: Clock, roles: ['superviseur'] },
    { id: 'brick-calc', label: 'Calcul Briques & Palettes', icon: Calculator, roles: ['superviseur'] },
    { id: 'finishing', label: 'Avancement Travaux & Métrés', icon: Layers, roles: ['superviseur', 'responsable'] },
    { id: 'anomalies', label: 'Anomalies & Réserves', icon: AlertTriangle, badge: openAnomaliesCount, badgeColor: 'bg-red-500 text-white', roles: ['superviseur', 'responsable'] },
    { id: 'daily-report', label: 'Rapports Journaliers', icon: FileText, roles: ['superviseur', 'responsable'] },
    { id: 'weekly-reports', label: 'Rapports Hebdo & Synthèse GCB', icon: CalendarRange, roles: ['superviseur', 'responsable'] },
  ];

  const visibleTabs = allTabs.filter(t => t.roles.includes(userRole));

  return (
    <header className="bg-slate-900 text-white shadow-xl border-b border-slate-800 no-print">
      {/* Top Banner - GCB Official Branding */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Corporate Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500 text-slate-950 font-black tracking-wider text-lg shadow-md shadow-amber-500/20">
              GCB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-amber-400 tracking-wide">
                  GCB · GÉNIE CIVIL ET BÂTIMENT
                </span>
                <span className="hidden sm:inline-block text-[11px] uppercase tracking-wider text-slate-400 border border-slate-700 rounded px-1.5 py-0.5">
                  Filiale Sonatrach
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Plateforme de Suivi des Sous-traitants & Contrôle des Travaux
              </p>
            </div>
          </div>

          {/* User Session & Fast Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            {/* Mobile PWA Install Button */}
            <PWAInstallButton />

            {/* Active User / Role Badge */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 shadow-inner">
              <div className={`p-1 rounded-md ${userRole === 'superviseur' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {userRole === 'superviseur' ? <HardHat className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    userRole === 'superviseur' 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {userRole === 'superviseur' ? 'Superviseur' : 'Responsable'}
                  </span>
                  {userRole === 'responsable' && (
                    <span className="text-[10px] text-emerald-300 font-medium hidden sm:inline">
                      (Lecture Seule)
                    </span>
                  )}
                </div>
                {currentSession && (
                  <div className="text-[11px] text-slate-400 font-mono truncate max-w-[130px] sm:max-w-[180px]">
                    {currentSession.email}
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={onLogout}
                title="Se déconnecter et changer de compte"
                className="ml-1 p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Superviseur-Only Actions: Access Management */}
            {userRole === 'superviseur' && (
              <button
                type="button"
                onClick={onOpenAccessManagement}
                className="flex items-center gap-1.5 bg-blue-900/80 hover:bg-blue-800 text-blue-200 border border-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Gérer les accès Firebase et autoriser de nouveaux responsables"
              >
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Gérer les Accès (Firebase)</span>
              </button>
            )}

            {/* Project edit modal button (superviseur only) */}
            {userRole === 'superviseur' && (
              <button
                onClick={onEditProject}
                id="header-project-badge-btn"
                title="Modifier les informations du projet"
                className="group flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <div className="hidden sm:block">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Projet</div>
                  <div className="text-xs font-semibold text-slate-100 max-w-[120px] truncate">
                    {project.name}
                  </div>
                </div>
                <Settings className="w-3 h-3 text-slate-400 group-hover:text-amber-400 transition-colors ml-0.5" />
              </button>
            )}

            {/* Engineering & Suggestions Tool */}
            {userRole === 'superviseur' && (
              <button
                onClick={onOpenEngineeringTools}
                id="header-tools-btn"
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-3 py-2 rounded-lg text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                title="Conseils DTR, calculs de rendement et ratios GCB"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Outils & Ratios</span>
              </button>
            )}

            {/* Backup & Cloud Storage (superviseur only) */}
            {userRole === 'superviseur' && (
              <button
                onClick={onOpenBackup}
                id="header-backup-btn"
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                title="Sauvegarde et synchronisation Cloud"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden lg:inline">Stockage Cloud</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Global Progress & Project Info Bar */}
      <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <div>
              <span className="text-slate-400">Projet : </span>
              <span className="font-semibold text-white">{project.name}</span>
            </div>
            <div>
              <span className="text-slate-400">Code : </span>
              <span className="font-semibold text-amber-300 font-mono">{project.code}</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-slate-400">Lieu : </span>
              <span className="font-semibold text-slate-200">{project.location}</span>
            </div>
            <div className="hidden md:block">
              <span className="text-slate-400">Conducteur : </span>
              <span className="font-semibold text-slate-200">{project.supervisorName}</span>
            </div>
          </div>

          {/* Global Project Progress */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-slate-300 whitespace-nowrap font-medium">
              Avancement Global :
            </span>
            <div className="flex-1 sm:w-40 bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, project.globalProgressPercentage))}%` }}
              />
            </div>
            <span className="font-bold text-amber-400 font-mono text-sm">
              {project.globalProgressPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="px-4 bg-slate-950 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex gap-1 sm:gap-2 min-w-max py-2">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all relative cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      tab.badgeColor || (isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-amber-300 border border-slate-700')
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
