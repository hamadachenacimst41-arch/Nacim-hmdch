import React, { useState, useEffect } from 'react';
import { 
  ProjectInfo, 
  Subcontractor, 
  DailyLog, 
  BrickFloorCalculation, 
  Anomaly, 
  FinishingLot, 
  WeeklyReport,
  ReserveType,
  UserRole,
  UserSession,
  FloorWorkProgress
} from './types';
import { Storage } from './utils/storage';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { FloorProgressView } from './components/FloorProgressView';
import { SubcontractorsView } from './components/SubcontractorsView';
import { DailyLogsView } from './components/DailyLogsView';
import { BrickCalculatorView } from './components/BrickCalculatorView';
import { FinishingProgressView } from './components/FinishingProgressView';
import { AnomaliesView } from './components/AnomaliesView';
import { DailyReportView } from './components/DailyReportView';
import { WeeklyReportsView } from './components/WeeklyReportsView';
import { ProjectModal } from './components/ProjectModal';
import { StorageModal } from './components/StorageModal';
import { EngineeringToolsModal } from './components/EngineeringToolsModal';
import { AuthScreen } from './components/AuthScreen';
import { AccessManagementModal } from './components/AccessManagementModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // Session Authentication State (persisted in localStorage)
  const [currentSession, setCurrentSession] = useState<UserSession | null>(() => Storage.getSession());

  // User Role State ('superviseur' or 'responsable') synced with session
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const session = Storage.getSession();
    if (session) return session.role;
    return Storage.getUserRole();
  });

  // Active Tab navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core Data States with localStorage persistence
  const [project, setProject] = useState<ProjectInfo>(() => Storage.loadProject());
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>(() => Storage.loadSubcontractors());
  const [logs, setLogs] = useState<DailyLog[]>(() => Storage.loadDailyLogs());
  const [calculations, setCalculations] = useState<BrickFloorCalculation[]>(() => Storage.loadBrickCalculations());
  const [anomalies, setAnomalies] = useState<Anomaly[]>(() => Storage.loadAnomalies());
  const [finishingLots, setFinishingLots] = useState<FinishingLot[]>(() => Storage.loadFinishingLots());
  const [floorProgresses, setFloorProgresses] = useState<FloorWorkProgress[]>(() => Storage.loadFloorWorkProgresses());
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>(() => Storage.loadWeeklyReports());
  const [reserveTypes, setReserveTypes] = useState<ReserveType[]>(() => Storage.loadReserveTypes());

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [isEngineeringModalOpen, setIsEngineeringModalOpen] = useState(false);
  const [isAccessManagementOpen, setIsAccessManagementOpen] = useState(false);

  // Authentication Handlers
  const handleLoginSuccess = (session: UserSession) => {
    Storage.saveSession(session);
    setCurrentSession(session);
    setUserRole(session.role);
    Storage.saveUserRole(session.role);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    Storage.clearSession();
    setCurrentSession(null);
  };

  // Reload everything when restored from backup
  const refreshAllData = () => {
    setProject(Storage.loadProject());
    setSubcontractors(Storage.loadSubcontractors());
    setLogs(Storage.loadDailyLogs());
    setCalculations(Storage.loadBrickCalculations());
    setAnomalies(Storage.loadAnomalies());
    setFinishingLots(Storage.loadFinishingLots());
    setFloorProgresses(Storage.loadFloorWorkProgresses());
    setWeeklyReports(Storage.loadWeeklyReports());
    setReserveTypes(Storage.loadReserveTypes());
  };

  // --- Project Handlers ---
  const handleUpdateProject = (updated: ProjectInfo) => {
    setProject(updated);
    Storage.saveProject(updated);
  };

  // --- Subcontractor Handlers ---
  const handleAddSubcontractor = (sub: Subcontractor) => {
    const next = [sub, ...subcontractors];
    setSubcontractors(next);
    Storage.saveSubcontractors(next);
  };

  const handleUpdateSubcontractor = (sub: Subcontractor) => {
    const next = subcontractors.map((s) => (s.id === sub.id ? sub : s));
    setSubcontractors(next);
    Storage.saveSubcontractors(next);
  };

  const handleDeleteSubcontractor = (id: string) => {
    const next = subcontractors.filter((s) => s.id !== id);
    setSubcontractors(next);
    Storage.saveSubcontractors(next);
  };

  // --- Daily Logs Handlers ---
  const handleAddDailyLog = (log: DailyLog) => {
    const next = [log, ...logs];
    setLogs(next);
    Storage.saveDailyLogs(next);

    // Automatically update subcontractor realProgress and activeWorkers
    const targetSub = subcontractors.find((s) => s.id === log.subcontractorId);
    if (targetSub) {
      const updatedSub: Subcontractor = {
        ...targetSub,
        realProgress: Math.min(100, parseFloat((targetSub.realProgress + log.dailyProgressPct).toFixed(1))),
        activeWorkers: log.workforce.masons + log.workforce.laborers + log.workforce.supervisors,
        lastReportDate: log.date,
      };
      handleUpdateSubcontractor(updatedSub);
    }

    // Automatically bump global project progress if impact specified
    if (log.globalProgressImpactPct > 0) {
      const newGlobal = Math.min(100, parseFloat((project.globalProgressPercentage + log.globalProgressImpactPct).toFixed(1)));
      handleUpdateProject({ ...project, globalProgressPercentage: newGlobal });
    }
  };

  const handleDeleteDailyLog = (id: string) => {
    const next = logs.filter((l) => l.id !== id);
    setLogs(next);
    Storage.saveDailyLogs(next);
  };

  // --- Brick Calculations Handlers ---
  const handleAddCalculation = (calc: BrickFloorCalculation) => {
    const next = [calc, ...calculations];
    setCalculations(next);
    Storage.saveBrickCalculations(next);
  };

  const handleUpdateCalculation = (calc: BrickFloorCalculation) => {
    const next = calculations.map((c) => (c.id === calc.id ? calc : c));
    setCalculations(next);
    Storage.saveBrickCalculations(next);
  };

  const handleDeleteCalculation = (id: string) => {
    const next = calculations.filter((c) => c.id !== id);
    setCalculations(next);
    Storage.saveBrickCalculations(next);
  };

  // --- Anomalies Handlers ---
  const handleAddAnomaly = (anomaly: Anomaly) => {
    const next = [anomaly, ...anomalies];
    setAnomalies(next);
    Storage.saveAnomalies(next);
  };

  const handleUpdateAnomaly = (anomaly: Anomaly) => {
    const next = anomalies.map((a) => (a.id === anomaly.id ? anomaly : a));
    setAnomalies(next);
    Storage.saveAnomalies(next);
  };

  const handleDeleteAnomaly = (id: string) => {
    const next = anomalies.filter((a) => a.id !== id);
    setAnomalies(next);
    Storage.saveAnomalies(next);
  };

  // --- Finishing Lots Handlers ---
  const handleAddFinishingLot = (lot: FinishingLot) => {
    const next = [lot, ...finishingLots];
    setFinishingLots(next);
    Storage.saveFinishingLots(next);
  };

  const handleUpdateFinishingLot = (lot: FinishingLot) => {
    const next = finishingLots.map((f) => (f.id === lot.id ? lot : f));
    setFinishingLots(next);
    Storage.saveFinishingLots(next);
  };

  const handleDeleteFinishingLot = (id: string) => {
    const next = finishingLots.filter((f) => f.id !== id);
    setFinishingLots(next);
    Storage.saveFinishingLots(next);
  };

  // --- Floor Work Progress Handlers ---
  const handleAddFloorProgress = (item: FloorWorkProgress) => {
    const next = [item, ...floorProgresses];
    setFloorProgresses(next);
    Storage.saveFloorWorkProgresses(next);
  };

  const handleUpdateFloorProgress = (item: FloorWorkProgress) => {
    const next = floorProgresses.map((f) => (f.id === item.id ? item : f));
    setFloorProgresses(next);
    Storage.saveFloorWorkProgresses(next);
  };

  const handleDeleteFloorProgress = (id: string) => {
    const next = floorProgresses.filter((f) => f.id !== id);
    setFloorProgresses(next);
    Storage.saveFloorWorkProgresses(next);
  };

  // --- Weekly Reports Handlers ---
  const handleAddWeeklyReport = (report: WeeklyReport) => {
    const next = [report, ...weeklyReports];
    setWeeklyReports(next);
    Storage.saveWeeklyReports(next);
  };

  const handleDeleteWeeklyReport = (id: string) => {
    const next = weeklyReports.filter((r) => r.id !== id);
    setWeeklyReports(next);
    Storage.saveWeeklyReports(next);
  };

  // --- Reserve Types Handlers ---
  const handleAddReserveType = (type: ReserveType) => {
    const next = [...reserveTypes, type];
    setReserveTypes(next);
    Storage.saveReserveTypes(next);
  };

  const handleDeleteReserveType = (id: string) => {
    const next = reserveTypes.filter((r) => r.id !== id);
    setReserveTypes(next);
    Storage.saveReserveTypes(next);
  };

  // Open anomalies counter for badge
  const openAnomaliesCount = anomalies.filter((a) => a.status === 'ouverte').length;

  // If user is not authenticated, display the official GCB AuthScreen with dual portals
  if (!currentSession) {
    return (
      <AuthScreen 
        onLoginSuccess={handleLoginSuccess}
        masterAdminEmail="hamadache.nacim.st41@gmail.com"
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Official GCB Top Header */}
      <Header
        project={project}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onEditProject={() => setIsProjectModalOpen(true)}
        onOpenBackup={() => setIsStorageModalOpen(true)}
        onOpenEngineeringTools={() => setIsEngineeringModalOpen(true)}
        onOpenAccessManagement={() => setIsAccessManagementOpen(true)}
        openAnomaliesCount={openAnomaliesCount}
        totalSubcontractorsCount={subcontractors.length}
        userRole={userRole}
        currentSession={currentSession}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            project={project}
            subcontractors={subcontractors}
            logs={logs}
            calculations={calculations}
            anomalies={anomalies}
            finishingLots={finishingLots}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onEditProject={() => setIsProjectModalOpen(true)}
            userRole={userRole}
          />
        )}

        {/* Avancement par Étage & Bloc (Accessible to both Superviseur and Responsable) */}
        {activeTab === 'floor-progress' && (
          <FloorProgressView
            floorProgresses={floorProgresses}
            project={project}
            subcontractors={subcontractors}
            onAddFloorProgress={handleAddFloorProgress}
            onUpdateFloorProgress={handleUpdateFloorProgress}
            onDeleteFloorProgress={handleDeleteFloorProgress}
            userRole={userRole}
          />
        )}

        {/* Superviseur-Only Views */}
        {activeTab === 'subcontractors' && (
          userRole === 'superviseur' ? (
            <SubcontractorsView
              subcontractors={subcontractors}
              project={project}
              onAddSubcontractor={handleAddSubcontractor}
              onUpdateSubcontractor={handleUpdateSubcontractor}
              onDeleteSubcontractor={handleDeleteSubcontractor}
            />
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
              <p className="text-slate-600 font-bold mb-3">Cet espace de saisie est réservé au Superviseur de chantier.</p>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
              >
                Retour au Tableau de Bord
              </button>
            </div>
          )
        )}

        {activeTab === 'daily-logs' && (
          userRole === 'superviseur' ? (
            <DailyLogsView
              logs={logs}
              subcontractors={subcontractors}
              project={project}
              onAddLog={handleAddDailyLog}
              onDeleteLog={handleDeleteDailyLog}
            />
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
              <p className="text-slate-600 font-bold mb-3">La saisie des pointages journaliers est réservée au Superviseur.</p>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
              >
                Retour au Tableau de Bord
              </button>
            </div>
          )
        )}

        {activeTab === 'brick-calc' && (
          userRole === 'superviseur' ? (
            <BrickCalculatorView
              calculations={calculations}
              project={project}
              onAddCalculation={handleAddCalculation}
              onUpdateCalculation={handleUpdateCalculation}
              onDeleteCalculation={handleDeleteCalculation}
            />
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
              <p className="text-slate-600 font-bold mb-3">Le module de calcul des briques est réservé au Superviseur.</p>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
              >
                Retour au Tableau de Bord
              </button>
            </div>
          )
        )}

        {/* Both Roles (with strict read-only inside for Responsable) */}
        {activeTab === 'finishing' && (
          <FinishingProgressView
            finishingLots={finishingLots}
            subcontractors={subcontractors}
            project={project}
            onAddLot={handleAddFinishingLot}
            onUpdateLot={handleUpdateFinishingLot}
            onDeleteLot={handleDeleteFinishingLot}
            userRole={userRole}
          />
        )}

        {activeTab === 'anomalies' && (
          <AnomaliesView
            anomalies={anomalies}
            subcontractors={subcontractors}
            project={project}
            reserveTypes={reserveTypes}
            onAddAnomaly={handleAddAnomaly}
            onUpdateAnomaly={handleUpdateAnomaly}
            onDeleteAnomaly={handleDeleteAnomaly}
            onAddReserveType={handleAddReserveType}
            onDeleteReserveType={handleDeleteReserveType}
            userRole={userRole}
          />
        )}

        {activeTab === 'daily-report' && (
          <DailyReportView
            project={project}
            subcontractors={subcontractors}
            logs={logs}
            calculations={calculations}
            anomalies={anomalies}
            userRole={userRole}
          />
        )}

        {activeTab === 'weekly-reports' && (
          <WeeklyReportsView
            reports={weeklyReports}
            project={project}
            subcontractors={subcontractors}
            calculations={calculations}
            anomalies={anomalies}
            finishingLots={finishingLots}
            onAddReport={handleAddWeeklyReport}
            onDeleteReport={handleDeleteWeeklyReport}
            onOpenStorageModal={() => setIsStorageModalOpen(true)}
            userRole={userRole}
          />
        )}
      </main>

      {/* Global Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={project}
        onSave={handleUpdateProject}
      />

      <StorageModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
        onDataRestored={refreshAllData}
      />

      <EngineeringToolsModal
        isOpen={isEngineeringModalOpen}
        onClose={() => setIsEngineeringModalOpen(false)}
      />

      {/* Firebase Access Management Modal (Superviseur Admin only) */}
      <AccessManagementModal
        isOpen={isAccessManagementOpen}
        onClose={() => setIsAccessManagementOpen(false)}
        currentUserEmail={currentSession.email}
      />

      {/* Connectivity & Offline Status */}
      <OfflineIndicator />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">GCB · Génie Civil et Bâtiment</span>
            <span>—</span>
            <span>Direction Bâtiment</span>
          </div>
          <div>
            Application de Suivi Chantier Sous-Traitants (Maçonnerie & Finition) · Règle 335 briques/palette
          </div>
        </div>
      </footer>
    </div>
  );
}
