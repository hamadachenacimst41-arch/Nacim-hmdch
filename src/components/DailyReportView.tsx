import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Share2, 
  Calendar, 
  CheckCircle2, 
  Building2, 
  Users, 
  AlertTriangle, 
  Package, 
  Sparkles,
  Copy,
  Check,
  Download,
  FileDown,
  Loader2
} from 'lucide-react';
import { ProjectInfo, Subcontractor, DailyLog, BrickFloorCalculation, Anomaly, UserRole } from '../types';
import { generateDailyReportPDF } from '../utils/pdfGenerator';

interface DailyReportViewProps {
  project: ProjectInfo;
  subcontractors: Subcontractor[];
  logs: DailyLog[];
  calculations: BrickFloorCalculation[];
  anomalies: Anomaly[];
  userRole?: UserRole;
}

export const DailyReportView: React.FC<DailyReportViewProps> = ({
  project,
  subcontractors,
  logs,
  calculations,
  anomalies,
  userRole = 'superviseur',
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    logs[0]?.date || new Date().toISOString().slice(0, 10)
  );
  const [copied, setCopied] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [generalRemarks, setGeneralRemarks] = useState(
    'Chantier en bonne activité. Les effectifs des sous-traitants maçonnerie et finition ont été maintenus conformément aux engagements. Veiller à la continuité de l’approvisionnement en ciment et briques.'
  );

  // Filter items for selected date
  const dayLogs = logs.filter((l) => l.date === selectedDate);
  const dayAnomalies = anomalies.filter((a) => a.date === selectedDate);
  const dayResolved = anomalies.filter((a) => a.resolvedDate === selectedDate);

  // Workforce totals for the day
  const totalMasons = dayLogs.reduce((sum, l) => sum + l.workforce.masons, 0);
  const totalLaborers = dayLogs.reduce((sum, l) => sum + l.workforce.laborers, 0);
  const totalSupervisors = dayLogs.reduce((sum, l) => sum + l.workforce.supervisors, 0);
  const totalWorkforce = totalMasons + totalLaborers + totalSupervisors;

  // Daily production quantities
  const totalProductionM2 = dayLogs
    .filter((l) => l.quantityAchieved.unit === 'm²')
    .reduce((sum, l) => sum + l.quantityAchieved.amount, 0);

  const handleExportPDF = () => {
    try {
      setIsExportingPDF(true);
      generateDailyReportPDF({
        project,
        selectedDate,
        dayLogs,
        dayAnomalies,
        dayResolved,
        generalRemarks,
      });
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    } catch (err) {
      console.error('Erreur lors de la génération du PDF journalier:', err);
      alert('Une erreur est survenue lors de la génération du PDF.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `
RAPPORT JOURNALIER DE CHANTIER - GCB
Date : ${selectedDate}
Chantier : ${project.name} (${project.code})
Responsable Travaux : ${project.worksManagerName}
Conducteur de Travaux : ${project.supervisorName}

1. EFFECTIF TOTAL MOBILISÉ : ${totalWorkforce} personnes (${totalMasons} maçons, ${totalLaborers} manœuvres)
2. AVANCEMENT GLOBAL DU PROJET : ${project.globalProgressPercentage}%
3. TRAVAUX DU JOUR :
${dayLogs.map((l) => `- ${l.subcontractorName} (${l.trade}) : ${l.quantityAchieved.amount} ${l.quantityAchieved.unit} sur ${l.location.bloc} ${l.location.floor}`).join('\n')}

4. ANOMALIES & SÉCURITÉ : ${dayAnomalies.length} anomalie(s) signalée(s), ${dayResolved.length} réserve(s) levée(s).
5. OBSERVATIONS : ${generalRemarks}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Interactive Controls (Hidden in Print) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-amber-600" />
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase">
              Sélectionner la Date du Rapport Journalier
            </label>
            <input
              type="date"
              id="report-date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-bold font-mono"
            />
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline ml-2">
            ({dayLogs.length} pointage(s) enregistré(s) ce jour)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-150 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
            title="Copier le résumé pour WhatsApp ou Email"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copié !' : 'Copier Résumé'}</span>
          </button>

          <button
            onClick={handlePrint}
            id="print-daily-report-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs border border-slate-300 shadow-xs transition-all"
            title="Aperçu avant impression papier"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Imprimer</span>
          </button>

          <button
            onClick={handleExportPDF}
            id="export-daily-pdf-btn"
            disabled={isExportingPDF}
            className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg text-xs sm:text-sm shadow-md transition-all ${
              exportSuccess
                ? 'bg-emerald-700 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950 active:scale-95'
            }`}
            title="Télécharger le fichier PDF officiel aux normes GCB"
          >
            {isExportingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Génération PDF...</span>
              </>
            ) : exportSuccess ? (
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
        </div>
      </div>

      {/* Official GCB Printable Report Sheet */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-6 sm:p-10 max-w-5xl mx-auto printable-report text-slate-900">
        {/* Header GCB */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xl shadow-sm border border-slate-900">
                GCB
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-wide uppercase">
                  SOCIÉTÉ NATIONALE DE GÉNIE CIVIL ET BÂTIMENT
                </h1>
                <p className="text-xs text-slate-600 font-semibold tracking-wider">
                  DIRECTION BÂTIMENT · SUIVI DES TRAVAUX SOUS-TRAITANCE
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Filiale du Groupe Sonatrach
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg w-full sm:w-auto border sm:border-0 border-slate-200">
              <div className="inline-block bg-slate-900 text-amber-400 font-mono font-bold text-xs px-3 py-1 rounded">
                RAPPORT JOURNALIER DE CHANTIER
              </div>
              <div className="text-sm font-extrabold text-slate-900 mt-1">
                Date : {selectedDate}
              </div>
              <div className="text-xs text-slate-600">
                Météo : {dayLogs[0]?.weather || 'Normale'}
              </div>
            </div>
          </div>
        </div>

        {/* Project & Administrative Identification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs mb-6">
          <div className="space-y-1">
            <div>
              <strong className="text-slate-600">Intitulé du Chantier :</strong>{' '}
              <span className="font-bold text-slate-900">{project.name}</span>
            </div>
            <div>
              <strong className="text-slate-600">Code Affaire / Projet :</strong>{' '}
              <span className="font-mono font-bold text-slate-900">{project.code}</span>
            </div>
            <div>
              <strong className="text-slate-600">Maître d'Ouvrage :</strong>{' '}
              <span>{project.client}</span>
            </div>
            <div>
              <strong className="text-slate-600">Localisation :</strong>{' '}
              <span>{project.location}</span>
            </div>
          </div>

          <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
            <div>
              <strong className="text-slate-600">Destinataire (Premier Responsable) :</strong>{' '}
              <span className="font-bold text-slate-900">{project.worksManagerName}</span>
            </div>
            <div>
              <strong className="text-slate-600">Rédacteur (Conducteur de Travaux) :</strong>{' '}
              <span className="font-bold text-slate-900">{project.supervisorName}</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <strong className="text-slate-600">Avancement Global Chantier :</strong>
              <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold font-mono text-xs rounded">
                {project.globalProgressPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Effectifs des sous-traitants */}
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            1. État des Effectifs Présents par Entreprise Sous-Traitante
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="border border-slate-300 px-3 py-2">Entreprise Sous-Traitante</th>
                  <th className="border border-slate-300 px-3 py-2">Corps d'État</th>
                  <th className="border border-slate-300 px-2 py-2 text-center">Maçons</th>
                  <th className="border border-slate-300 px-2 py-2 text-center">Manœuvres</th>
                  <th className="border border-slate-300 px-2 py-2 text-center">Encadrement</th>
                  <th className="border border-slate-300 px-2 py-2 text-center font-black">Total Présent</th>
                  <th className="border border-slate-300 px-3 py-2">Zone Affectée</th>
                </tr>
              </thead>
              <tbody>
                {dayLogs.map((log) => {
                  const subTotal = log.workforce.masons + log.workforce.laborers + log.workforce.supervisors;
                  return (
                    <tr key={log.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 px-3 py-2 font-bold text-slate-900">
                        {log.subcontractorName}
                      </td>
                      <td className="border border-slate-300 px-3 py-2">{log.trade}</td>
                      <td className="border border-slate-300 px-2 py-2 text-center font-mono">{log.workforce.masons}</td>
                      <td className="border border-slate-300 px-2 py-2 text-center font-mono">{log.workforce.laborers}</td>
                      <td className="border border-slate-300 px-2 py-2 text-center font-mono">{log.workforce.supervisors}</td>
                      <td className="border border-slate-300 px-2 py-2 text-center font-mono font-bold text-amber-700">
                        {subTotal}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-slate-600">
                        {log.location.bloc} - {log.location.floor}
                      </td>
                    </tr>
                  );
                })}

                {dayLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-slate-400 italic">
                      Aucun pointage d'effectif consigné à cette date ({selectedDate}).
                    </td>
                  </tr>
                )}

                {dayLogs.length > 0 && (
                  <tr className="bg-slate-100 font-bold">
                    <td colSpan={2} className="border border-slate-300 px-3 py-2 text-right uppercase">
                      Total Effectif Mobilisé :
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-center font-mono">{totalMasons}</td>
                    <td className="border border-slate-300 px-2 py-2 text-center font-mono">{totalLaborers}</td>
                    <td className="border border-slate-300 px-2 py-2 text-center font-mono">{totalSupervisors}</td>
                    <td className="border border-slate-300 px-2 py-2 text-center font-mono text-amber-900 text-sm font-black">
                      {totalWorkforce}
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-slate-500 font-normal">
                      Ouvriers sur chantier
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Travaux réalisés dans la journée & Cadences */}
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            2. Travaux Réalisés dans la Journée & Taux d'Avancement
          </h2>

          <div className="space-y-3">
            {dayLogs.map((log, index) => (
              <div key={log.id} className="border border-slate-300 p-3 rounded-lg text-xs bg-white">
                <div className="flex flex-wrap justify-between items-center gap-2 font-bold mb-1">
                  <span className="text-slate-900">
                    {index + 1}. {log.subcontractorName} — <span className="text-amber-700">{log.trade}</span>
                  </span>
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                    Localisation : {log.location.bloc} · {log.location.floor} {log.location.detail ? `(${log.location.detail})` : ''}
                  </span>
                </div>

                <p className="text-slate-700 mb-2 pl-2 border-l-2 border-amber-500">
                  {log.workDescription}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-150 text-[11px]">
                  <div>
                    <span className="text-slate-500">Quantité faite : </span>
                    <strong className="font-mono">{log.quantityAchieved.amount} {log.quantityAchieved.unit}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Avancement S/T : </span>
                    <strong className="font-mono text-emerald-700">+{log.dailyProgressPct}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Impact Projet : </span>
                    <strong className="font-mono text-blue-700">+{log.globalProgressImpactPct}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Visa : </span>
                    <strong className="text-emerald-600">Conforme</strong>
                  </div>
                </div>

                {log.recommendationsGiven && (
                  <div className="mt-2 bg-amber-50 p-2 rounded text-[11px] text-amber-900 border border-amber-200">
                    <strong>Instruction donnée : </strong>{log.recommendationsGiven}
                  </div>
                )}
              </div>
            ))}

            {dayLogs.length === 0 && (
              <p className="text-xs text-slate-400 italic py-2">
                Aucune description de travaux consignée pour cette journée.
              </p>
            )}
          </div>
        </div>

        {/* Section 3: Anomalies & Contrôle Qualité */}
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            3. Contrôle Qualité, Anomalies & Levées de Réserves
          </h2>

          {dayAnomalies.length > 0 || dayResolved.length > 0 ? (
            <div className="space-y-2 text-xs">
              {dayAnomalies.map((anom) => (
                <div key={anom.id} className="border border-red-200 bg-red-50/50 p-2.5 rounded-lg">
                  <div className="flex justify-between font-bold text-red-800">
                    <span>⚠️ Constat : {anom.title} ({anom.subcontractorName})</span>
                    <span className="uppercase text-[10px] bg-red-200 px-1.5 py-0.5 rounded">
                      Gravité {anom.severity}
                    </span>
                  </div>
                  <p className="text-slate-700 text-[11px] mt-1">{anom.description}</p>
                  <div className="text-amber-900 font-semibold text-[11px] mt-1">
                    Instruction donnée : {anom.recommendation} (Délai : {anom.deadlineDate})
                  </div>
                </div>
              ))}

              {dayResolved.map((anom) => (
                <div key={anom.id} className="border border-emerald-200 bg-emerald-50/50 p-2.5 rounded-lg text-emerald-900 text-xs">
                  <span className="font-bold">✓ Réserve Levée : </span>
                  {anom.title} ({anom.subcontractorName}) — {anom.actionTaken}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
              Aucune anomalie critique enregistrée ce jour. Travaux conformes aux règles de l'art et tolérances du DTR.
            </div>
          )}
        </div>

        {/* Section 4: Observations & Recommandations du Conducteur */}
        <div className="mb-8">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            4. Observations & Synthèse du Conducteur de Travaux
          </h2>
          <textarea
            rows={3}
            value={generalRemarks}
            readOnly={userRole === 'responsable'}
            onChange={(e) => {
              if (userRole !== 'responsable') {
                setGeneralRemarks(e.target.value);
              }
            }}
            className={`w-full text-xs p-3 border border-slate-300 rounded-lg text-slate-800 leading-relaxed outline-hidden ${
              userRole === 'responsable' ? 'bg-slate-50 cursor-not-allowed text-slate-600' : 'focus:border-amber-500'
            }`}
          />
        </div>

        {/* Signatures & Visas */}
        <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-slate-900 text-xs text-center">
          <div>
            <div className="font-bold uppercase tracking-wider text-slate-900">
              Le Conducteur de Travaux (Suivi)
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">{project.supervisorName}</div>
            <div className="h-20 flex items-center justify-center text-slate-400 italic text-[11px]">
              Signature & Visa
            </div>
          </div>

          <div>
            <div className="font-bold uppercase tracking-wider text-slate-900">
              Le Responsable Premier des Travaux (Chef de Projet)
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">{project.worksManagerName}</div>
            <div className="h-20 flex items-center justify-center text-slate-400 italic text-[11px]">
              Vu & Décision / Instructions
            </div>
          </div>
        </div>

        <div className="mt-8 pt-2 border-t border-slate-200 text-[10px] text-slate-400 text-center font-mono">
          Document officiel généré par le Système GCB Suivi Chantier · Société Nationale de Génie Civil et Bâtiment
        </div>
      </div>
    </div>
  );
};
