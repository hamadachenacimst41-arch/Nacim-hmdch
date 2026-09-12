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
  FloorWorkProgress,
} from '../types';
import {
  initialProjectInfo,
  initialSubcontractors,
  initialBrickCalculations,
  initialAnomalies,
  initialFinishingLots,
  initialDailyLogs,
  initialWeeklyReports,
  initialReserveTypes,
  initialFloorWorkProgresses,
} from '../data/initialData';

const STORAGE_KEYS = {
  PROJECT: 'gcb_suivi_project',
  SUBCONTRACTORS: 'gcb_suivi_subcontractors',
  DAILY_LOGS: 'gcb_suivi_daily_logs',
  BRICKS: 'gcb_suivi_brick_calculations',
  ANOMALIES: 'gcb_suivi_anomalies',
  FINISHING: 'gcb_suivi_finishing_lots',
  FLOOR_PROGRESS: 'gcb_suivi_floor_progress',
  WEEKLY_REPORTS: 'gcb_suivi_weekly_reports',
  RESERVE_TYPES: 'gcb_suivi_reserve_types',
  USER_ROLE: 'gcb_suivi_user_role',
  CURRENT_SESSION: 'gcb_suivi_current_session',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.warn(`Erreur lors de la lecture de ${key} depuis le stockage local:`, e);
    return fallback;
  }
}

