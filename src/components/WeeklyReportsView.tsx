import React, { useState } from 'react';
import { 
  CalendarRange, 
  Plus, 
  Download, 
  Upload, 
  Printer, 
  Archive, 
  Database, 
  Cloud, 
  CheckCircle2, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  HardHat,
  Sparkles,
  FileCheck,
  ChevronRight,
  FileDown,
  Loader2,
  Check
} from 'lucide-react';
import { WeeklyReport, ProjectInfo, Subcontractor, BrickFloorCalculation, Anomaly, FinishingLot, UserRole } from '../types';
import { Storage } from '../utils/storage';
import { generateWeeklyReportPDF } from '../utils/pdfGenerator';

interface WeeklyReportsViewProps {
  reports: WeeklyReport[];
  project: ProjectInfo;
  subcontractors: Subcontractor[];
  calculations: BrickFloorCalculation[];
  anomalies: Anomaly[];
  finishingLots: FinishingLot[];
  onAddReport: (report: WeeklyReport) => void;
  onDeleteReport: (id: string) => void;
  onOpenStorageModal: () => void;
  userRole?: UserRole;
}

export const WeeklyReportsView: React.FC<WeeklyReportsViewProps> = ({
  reports,
  project,
  subcontractors,
  calculations,
  anomalies,
  finishingLots,
  onAddReport,
  onDeleteReport,
  onOpenStorageModal,
  userRole = 'superviseur',
}) => {
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(reports[0] || null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [exportSuccessId, setExportSuccessId] = useState<string | null>(null);

  // New report form state
  const currentWeek = 20;
  const [formWeekNum, setFormWeekNum] = useState(currentWeek);
  const [formYear, setFormYear] = useState(2025);
  const [formStartDate, setFormStartDate] = useState('2025-05-17');
  const [formEndDate, setFormEndDate] = useState('2025-05-23');
  const [formTitle, setFormTitle] = useState(`Rapport Hebdomadaire N° ${currentWeek} - Suivi Chantier GCB`);
  const [formGeneralObs, setFormGeneralObs] = useState(
    'Rythme soutenu sur la maçonnerie des étages courants. Les sous-traitants de finition maintiennent une cadence conforme. Approvisionnement en briques 8T et ciment régulier.'
  );
  const [formInstructionsNextWeek, setFormInstructionsNextWeek] = useState(
    '1. Clôturer l’ensemble des cloisons maçonnerie du Bloc A.\n2. Lancer la chape de ravoirage sur le 2ème étage.\n3. Veiller à la levée définitive des réserves sur le faux-aplomb Bloc B.'
  );

  const handleExportPDF = (rep: WeeklyReport) => {
    try {
      setIsExportingPDF(true);
      generateWeeklyReportPDF({
        project,
        report: rep,
      });
      setExportSuccessId(rep.id);
      setTimeout(() => setExportSuccessId(null), 2500);
    } catch (err) {
      console.error('Erreur lors de la génération du PDF hebdomadaire:', err);
      alert('Une erreur est survenue lors de la génération du PDF.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-synthesize subcontractor performances
    const subPerformances = subcontractors.map((s) => ({
      subcontractorId: s.id,
      subcontractorName: s.name,
      trade: s.trade === 'maconnerie' ? 'Maçonnerie' : s.trade === 'finition' ? 'Finition' : 'Maçonnerie & Finition',
      workersAvg: s.activeWorkers,
      progressGained: 2.5,
      totalRealProgress: s.realProgress,
      appreciation: 'Activité régulière sur chantier, respect des règles HSE et des instructions.',
    }));

    // Auto-calculate brick stats
    const totalPallets = calculations.reduce((sum, c) => sum + (c.consumedPallets || 5), 0);
    const totalBricks = totalPallets * 335;

    // Anomalies count
    const openAnoms = anomalies.filter((a) => a.status !== 'resolue').length;
    const resolvedAnoms = anomalies.filter((a) => a.status === 'resolue').length;

    // Finishing summary
    const finSummary = finishingLots.map((f) => ({
      lotName: f.name,
      totalM2: f.totalContractArea,
      completedM2: f.completedArea,
      percentage: parseFloat(((f.completedArea / f.totalContractArea) * 100).toFixed(1)),
    }));

    const newReport: WeeklyReport = {
      id: `week-${formWeekNum}-${formYear}-${Date.now()}`,
      weekNumber: formWeekNum,
      year: formYear,
      startDate: formStartDate,
      endDate: formEndDate,
      title: formTitle,
      globalProgressStart: project.globalProgressPercentage - 1.5,
      globalProgressEnd: project.globalProgressPercentage,
      weeklyProgressDelta: 1.5,
      subcontractorPerformances: subPerformances,
      brickConsumption: {
        palletsUsed: totalPallets,
        bricksCount: totalBricks,
      },
      anomaliesSummary: {
        openedThisWeek: 2,
        resolvedThisWeek: 3,
        totalOpen: openAnoms,
      },
      finishingSummary: finSummary,
      generalObservations: formGeneralObs,
      instructionsForNextWeek: formInstructionsNextWeek,
      authorName: project.supervisorName,
      submittedTo: project.worksManagerName,
      createdAt: new Date().toISOString(),
    };

    onAddReport(newReport);
    setSelectedReport(newReport);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Cloud Storage Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                <Archive className="w-3 h-3" />
                Espace de Stockage & Archivage
              </span>
              <span className="text-xs text-amber-400 font-mono">
                Rapports Hebdomadaires GCB
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-100">
              Rapports Hebdomadaires pour le Responsable des Travaux
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              Générez, stockez et archivez chaque semaine la synthèse complète de vos sous-traitants :
              avancement cumulé, consommation de palettes de briques, levée des réserves et planning de la semaine suivante.
            </p>
          </div>

          {/* Cloud Storage & Backup Actions */}
          <div className="flex flex-wrap gap-2">
            {userRole === 'superviseur' ? (
              <>
                <button
                  onClick={onOpenStorageModal}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  Gérer la Sauvegarde & Cloud
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  id="new-weekly-report-btn"
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau Rapport Hebdomadaire
                </button>
              </>
            ) : (
              <div className="text-xs bg-slate-800/80 border border-slate-700 text-emerald-400 px-3.5 py-2 rounded-xl font-bold flex items-center gap-2">
                <span>Espace Décision & Consultation (Lecture Seule)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout: Reports List on Left, Active Report Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Archive List (4 cols) */}
        <div className="lg:col-span-4 space-y-3 no-print">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase">
              Historique des Rapports ({reports.length})
            </span>
            <span className="text-xs text-slate-400 font-mono">Archive Chantier</span>
          </div>

          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {reports.map((rep) => {
              const isSelected = selectedReport?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold bg-slate-900 text-amber-400 px-2 py-0.5 rounded">
                      Semaine {rep.weekNumber} · {rep.year}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      +{rep.weeklyProgressDelta}%
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1 mt-1">
                    {rep.title}
                  </h4>

                  <div className="text-xs text-slate-500 mt-1">
                    Du {rep.startDate} au {rep.endDate}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                    <span>{rep.subcontractorPerformances.length} sous-traitants audités</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportPDF(rep);
                        }}
                        title={`Exporter Semaine ${rep.weekNumber} en PDF`}
                        className="p-1 hover:bg-amber-100 text-amber-800 rounded transition-colors"
                      >
                        {exportSuccessId === rep.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <FileDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span className="text-amber-700 font-medium">Consulter →</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {reports.length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed text-slate-400 text-xs">
                Aucun rapport hebdomadaire sauvegardé. Cliquez sur "Nouveau Rapport Hebdomadaire".
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Selected Report View / Print (8 cols) */}
        <div className="lg:col-span-8">
          {selectedReport ? (
            <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-6 sm:p-10 printable-report text-slate-900">
              {/* Report Action Bar (hidden in print) */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 no-print">
                <span className="text-xs font-mono text-slate-500">
                  Rapport édité pour : <strong className="text-slate-800">{selectedReport.submittedTo}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs border border-slate-300 shadow-xs transition-all"
                    title="Aperçu avant impression papier"
                  >
                    <Printer className="w-4 h-4 text-slate-500" />
                    <span>Imprimer</span>
                  </button>

                  <button
                    onClick={() => handleExportPDF(selectedReport)}
                    id="export-weekly-pdf-btn"
                    disabled={isExportingPDF}
                    className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg text-xs shadow-md transition-all ${
                      exportSuccessId === selectedReport.id
                        ? 'bg-emerald-700 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-slate-950 active:scale-95'
                    }`}
                    title="Télécharger le rapport hebdomadaire complet au format PDF officiel"
                  >
                    {isExportingPDF ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Génération PDF...</span>
                      </>
                    ) : exportSuccessId === selectedReport.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>PDF Téléchargé !</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4" />
                        <span>Exporter en PDF</span>
                      </>
                    )}
                  </button>

                  {userRole === 'superviseur' && (
                    <button
                      onClick={() => {
                        if (confirm('Supprimer ce rapport hebdomadaire ?')) {
                          onDeleteReport(selectedReport.id);
                          setSelectedReport(reports[1] || null);
                        }
                      }}
                      className="text-xs text-red-600 hover:underline px-2 py-1 ml-1"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>

              {/* Official GCB Header */}
              <div className="border-b-2 border-slate-900 pb-5 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg border border-slate-900">
                        GCB
                      </div>
                      <div>
                        <div className="text-sm font-black uppercase text-slate-900">
                          SOCIÉTÉ NATIONALE DE GÉNIE CIVIL ET BÂTIMENT
                        </div>
                        <div className="text-xs text-slate-600 font-semibold">
                          DIRECTION BÂTIMENT · SUIVI DES SOUS-TRAITANTS
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-2 font-mono">
                      Chantier : {project.name} ({project.code})
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="bg-slate-900 text-amber-400 text-xs font-mono font-bold px-3 py-1 rounded inline-block uppercase">
                      RAPPORT HEBDOMADAIRE N° {selectedReport.weekNumber}
                    </div>
                    <div className="text-xs font-bold mt-1">Année {selectedReport.year}</div>
                    <div className="text-[11px] text-slate-500">
                      Période : {selectedReport.startDate} au {selectedReport.endDate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Destinataire & Synthèse Avancement Global */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs mb-6">
                <div>
                  <strong className="text-slate-600 block mb-0.5">Destinataire (Premier Responsable) :</strong>
                  <span className="font-bold text-slate-900 text-sm">{selectedReport.submittedTo}</span>
                  <div className="text-slate-500 mt-1">Rédigé par : {selectedReport.authorName}</div>
                </div>
                <div>
                  <strong className="text-slate-600 block mb-0.5">Progression Globale de la Semaine :</strong>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-emerald-700 font-mono">
                      +{selectedReport.weeklyProgressDelta}%
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      (De {selectedReport.globalProgressStart}% à {selectedReport.globalProgressEnd}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 1: Tableau de Performance des Sous-traitants */}
              <div className="mb-6">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
                  1. Performance & Avancement des Sous-Traitants
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-300">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="border border-slate-300 px-3 py-2">Entreprise</th>
                        <th className="border border-slate-300 px-2 py-2">Lot</th>
                        <th className="border border-slate-300 px-2 py-2 text-center">Effectif Moyen</th>
                        <th className="border border-slate-300 px-2 py-2 text-right">Gain Semaine</th>
                        <th className="border border-slate-300 px-2 py-2 text-right">Taux Réel Total</th>
                        <th className="border border-slate-300 px-3 py-2">Appréciation Conducteur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReport.subcontractorPerformances.map((perf, i) => (
                        <tr key={i} className="border-b border-slate-200">
                          <td className="border border-slate-300 px-3 py-2 font-bold text-slate-900">
                            {perf.subcontractorName}
                          </td>
                          <td className="border border-slate-300 px-2 py-2">{perf.trade}</td>
                          <td className="border border-slate-300 px-2 py-2 text-center font-mono">
                            {perf.workersAvg} ouvriers
                          </td>
                          <td className="border border-slate-300 px-2 py-2 text-right font-mono font-bold text-emerald-700">
                            +{perf.progressGained}%
                          </td>
                          <td className="border border-slate-300 px-2 py-2 text-right font-mono font-bold text-slate-900">
                            {perf.totalRealProgress}%
                          </td>
                          <td className="border border-slate-300 px-3 py-2 text-slate-600 text-[11px]">
                            {perf.appreciation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: Consommation Briques & Palettes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="border border-slate-300 p-4 rounded-xl bg-amber-50/40 text-xs">
                  <h4 className="font-bold uppercase text-[11px] text-amber-900 mb-2 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-700" />
                    Consommation Briques & Palettes (Semaine)
                  </h4>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-2xl font-black text-amber-700 font-mono">
                      {selectedReport.brickConsumption.palletsUsed} palettes
                    </span>
                    <span className="text-slate-600 font-mono font-semibold">
                      (~{selectedReport.brickConsumption.bricksCount.toLocaleString()} briques)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Basé sur la règle certifiée de 335 briques / palette.
                  </p>
                </div>

                <div className="border border-slate-300 p-4 rounded-xl bg-slate-50 text-xs">
                  <h4 className="font-bold uppercase text-[11px] text-slate-900 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Bilan Qualité & Anomalies (Semaine)
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Constatées</span>
                      <strong className="text-base text-red-600 font-mono">
                        {selectedReport.anomaliesSummary.openedThisWeek}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Levées</span>
                      <strong className="text-base text-emerald-600 font-mono">
                        {selectedReport.anomaliesSummary.resolvedThisWeek}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Total Ouvertes</span>
                      <strong className="text-base text-amber-700 font-mono">
                        {selectedReport.anomaliesSummary.totalOpen}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Synthèse Finition m² */}
              {selectedReport.finishingSummary && selectedReport.finishingSummary.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                    3. Avancement des Surfaces de Finition (m²)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {selectedReport.finishingSummary.map((fin, i) => (
                      <div key={i} className="border border-slate-200 p-2.5 rounded-lg bg-slate-50">
                        <div className="font-semibold text-slate-800 text-[11px] truncate">{fin.lotName}</div>
                        <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                          {fin.percentage}%
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {fin.completedM2.toLocaleString()} / {fin.totalM2.toLocaleString()} m²
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4: Observations générales & Objectifs Semaine Prochaine */}
              <div className="space-y-4 mb-8 text-xs">
                <div className="border border-slate-300 p-3 rounded-xl">
                  <strong className="block text-slate-800 uppercase text-[11px] mb-1">
                    4. Synthèse Générale & Analyse du Conducteur :
                  </strong>
                  <p className="text-slate-700 leading-relaxed">{selectedReport.generalObservations}</p>
                </div>

                <div className="border-2 border-slate-900 p-3 rounded-xl bg-slate-50">
                  <strong className="block text-slate-900 uppercase text-[11px] mb-1">
                    5. Objectifs & Instructions Prioritaires pour la Semaine Suivante :
                  </strong>
                  <pre className="font-sans text-slate-800 whitespace-pre-line leading-relaxed">
                    {selectedReport.instructionsForNextWeek}
                  </pre>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-slate-900 text-xs text-center">
                <div>
                  <div className="font-bold uppercase text-slate-900">Le Conducteur de Travaux GCB</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{selectedReport.authorName}</div>
                  <div className="h-16 flex items-center justify-center text-slate-400 italic text-[11px]">
                    Signature & Date
                  </div>
                </div>

                <div>
                  <div className="font-bold uppercase text-slate-900">
                    Visa & Décision du Responsable Premier des Travaux
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{selectedReport.submittedTo}</div>
                  <div className="h-16 flex items-center justify-center text-slate-400 italic text-[11px]">
                    Observations & Visa
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
              Sélectionnez un rapport dans la liste à gauche ou créez-en un nouveau.
            </div>
          )}
        </div>
      </div>

      {/* Create New Weekly Report Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CalendarRange className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base">Éditer le Rapport Hebdomadaire de Chantier</h3>
                  <p className="text-xs text-slate-400">Synthèse consolidée pour la direction et le responsable des travaux</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Numéro de Semaine *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="53"
                    required
                    value={formWeekNum}
                    onChange={(e) => {
                      const num = parseInt(e.target.value) || 1;
                      setFormWeekNum(num);
                      setFormTitle(`Rapport Hebdomadaire N° ${num} - Suivi Chantier GCB`);
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Date Début (Samedi)
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Date Fin (Jeudi)
                  </label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Intitulé Officiel du Rapport
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Synthèse Générale & Appréciation de l'Avancement
                </label>
                <textarea
                  rows={3}
                  value={formGeneralObs}
                  onChange={(e) => setFormGeneralObs(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Objectifs & Instructions Techniques pour la Semaine Suivante
                </label>
                <textarea
                  rows={3}
                  value={formInstructionsNextWeek}
                  onChange={(e) => setFormInstructionsNextWeek(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden font-mono"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block mb-1">Compilation automatique :</span>
                Toutes les données des sous-traitants, des briques consommées et des anomalies de la semaine
                seront automatiquement agrégées et archivées dans votre espace de stockage.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-sm shadow-sm"
                >
                  Générer et Archiver le Rapport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
