export type TradeType = 'maconnerie' | 'finition' | 'both';

export interface ProjectInfo {
  id: string;
  name: string;
  code: string;
  client: string; // Maître d'ouvrage (ex: ENPI, AADL, DLEP, Sonatrach...)
  location: string;
  supervisorName: string; // Nom du chargé de suivi / Conducteur de travaux GCB
  worksManagerName: string; // Responsable premier des travaux / Chef de projet GCB
  startDate: string;
  plannedCompletionDate: string;
  targetCompletionDate?: string; // alias
  globalProgressPercentage: number;
  blocs: string[]; // ['Bloc A', 'Bloc B', 'Bloc C']
  floors: string[]; // ['Sous-Sol', 'RDC', '1er Étage', '2ème Étage', '3ème Étage', '4ème Étage', '5ème Étage', 'Terrasse']
}

export interface Subcontractor {
  id: string;
  name: string;
  companyName: string;
  trade: TradeType;
  tradesList: string[]; // e.g. ['Maçonnerie Brique 8T/12T', 'Enduit ciment', 'Chape & Carrelage']
  tradeDescription?: string; // alias
  assignedZone: string; // e.g. 'Bloc A - Tous étages'
  assignedBlocs?: string[]; // alias
  phone: string;
  managerName: string;
  contractualProgress: number; // %
  plannedProgress?: number; // alias %
  realProgress: number; // %
  activeWorkers: number;
  nominalWorkers?: number; // Effectif contractuel prévu
  status: 'actif' | 'en_arret' | 'termine';
  contractNumber?: string;
  notes?: string;
  lastReportDate?: string;
}

export interface DailyLog {
  id: string;
  date: string;
  subcontractorId: string;
  subcontractorName: string;
  trade: string;
  lotId?: string; // Liaison directe avec le lot de travaux/métrés (ex: Maçonnerie, Enduit...)
  workDescription: string;
  location: {
    bloc: string;
    floor: string;
    floors?: string[]; // Multiple floors support: ex ['Sous-Sol', '1er Étage']
    detail?: string; // Appt 04, Façade Sud...
  };
  workforce: {
    masons: number;
    laborers: number;
    supervisors: number;
    planned?: number; // Effectif nominal prévu aujourd'hui
    absent?: number; // Nombre d'absents constatés
    absenceReason?: string; // Motif des absences (maladie, transport, pluie...)
  };
  quantityAchieved: {
    amount: number;
    unit: string; // m², ml, pièces
  };
  // Rendement global journalier de l'entreprise (Maçonnerie / Finition)
  companyDailyYield?: {
    totalQuantity: number; // Rendement total de l'entreprise ce jour (m²)
    unit: string; // m²
    masonsCount: number; // Nombre de maçons de l'entreprise ce jour
    averagePerMason: number; // Rendement moyen calculé (m²/maçon/jour)
  };
  // Calcul automatique de l'avancement
  totalLotQuantity?: number; // Quantité totale contractuelle du lot (ex: 12 000 m²)
  previousCompletedQuantity?: number; // Cumul réalisé avant aujourd'hui
  newCompletedQuantity?: number; // Nouveau cumul réalisé après aujourd'hui
  dailyProgressPct: number; // Progression du sous-traitant (%)
  globalProgressImpactPct: number; // Taux d'avancement global du projet (%)
  weather: 'Ensoleillé' | 'Nuageux' | 'Pluvieux' | 'Chaleur intense' | 'Venteux';
  observations: string;
  recommendationsGiven?: string;
  supervisorVisa: boolean;
  managerVisa: boolean;
  createdAt: string;
}

export interface BrickFloorCalculation {
  id: string;
  bloc: string;
  floorName: string;
  wallAreaGross: number; // m² brut
  openingsArea: number; // m² baies (portes, fenêtres)
  wallAreaNet: number; // m² net = brut - ouvertures
  brickType: 'brique_8t' | 'brique_12t' | 'double_paroi' | 'custom';
  brickLabel: string;
  bricksPerM2: number; // standard: 17 pour 8T ou 12T simple paroi, 34 pour double paroi
  wastePercentage: number; // % pertes & casse (ex: 5%)
  totalBricksNeeded: number;
  bricksPerPallet: number; // Règle stricte: 335 briques / palette
  palletsNeededDecimal: number;
  fullPallets: number;
  remainingBricks: number;
  deliveredPallets?: number;
  consumedPallets?: number;
  notes?: string;
  updatedAt: string;
}