function safeSet<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Erreur lors de la sauvegarde de ${key}:`, e);
  }
}

export const Storage = {
  getProject: (): ProjectInfo => safeGet(STORAGE_KEYS.PROJECT, initialProjectInfo),
  saveProject: (data: ProjectInfo) => safeSet(STORAGE_KEYS.PROJECT, data),

  getSubcontractors: (): Subcontractor[] => safeGet(STORAGE_KEYS.SUBCONTRACTORS, initialSubcontractors),
  saveSubcontractors: (data: Subcontractor[]) => safeSet(STORAGE_KEYS.SUBCONTRACTORS, data),

  getDailyLogs: (): DailyLog[] => safeGet(STORAGE_KEYS.DAILY_LOGS, initialDailyLogs),
  saveDailyLogs: (data: DailyLog[]) => safeSet(STORAGE_KEYS.DAILY_LOGS, data),

  getBricks: (): BrickFloorCalculation[] => safeGet(STORAGE_KEYS.BRICKS, initialBrickCalculations),
  saveBricks: (data: BrickFloorCalculation[]) => safeSet(STORAGE_KEYS.BRICKS, data),

  getAnomalies: (): Anomaly[] => safeGet(STORAGE_KEYS.ANOMALIES, initialAnomalies),
  saveAnomalies: (data: Anomaly[]) => safeSet(STORAGE_KEYS.ANOMALIES, data),

  getFinishingLots: (): FinishingLot[] => safeGet(STORAGE_KEYS.FINISHING, initialFinishingLots),
  saveFinishingLots: (data: FinishingLot[]) => safeSet(STORAGE_KEYS.FINISHING, data),

  getWeeklyReports: (): WeeklyReport[] => safeGet(STORAGE_KEYS.WEEKLY_REPORTS, initialWeeklyReports),
  saveWeeklyReports: (data: WeeklyReport[]) => safeSet(STORAGE_KEYS.WEEKLY_REPORTS, data),

  getReserveTypes: (): ReserveType[] => safeGet(STORAGE_KEYS.RESERVE_TYPES, initialReserveTypes),
  saveReserveTypes: (data: ReserveType[]) => safeSet(STORAGE_KEYS.RESERVE_TYPES, data),

  getFloorWorkProgresses: (): FloorWorkProgress[] => safeGet(STORAGE_KEYS.FLOOR_PROGRESS, initialFloorWorkProgresses),
  saveFloorWorkProgresses: (data: FloorWorkProgress[]) => safeSet(STORAGE_KEYS.FLOOR_PROGRESS, data),

  getUserRole: (): 'superviseur' | 'responsable' => {
    const session = Storage.getSession();
    if (session && (session.role === 'responsable' || session.role === 'superviseur')) {
      return session.role;
    }
    const saved = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    if (saved === 'responsable' || saved === 'superviseur') return saved;
    return 'superviseur';
  },
  saveUserRole: (role: 'superviseur' | 'responsable') => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    } catch (e) {
      console.warn('Erreur sauvegarde role:', e);
    }
  },

  getSession: (): UserSession | null => safeGet<UserSession | null>(STORAGE_KEYS.CURRENT_SESSION, null),
  saveSession: (session: UserSession | null) => {
    if (session) {
      safeSet(STORAGE_KEYS.CURRENT_SESSION, session);
      safeSet(STORAGE_KEYS.USER_ROLE, session.role);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }
  },
  clearSession: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  },

  // Aliases for convenience
  loadProject: (): ProjectInfo => Storage.getProject(),
  loadSubcontractors: (): Subcontractor[] => Storage.getSubcontractors(),
  loadDailyLogs: (): DailyLog[] => Storage.getDailyLogs(),
  loadBrickCalculations: (): BrickFloorCalculation[] => Storage.getBricks(),
  saveBrickCalculations: (data: BrickFloorCalculation[]) => Storage.saveBricks(data),
  loadAnomalies: (): Anomaly[] => Storage.getAnomalies(),
  loadFinishingLots: (): FinishingLot[] => Storage.getFinishingLots(),
  loadWeeklyReports: (): WeeklyReport[] => Storage.getWeeklyReports(),
  loadReserveTypes: (): ReserveType[] => Storage.getReserveTypes(),
  saveReserveTypesData: (data: ReserveType[]) => Storage.saveReserveTypes(data),
  loadFloorWorkProgresses: (): FloorWorkProgress[] => Storage.getFloorWorkProgresses(),
  saveFloorWorkProgressesData: (data: FloorWorkProgress[]) => Storage.saveFloorWorkProgresses(data),
  downloadBackup: () => Storage.exportBackup(),
  resetToDefault: () => Storage.resetDefaults(),

  exportBackup: () => {
    const fullBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      project: Storage.getProject(),
      subcontractors: Storage.getSubcontractors(),
      dailyLogs: Storage.getDailyLogs(),
      bricks: Storage.getBricks(),
      anomalies: Storage.getAnomalies(),
      finishingLots: Storage.getFinishingLots(),
      floorProgresses: Storage.getFloorWorkProgresses(),
      weeklyReports: Storage.getWeeklyReports(),
      reserveTypes: Storage.getReserveTypes(),
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GCB_Sauvegarde_Chantier_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  importBackup: (jsonContent: string): boolean => {
    try {
      const data = JSON.parse(jsonContent);
      if (data.project) Storage.saveProject(data.project);
      if (data.subcontractors) Storage.saveSubcontractors(data.subcontractors);
      if (data.dailyLogs) Storage.saveDailyLogs(data.dailyLogs);
      if (data.bricks) Storage.saveBricks(data.bricks);
      if (data.anomalies) Storage.saveAnomalies(data.anomalies);
      if (data.finishingLots) Storage.saveFinishingLots(data.finishingLots);
      if (data.floorProgresses) Storage.saveFloorWorkProgresses(data.floorProgresses);
      if (data.weeklyReports) Storage.saveWeeklyReports(data.weeklyReports);
      if (data.reserveTypes) Storage.saveReserveTypes(data.reserveTypes);
      return true;
    } catch (err) {
      console.error('Erreur importation JSON:', err);
      return false;
    }
  },

  resetDefaults: () => {
    Storage.saveProject(initialProjectInfo);
    Storage.saveSubcontractors(initialSubcontractors);
    Storage.saveDailyLogs(initialDailyLogs);
    Storage.saveBricks(initialBrickCalculations);
    Storage.saveAnomalies(initialAnomalies);
    Storage.saveFinishingLots(initialFinishingLots);
    Storage.saveFloorWorkProgresses(initialFloorWorkProgresses);
    Storage.saveWeeklyReports(initialWeeklyReports);
    Storage.saveReserveTypes(initialReserveTypes);
  }
};
