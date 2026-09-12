import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot,
  getDocFromServer,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  ProjectInfo, 
  Subcontractor, 
  DailyLog, 
  BrickFloorCalculation, 
  Anomaly, 
  FinishingLot, 
  WeeklyReport, 
  ReserveType,
  AuthorizedUser 
} from '../types';

export const FirestoreService = {
  // === Team & Access Management (Firebase Firestore) ===
  async getAuthorizedUsers(): Promise<AuthorizedUser[]> {
    try {
      const snap = await getDocs(collection(db, 'authorized_users'));
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as AuthorizedUser);
      }
      return [];
    } catch (e) {
      console.warn('Firestore: getAuthorizedUsers error', e);
      return [];
    }
  },

  subscribeAuthorizedUsers(callback: (users: AuthorizedUser[]) => void) {
    try {
      return onSnapshot(collection(db, 'authorized_users'), (snapshot) => {
        const users = snapshot.docs.map(doc => doc.data() as AuthorizedUser);
        callback(users);
      }, (err) => {
        console.warn('Firestore snapshot error on authorized_users:', err);
      });
    } catch (e) {
      console.warn('Firestore subscription failed:', e);
      return () => {};
    }
  },

  async saveAuthorizedUser(user: AuthorizedUser) {
    try {
      await setDoc(doc(db, 'authorized_users', user.id), user);
    } catch (e) {
      console.warn('Firestore: saveAuthorizedUser error', e);
      throw e;
    }
  },

  async deleteAuthorizedUser(id: string) {
    try {
      await deleteDoc(doc(db, 'authorized_users', id));
    } catch (e) {
      console.warn('Firestore: deleteAuthorizedUser error', e);
      throw e;
    }
  },

  async findUserByEmail(email: string): Promise<AuthorizedUser | null> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const q = query(collection(db, 'authorized_users'), where('email', '==', cleanEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as AuthorizedUser;
      }
      return null;
    } catch (e) {
      console.warn('Firestore: findUserByEmail error', e);
      return null;
    }
  },

  async seedInitialAdminIfEmpty(adminEmail: string) {
    try {
      const existing = await this.getAuthorizedUsers();
      if (existing.length === 0) {
        const initialUsers: AuthorizedUser[] = [
          {
            id: 'admin-master',
            email: adminEmail.toLowerCase().trim(),
            fullName: 'Nacim Hamadache (Chef de Projet / Admin)',
            role: 'superviseur',
            organization: 'GCB Spa',
            isActive: true,
            createdAt: new Date().toISOString(),
            addedBy: 'Système'
          },
          {
            id: 'resp-demo',
            email: 'direction@gcb.dz',
            fullName: 'Direction Technique & Suivi',
            role: 'responsable',
            organization: 'GCB Direction',
            isActive: true,
            createdAt: new Date().toISOString(),
            addedBy: 'Système'
          }
        ];

        for (const u of initialUsers) {
          await this.saveAuthorizedUser(u);
        }
      }
    } catch (e) {
      console.warn('Seed initial admin error:', e);
    }
  },

  // Sync Project
  async saveProject(project: ProjectInfo) {
    try {
      await setDoc(doc(db, 'projects', project.id || 'current'), project);
    } catch (e) {
      console.warn('Firestore: saveProject fallback to local only', e);
    }
  },

  async getProject(): Promise<ProjectInfo | null> {
    try {
      const snap = await getDocs(collection(db, 'projects'));
      if (!snap.empty) {
        return snap.docs[0].data() as ProjectInfo;
      }
      return null;
    } catch (e) {
      console.warn('Firestore: getProject error', e);
      return null;
    }
  },

  // Sync Subcontractors
  async getSubcontractors(): Promise<Subcontractor[]> {
    try {
      const snap = await getDocs(collection(db, 'subcontractors'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as Subcontractor);
      }
      return [];
    } catch (e) {
      console.warn('Firestore: getSubcontractors error', e);
      return [];
    }
  },

  subscribeSubcontractors(callback: (subs: Subcontractor[]) => void) {
    try {
      return onSnapshot(collection(db, 'subcontractors'), (snapshot) => {
        if (!snapshot.empty) {
          const subs = snapshot.docs.map((doc) => doc.data() as Subcontractor);
          callback(subs);
        }
      }, (err) => console.warn('Subcontractors snapshot err:', err));
    } catch (e) {
      console.warn('Subscribe subcontractors error', e);
      return () => {};
    }
  },

  async saveSubcontractor(sub: Subcontractor) {
    try {
      await setDoc(doc(db, 'subcontractors', sub.id), sub);
    } catch (e) {
      console.warn('Firestore: saveSubcontractor error', e);
    }
  },

  async deleteSubcontractor(id: string) {
    try {
      await deleteDoc(doc(db, 'subcontractors', id));
    } catch (e) {
      console.warn('Firestore: deleteSubcontractor error', e);
    }
  },

  // Sync Daily Logs
  async getDailyLogs(): Promise<DailyLog[]> {
    try {
      const snap = await getDocs(collection(db, 'dailyLogs'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as DailyLog);
      }
      return [];
    } catch (e) {
      console.warn('Firestore: getDailyLogs error', e);
      return [];
    }
  },

  subscribeDailyLogs(callback: (logs: DailyLog[]) => void) {
    try {
      return onSnapshot(collection(db, 'dailyLogs'), (snapshot) => {
        if (!snapshot.empty) {
          const logs = snapshot.docs.map((doc) => doc.data() as DailyLog);
          callback(logs);
        }
      }, (err) => console.warn('DailyLogs snapshot err:', err));
    } catch (e) {
      console.warn('Subscribe dailyLogs error', e);
      return () => {};
    }
  },

  async saveDailyLog(log: DailyLog) {
    try {
      await setDoc(doc(db, 'dailyLogs', log.id), log);
    } catch (e) {
      console.warn('Firestore: saveDailyLog error', e);
    }
  },

  async deleteDailyLog(id: string) {
    try {
      await deleteDoc(doc(db, 'dailyLogs', id));
    } catch (e) {
      console.warn('Firestore: deleteDailyLog error', e);
    }
  },

  // Sync Anomalies
  async getAnomalies(): Promise<Anomaly[]> {
    try {
      const snap = await getDocs(collection(db, 'anomalies'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as Anomaly);
      }
      return [];
    } catch (e) {
      console.warn('Firestore: getAnomalies error', e);
      return [];
    }
  },

  subscribeAnomalies(callback: (anomalies: Anomaly[]) => void) {
    try {
      return onSnapshot(collection(db, 'anomalies'), (snapshot) => {
        if (!snapshot.empty) {
          const anoms = snapshot.docs.map((doc) => doc.data() as Anomaly);
          callback(anoms);
        }
      }, (err) => console.warn('Anomalies snapshot err:', err));
    } catch (e) {
      console.warn('Subscribe anomalies error', e);
      return () => {};
    }
  },

  async saveAnomaly(anomaly: Anomaly) {
    try {
      await setDoc(doc(db, 'anomalies', anomaly.id), anomaly);
    } catch (e) {
      console.warn('Firestore: saveAnomaly error', e);
    }
  },

  async deleteAnomaly(id: string) {
    try {
      await deleteDoc(doc(db, 'anomalies', id));
    } catch (e) {
      console.warn('Firestore: deleteAnomaly error', e);
    }
  },

  // Sync Finishing Lots
  async getFinishingLots(): Promise<FinishingLot[]> {
    try {
      const snap = await getDocs(collection(db, 'finishingLots'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as FinishingLot);
      }
      return [];
    } catch (e) {
      console.warn('Firestore: getFinishingLots error', e);
      return [];
    }
  },

  subscribeFinishingLots(callback: (lots: FinishingLot[]) => void) {
    try {
      return onSnapshot(collection(db, 'finishingLots'), (snapshot) => {
        if (!snapshot.empty) {
          const lots = snapshot.docs.map((doc) => doc.data() as FinishingLot);
          callback(lots);
        }
      }, (err) => console.warn('FinishingLots snapshot err:', err));
    } catch (e) {
      console.warn('Subscribe finishingLots error', e);
      return () => {};
    }
  },

  async saveFinishingLot(lot: FinishingLot) {
    try {
      await setDoc(doc(db, 'finishingLots', lot.id), lot);
    } catch (e) {
      console.warn('Firestore: saveFinishingLot error', e);
    }
  },

  async deleteFinishingLot(id: string) {
    try {
      await deleteDoc(doc(db, 'finishingLots', id));
    } catch (e) {
      console.warn('Firestore: deleteFinishingLot error', e);
    }
  },

  // Sync Reserve Types
  async getReserveTypes(): Promise<ReserveType[]> {
    try {
      const snap = await getDocs(collection(db, 'reserveTypes'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as ReserveType);
      }
      return [];
    } catch (e) {
      console.warn('Firestore: getReserveTypes error', e);
      return [];
    }
  },

  async saveReserveType(type: ReserveType) {
    try {
      await setDoc(doc(db, 'reserveTypes', type.id), type);
    } catch (e) {
      console.warn('Firestore: saveReserveType error', e);
    }
  },

  async deleteReserveType(id: string) {
    try {
      await deleteDoc(doc(db, 'reserveTypes', id));
    } catch (e) {
      console.warn('Firestore: deleteReserveType error', e);
    }
  },

  // Sync Weekly Reports
  async getWeeklyReports(): Promise<WeeklyReport[]> {
    try {
      const snap = await getDocs(collection(db, 'weeklyReports'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as WeeklyReport);
      }
      return [];
    } catch (e) {
      console.warn('Firestore: getWeeklyReports error', e);
      return [];
    }
  },

  async saveWeeklyReport(report: WeeklyReport) {
    try {
      await setDoc(doc(db, 'weeklyReports', report.id), report);
    } catch (e) {
      console.warn('Firestore: saveWeeklyReport error', e);
    }
  },

  async deleteWeeklyReport(id: string) {
    try {
      await deleteDoc(doc(db, 'weeklyReports', id));
    } catch (e) {
      console.warn('Firestore: deleteWeeklyReport error', e);
    }
  },

  // Sync Calculations
  async getCalculations(): Promise<BrickFloorCalculation[]> {
    try {
      const snap = await getDocs(collection(db, 'calculations'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as BrickFloorCalculation);
      }
      return [];
    } catch (e) {
      console.warn('Firestore: getCalculations error', e);
      return [];
    }
  },

  async saveCalculation(calc: BrickFloorCalculation) {
    try {
      await setDoc(doc(db, 'calculations', calc.id), calc);
    } catch (e) {
      console.warn('Firestore: saveCalculation error', e);
    }
  },

  async deleteCalculation(id: string) {
    try {
      await deleteDoc(doc(db, 'calculations', id));
    } catch (e) {
      console.warn('Firestore: deleteCalculation error', e);
    }
  },

  // Seed project & subcontractors if cloud is completely fresh
  async initializeCloudWithDefaultsIfEmpty(defaults: {
    project: ProjectInfo;
    subcontractors: Subcontractor[];
    finishingLots: FinishingLot[];
    reserveTypes: ReserveType[];
    calculations: BrickFloorCalculation[];
  }) {
    try {
      const existingProject = await this.getProject();
      if (!existingProject) {
        await this.saveProject(defaults.project);
        for (const s of defaults.subcontractors) {
          await this.saveSubcontractor(s);
        }
        for (const l of defaults.finishingLots) {
          await this.saveFinishingLot(l);
        }
        for (const r of defaults.reserveTypes) {
          await this.saveReserveType(r);
        }
        for (const c of defaults.calculations) {
          await this.saveCalculation(c);
        }
      }
    } catch (e) {
      console.warn('Initialize cloud defaults failed (offline or network issue):', e);
    }
  },

  // Bulk Cloud Sync (Pushes all local data to Cloud Firestore)
  async pushAllToCloud(data: {
    project: ProjectInfo;
    subcontractors: Subcontractor[];
    dailyLogs: DailyLog[];
    calculations: BrickFloorCalculation[];
    anomalies: Anomaly[];
    finishingLots: FinishingLot[];
    weeklyReports: WeeklyReport[];
    reserveTypes: ReserveType[];
  }) {
    await this.saveProject(data.project);

    for (const sub of data.subcontractors) {
      await this.saveSubcontractor(sub);
    }
    for (const log of data.dailyLogs) {
      await this.saveDailyLog(log);
    }
    for (const anom of data.anomalies) {
      await this.saveAnomaly(anom);
    }
    for (const lot of data.finishingLots) {
      await this.saveFinishingLot(lot);
    }
    for (const rt of data.reserveTypes) {
      await this.saveReserveType(rt);
    }
    for (const rep of data.weeklyReports) {
      await this.saveWeeklyReport(rep);
    }
    for (const c of data.calculations) {
      await this.saveCalculation(c);
    }
  }
};