export interface ReserveType {
  id: string;
  name: string; // ex: "Faux-aplomb & Verticalité", "Joint sec", "Fissure de retrait"
  category: string; // "Maçonnerie", "Finition", "Gros Œuvre", "Sécurité", "Autre"
  defaultSeverity: 'mineure' | 'majeure' | 'critique';
  description?: string;
  isCustom?: boolean;
}

export interface AnomalyTimelineEvent {
  id: string;
  stage: 'ouverture' | 'prise_en_charge' | 'action_corrective' | 'cloture';
  title: string;
  date: string;
  author: string;
  comment?: string;
  statusSnapshot: 'ouverte' | 'en_cours' | 'resolue';
}

export interface Anomaly {
  id: string;
  date: string;
  subcontractorId: string;
  subcontractorName: string;
  location: string; // Bloc B - 2ème étage - Appt 12
  category: string; // 'maconnerie' | 'finition' | 'securite' | 'materiaux' | ou type personnalisé
  reserveTypeId?: string; // Lien avec le type de réserve personnalisé
  reserveTypeName?: string; // Nom lisible du type de réserve
  severity: 'mineure' | 'majeure' | 'critique';
  title: string;
  description: string;
  recommendation: string; // Instruction/Recommandation donnée au sous-traitant
  deadlineDate: string;
  status: 'ouverte' | 'en_cours' | 'resolue';
  // Cycle de vie & Chronologie
  inProgressDate?: string;
  inProgressNotes?: string;
  resolvedDate?: string;
  actionTaken?: string;
  verifiedBy?: string;
  closureNotes?: string;
  history?: AnomalyTimelineEvent[];
}

export interface FloorWorkProgress {
  id: string;
  bloc: string; // Bloc A, Bloc B, etc.
  floor: string; // Sous-Sol, RDC, 1er Étage, etc.
  workType: string; // 'Maçonnerie Brique 8T & 12T', 'Enduit / Crépissage Ciment', 'Finition Plâtre', 'Carrelage Sol', 'Peinture', ou personnalisé
  unit: string; // 'm²', 'ml', 'pièces'
  totalTargetArea: number; // المساحة الكلية المطلوبة لهذا الطابق (م²)
  completedArea: number; // المساحة المنجزة حتى اليوم (م²)
  dailyInputs?: {
    id: string;
    date: string;
    amountAchieved: number; // الكمية المضافة بهذا اليوم (م²)
    enteredBy?: string;
    notes?: string;
  }[];
  subcontractorName?: string;
  lastUpdatedDate: string;
  notes?: string;
}

export interface FinishingLot {
  id: string;
  name: string; // e.g. "Maçonnerie Brique 8T & 12T", "Enduit plâtre intérieur", "Carrelage sols intérieurs"
  category: string; // 'maconnerie' | 'enduit_interieur' | 'enduit_exterieur' | 'carrelage_sol' | 'faience_murs' | 'faux_plafond' | 'peinture' | 'etancheite' | 'autre'
  unit: string; // m², ml, u
  totalContractArea: number; // Surface / Quantité totale contractuelle (m²) entrée une seule fois
  completedArea: number; // Surface / Quantité cumulée réalisée à ce jour (m²)
  subcontractorId: string;
  subcontractorName: string;
  assignedBlocs: string;
  targetDate: string;
  notes?: string;
}

export interface WeeklyReport {
  id: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  title: string;
  globalProgressStart: number;
  globalProgressEnd: number;
  weeklyProgressDelta: number;
  subcontractorPerformances: {
    subcontractorId: string;
    subcontractorName: string;
    trade: string;
    workersAvg: number;
    progressGained: number; // %
    totalRealProgress: number; // %
    appreciation: string;
  }[];
  brickConsumption: {
    palletsUsed: number;
    bricksCount: number;
  };
  anomaliesSummary: {
    openedThisWeek: number;
    resolvedThisWeek: number;
    totalOpen: number;
  };
  finishingSummary: {
    lotName: string;
    totalM2: number;
    completedM2: number;
    percentage: number;
  }[];
  generalObservations: string;
  instructionsForNextWeek: string;
  authorName: string;
  submittedTo: string;
  createdAt: string;
}

export type UserRole = 'superviseur' | 'responsable';

export interface AuthorizedUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organization?: string;
  isActive: boolean;
  createdAt: string;
  addedBy?: string;
}

export interface UserSession {
  email: string;
  role: UserRole;
  fullName: string;
  loginTime: string;
}
