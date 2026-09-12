import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProjectInfo, Subcontractor, DailyLog, Anomaly, WeeklyReport, FinishingLot } from '../types';

// Helper to format date nicely
function formatDateFr(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * EXPORT RAPPORT JOURNALIER EN FORMAT PDF OFFICIEL GCB
 */
export function generateDailyReportPDF(params: {
  project: ProjectInfo;
  selectedDate: string;
  dayLogs: DailyLog[];
  dayAnomalies: Anomaly[];
  dayResolved: Anomaly[];
  generalRemarks: string;
}): void {
  const { project, selectedDate, dayLogs, dayAnomalies, dayResolved, generalRemarks } = params;

  // A4 dimensions in mm: 210 x 297
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = margin;

  // --- BRANDING HEADER GCB ---
  // Top accent bar
  doc.setFillColor(217, 119, 6); // Amber 600
  doc.rect(margin, currentY, pageWidth - margin * 2, 2.5, 'F');
  currentY += 5;

  // GCB Box Logo
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.roundedRect(margin, currentY, 18, 14, 2, 2, 'F');
  doc.setTextColor(251, 191, 36); // Amber 400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('GCB', margin + 9, currentY + 9, { align: 'center' });

  // Organization info
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('SOCIÉTÉ NATIONALE DE GÉNIE CIVIL ET BÂTIMENT', margin + 22, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('DIRECTION BÂTIMENT · SUIVI DES TRAVAUX SOUS-TRAITANCE (MAÇONNERIE & FINITIONS)', margin + 22, currentY + 9);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Filiale du Groupe Sonatrach', margin + 22, currentY + 12.5);

  // Document Badge on Right
  const badgeWidth = 65;
  const badgeX = pageWidth - margin - badgeWidth;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(badgeX, currentY, badgeWidth, 14, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(badgeX, currentY, badgeWidth, 14, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9); // Amber 700
  doc.text('RAPPORT JOURNALIER CHANTIER', badgeX + badgeWidth / 2, currentY + 5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Date : ${formatDateFr(selectedDate)}`, badgeX + badgeWidth / 2, currentY + 9.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  const weatherText = dayLogs[0]?.weather ? `Météo : ${dayLogs[0].weather}` : 'Météo : Normale';
  doc.text(weatherText, badgeX + badgeWidth / 2, currentY + 12.5, { align: 'center' });

  currentY += 18;

  // Divider line
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 4;

  // --- PROJECT IDENTIFICATION BOX ---
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 19, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  const col1X = margin + 4;
  const col2X = margin + 98;

  // Left Column
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Chantier / Projet :', col1X, currentY + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${project.name}`, col1X + 26, currentY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Code Affaire :', col1X, currentY + 9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${project.code}  |  MO : ${project.client}`, col1X + 26, currentY + 9);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Localisation :', col1X, currentY + 13.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${project.location}`, col1X + 26, currentY + 13.5);

  // Right Column
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Premier Responsable (Destinataire) :', col2X, currentY + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${project.worksManagerName}`, col2X + 54, currentY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Conducteur de Travaux (Rédacteur) :', col2X, currentY + 9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${project.supervisorName}`, col2X + 54, currentY + 9);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Avancement Global Projet :', col2X, currentY + 13.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text(`${project.globalProgressPercentage}%`, col2X + 54, currentY + 13.5);

  currentY += 23;

  // --- SECTION 1: EFFECTIFS DES SOUS-TRAITANTS ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. ÉTAT DES EFFECTIFS PRÉSENTS PAR SOUS-TRAITANT', margin, currentY);
  currentY += 2;

  const totalMasons = dayLogs.reduce((s, l) => s + l.workforce.masons, 0);
  const totalLaborers = dayLogs.reduce((s, l) => s + l.workforce.laborers, 0);
  const totalSupervisors = dayLogs.reduce((s, l) => s + l.workforce.supervisors, 0);
  const totalWorkforce = totalMasons + totalLaborers + totalSupervisors;

  const workforceBody = dayLogs.map((l) => [
    l.subcontractorName,
    l.trade,
    l.workforce.masons.toString(),
    l.workforce.laborers.toString(),
    l.workforce.supervisors.toString(),
    (l.workforce.masons + l.workforce.laborers + l.workforce.supervisors).toString(),
    `${l.location.bloc} - ${l.location.floor}`,
  ]);

  if (dayLogs.length === 0) {
    workforceBody.push(['Aucun pointage enregistré pour cette date', '-', '-', '-', '-', '-', '-']);
  } else {
    // Summary row
    workforceBody.push([
      'TOTAL EFFECTIF MOBILISÉ',
      '-',
      totalMasons.toString(),
      totalLaborers.toString(),
      totalSupervisors.toString(),
      totalWorkforce.toString(),
      'Sur chantier',
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Entreprise Sous-Traitante', "Corps d'État", 'Maçons', 'Manœuvres', 'Encad.', 'Total', 'Zone']],
    body: workforceBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 55, halign: 'left', fontStyle: 'bold' },
      1: { cellWidth: 35, halign: 'left' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 15, halign: 'center', fontStyle: 'bold', textColor: [180, 83, 9] },
      6: { cellWidth: 'auto', halign: 'left' },
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      overflow: 'linebreak',
    },
    didParseCell: (data) => {
      // Highlight the total summary row
      if (data.row.index === workforceBody.length - 1 && dayLogs.length > 0) {
        data.cell.styles.fillColor = [241, 245, 249];
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // --- SECTION 2: TRAVAUX RÉALISÉS DANS LA JOURNÉE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("2. TRAVAUX EXÉCUTÉS DANS LA JOURNÉE & QUANTITÉS RÉALISÉES", margin, currentY);
  currentY += 2;

  const worksBody = dayLogs.map((l, idx) => [
    `${idx + 1}. ${l.subcontractorName}`,
    `${l.location.bloc} - ${l.location.floor} ${l.location.detail ? `(${l.location.detail})` : ''}`,
    l.workDescription + (l.recommendationsGiven ? `\n[Instruction: ${l.recommendationsGiven}]` : ''),
    `${l.quantityAchieved.amount} ${l.quantityAchieved.unit}`,
    `+${l.dailyProgressPct}%`,
    `+${l.globalProgressImpactPct}%`,
    'Conforme',
  ]);

  if (dayLogs.length === 0) {
    worksBody.push(['Aucun descriptif de travaux pour cette date', '-', '-', '-', '-', '-', '-']);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Sous-Traitant', 'Localisation', 'Description des Travaux Exécutés', 'Quantité', 'Gain S/T', 'Impact Global', 'Contrôle']],
    body: worksBody,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold' },
      1: { cellWidth: 26 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 15, halign: 'center', textColor: [4, 120, 87] },
      5: { cellWidth: 16, halign: 'center', textColor: [29, 78, 216] },
      6: { cellWidth: 16, halign: 'center', textColor: [16, 185, 129] },
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      overflow: 'linebreak',
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Check if we need a new page or fit on same
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = margin + 5;
  }

  // --- SECTION 3: ANOMALIES & CONTRÔLE QUALITÉ ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. CONTRÔLE QUALITÉ, NON-CONFORMITÉS & LEVÉES DE RÉSERVES', margin, currentY);
  currentY += 2;

  const anomRows: string[][] = [];
  dayAnomalies.forEach((a) => {
    anomRows.push([
      `⚠️ Constat: ${a.title}`,
      a.subcontractorName,
      `Gravité: ${a.severity.toUpperCase()}`,
      `${a.description} - Instruction: ${a.recommendation} (Délai: ${formatDateFr(a.deadlineDate)})`,
      'En attente',
    ]);
  });
  dayResolved.forEach((r) => {
    anomRows.push([
      `✓ Réserve Levée: ${r.title}`,
      r.subcontractorName,
      'Conforme',
      `Action menée: ${r.actionTaken || 'Reprise effectuée selon les règles de l’art.'}`,
      'Levée',
    ]);
  });

  if (anomRows.length === 0) {
    anomRows.push(['Aucune anomalie signalée ce jour. Travaux conformes aux règles de l’art et au DTR.', '-', '-', '-', 'Conforme']);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Objet / Titre', 'Sous-Traitant', 'Statut / Gravité', 'Détail & Instructions Techniques', 'Résultat']],
    body: anomRows,
    theme: 'grid',
    headStyles: {
      fillColor: [71, 85, 105],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: 'bold' },
      1: { cellWidth: 32 },
      2: { cellWidth: 24, halign: 'center' },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 18, halign: 'center' },
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Check if we need space for remarks & signatures
  if (currentY > pageHeight - 55) {
    doc.addPage();
    currentY = margin + 5;
  }

  // --- SECTION 4: OBSERVATIONS DU CONDUCTEUR DE TRAVAUX ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4. OBSERVATIONS & SYNTHÈSE DU CONDUCTEUR DE TRAVAUX', margin, currentY);
  currentY += 3.5;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  const remarksHeight = 16;
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, remarksHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  const splitRemarks = doc.splitTextToSize(
    generalRemarks || 'Activité normale sur chantier. Coordination assurée avec l’ensemble des corps d’état.',
    pageWidth - margin * 2 - 6
  );
  doc.text(splitRemarks, margin + 3, currentY + 4.5);

  currentY += remarksHeight + 6;

  // Check space for signature box
  if (currentY > pageHeight - 38) {
    doc.addPage();
    currentY = margin + 5;
  }

  // --- SECTION 5: SIGNATURES & VISAS ---
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 4;

  const colWidth = (pageWidth - margin * 2) / 2;

  // Left Sign: Conducteur
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('LE CONDUCTEUR DE TRAVAUX (SUIVI)', margin + colWidth / 2, currentY + 3, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(project.supervisorName, margin + colWidth / 2, currentY + 7, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('[ Visa & Date ]', margin + colWidth / 2, currentY + 22, { align: 'center' });

  // Right Sign: Premier Responsable
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('LE PREMIER RESPONSABLE DES TRAVAUX (CHEF DE PROJET)', margin + colWidth + colWidth / 2, currentY + 3, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(project.worksManagerName, margin + colWidth + colWidth / 2, currentY + 7, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('[ Vu & Décision / Instructions ]', margin + colWidth + colWidth / 2, currentY + 22, { align: 'center' });

  // --- FOOTER FOR ALL PAGES ---
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8);

    doc.text(
      'GCB · Société Nationale de Génie Civil et Bâtiment · Système Officiel de Suivi de Chantier',
      margin,
      pageHeight - 5
    );
    doc.text(`Page ${i} sur ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
  }

  // Save PDF file with clean standardized naming
  const fileName = `GCB_Rapport_Journalier_${project.code.replace(/\s+/g, '_')}_${selectedDate}.pdf`;
  doc.save(fileName);
}

/**
 * EXPORT RAPPORT HEBDOMADAIRE EN FORMAT PDF OFFICIEL GCB
 */
export function generateWeeklyReportPDF(params: {
  project: ProjectInfo;
  report: WeeklyReport;
}): void {
  const { project, report } = params;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = margin;

  // Top accent bar
  doc.setFillColor(217, 119, 6); // Amber 600
  doc.rect(margin, currentY, pageWidth - margin * 2, 2.5, 'F');
  currentY += 5;

  // GCB Box Logo
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.roundedRect(margin, currentY, 18, 14, 2, 2, 'F');
  doc.setTextColor(251, 191, 36); // Amber 400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('GCB', margin + 9, currentY + 9, { align: 'center' });

  // Organization Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('SOCIÉTÉ NATIONALE DE GÉNIE CIVIL ET BÂTIMENT', margin + 22, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('DIRECTION BÂTIMENT · SUIVI DES TRAVAUX SOUS-TRAITANCE', margin + 22, currentY + 9);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Filiale du Groupe Sonatrach', margin + 22, currentY + 12.5);

  // Badge on Right
  const badgeWidth = 65;
  const badgeX = pageWidth - margin - badgeWidth;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(badgeX, currentY, badgeWidth, 14, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(251, 191, 36); // Amber 400
  doc.text(`RAPPORT HEBDOMADAIRE N° ${report.weekNumber}`, badgeX + badgeWidth / 2, currentY + 5.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(`Année ${report.year}`, badgeX + badgeWidth / 2, currentY + 9.5, { align: 'center' });

  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`${formatDateFr(report.startDate)} au ${formatDateFr(report.endDate)}`, badgeX + badgeWidth / 2, currentY + 12.5, { align: 'center' });

  currentY += 18;

  // Divider line
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 4;

  // Identification & Summary Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 22, 1.5, 1.5, 'FD');

  const col1X = margin + 4;
  const col2X = margin + 98;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Chantier / Affaire :', col1X, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${project.name} (${project.code})`, col1X + 26, currentY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Maître d’Ouvrage :', col1X, currentY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${project.client} · Localisation: ${project.location}`, col1X + 26, currentY + 10);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Intitulé Rapport :', col1X, currentY + 15);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${report.title}`, col1X + 26, currentY + 15);

  // Right column: Manager & Progress Delta
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Destinataire (Premier Resp.) :', col2X, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${report.submittedTo}`, col2X + 44, currentY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Rédacteur (Conducteur) :', col2X, currentY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${report.authorName}`, col2X + 44, currentY + 10);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Avancement Semaine :', col2X, currentY + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87); // Emerald 700
  doc.text(`+${report.weeklyProgressDelta}%  (De ${report.globalProgressStart}% à ${report.globalProgressEnd}%)`, col2X + 44, currentY + 15);

  currentY += 26;

  // --- SECTION 1: PERFORMANCES DES SOUS-TRAITANTS ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. SYNTHÈSE DE PERFORMANCE & AVANCEMENT DES SOUS-TRAITANTS', margin, currentY);
  currentY += 2;

  const subsBody = report.subcontractorPerformances.map((s) => [
    s.subcontractorName,
    s.trade,
    `${s.workersAvg} ouvriers`,
    `+${s.progressGained}%`,
    `${s.totalRealProgress}%`,
    s.appreciation,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Entreprise Sous-Traitante', 'Corps d’État', 'Eff. Moyen', 'Gain Sem.', 'Taux Réel', 'Appréciation Conducteur']],
    body: subsBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 46, fontStyle: 'bold' },
      1: { cellWidth: 28 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 18, halign: 'center', fontStyle: 'bold', textColor: [4, 120, 87] },
      4: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 'auto', fontSize: 6.5 },
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      overflow: 'linebreak',
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // --- SECTION 2: MATÉRIAUX & QUALITÉ (2 COLS) ---
  const boxWidth = (pageWidth - margin * 2 - 4) / 2;
  const boxHeight = 22;

  // Palettes Box
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.setDrawColor(245, 158, 11); // Amber 500
  doc.roundedRect(margin, currentY, boxWidth, boxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14); // Amber 800
  doc.text('2. CONSOMMATION BRIQUES & PALETTES', margin + 4, currentY + 5);

  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9);
  doc.text(`${report.brickConsumption.palletsUsed} Palettes consommées`, margin + 4, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 53, 15);
  doc.text(`Soit environ ${report.brickConsumption.bricksCount.toLocaleString()} briques posées (Règle certifiée: 335 briques/palette)`, margin + 4, currentY + 16);

  // Anomalies Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin + boxWidth + 4, currentY, boxWidth, boxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('3. BILAN QUALITÉ & CONTRÔLE ANOMALIES', margin + boxWidth + 8, currentY + 5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`• Non-conformités signalées cette semaine : `, margin + boxWidth + 8, currentY + 10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text(`${report.anomaliesSummary.openedThisWeek}`, margin + boxWidth + 66, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`• Réserves levées et clôturées : `, margin + boxWidth + 8, currentY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(`${report.anomaliesSummary.resolvedThisWeek}`, margin + boxWidth + 66, currentY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`• Total réserves en cours de reprise : `, margin + boxWidth + 8, currentY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text(`${report.anomaliesSummary.totalOpen}`, margin + boxWidth + 66, currentY + 18);

  currentY += boxHeight + 6;

  // --- SECTION 3: SURFACES DE FINITION (Si existantes) ---
  if (report.finishingSummary && report.finishingSummary.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('4. AVANCEMENT DES SURFACES DE FINITION (m²)', margin, currentY);
    currentY += 2;

    const finBody = report.finishingSummary.map((f) => [
      f.lotName,
      `${f.totalM2.toLocaleString()} m²`,
      `${f.completedM2.toLocaleString()} m²`,
      `${f.percentage}%`,
      `${(f.totalM2 - f.completedM2).toLocaleString()} m²`,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Lot de Finition', 'Surface Contractuelle', 'Surface Réalisée', 'Taux (%)', 'Solde Restant']],
      body: finBody,
      theme: 'grid',
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontSize: 7,
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: 'bold' },
        1: { cellWidth: 35, halign: 'center' },
        2: { cellWidth: 35, halign: 'center', fontStyle: 'bold', textColor: [4, 120, 87] },
        3: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
        4: { cellWidth: 'auto', halign: 'center', textColor: [100, 116, 139] },
      },
      styles: {
        fontSize: 7,
        cellPadding: 1.6,
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // Check page height for instructions & signatures
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = margin + 5;
  }

  // --- SECTION 4: OBSERVATIONS GÉNÉRALES ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('5. ANALYSE & SYNTHÈSE GÉNÉRALE DU CONDUCTEUR DE TRAVAUX', margin, currentY);
  currentY += 3;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  const obsHeight = 15;
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, obsHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  const splitObs = doc.splitTextToSize(report.generalObservations, pageWidth - margin * 2 - 6);
  doc.text(splitObs, margin + 3, currentY + 4);

  currentY += obsHeight + 5;

  // --- SECTION 5: INSTRUCTIONS SEMAINE PROCHAINE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('6. OBJECTIFS & INSTRUCTIONS PRIORITAIRES POUR LA SEMAINE SUIVANTE', margin, currentY);
  currentY += 3;

  doc.setFillColor(255, 251, 235); // Amber 50
  doc.setDrawColor(245, 158, 11);
  const instHeight = 18;
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, instHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 53, 15);
  const splitInst = doc.splitTextToSize(report.instructionsForNextWeek, pageWidth - margin * 2 - 6);
  doc.text(splitInst, margin + 3, currentY + 4);

  currentY += instHeight + 7;

  // Check if we need space for signature block
  if (currentY > pageHeight - 38) {
    doc.addPage();
    currentY = margin + 5;
  }

  // --- SECTION 6: VISAS ET SIGNATURES ---
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 4;

  const colWidth = (pageWidth - margin * 2) / 2;

  // Left Sign: Conducteur
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('LE CONDUCTEUR DE TRAVAUX (SUIVI GCB)', margin + colWidth / 2, currentY + 3, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(report.authorName, margin + colWidth / 2, currentY + 7, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('[ Signature & Date ]', margin + colWidth / 2, currentY + 22, { align: 'center' });

  // Right Sign: Premier Responsable
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('VISA & DÉCISION DU PREMIER RESPONSABLE DES TRAVAUX', margin + colWidth + colWidth / 2, currentY + 3, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(report.submittedTo, margin + colWidth + colWidth / 2, currentY + 7, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('[ Visa, Observations & Décision ]', margin + colWidth + colWidth / 2, currentY + 22, { align: 'center' });

  // --- FOOTER FOR ALL PAGES ---
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8);

    doc.text(
      'GCB · Société Nationale de Génie Civil et Bâtiment · Suivi Chantier Sous-Traitance Hebdomadaire',
      margin,
      pageHeight - 5
    );
    doc.text(`Page ${i} sur ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
  }

  // Save PDF file
  const fileName = `GCB_Rapport_Hebdomadaire_S${report.weekNumber}_${report.year}_${project.code.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

/**
 * DESSIN VECTORIEL DE LA CHRONOLOGIE DU CYCLE DE VIE D'UNE ANOMALIE
 * (4 Jalons A4 : Constat -> Prise en charge -> Mesure corrective -> Levée & Quitus)
 */
function drawVectorAnomalyTimeline(
  doc: jsPDF,
  startX: number,
  startY: number,
  boxWidth: number,
  anomaly: Anomaly
): number {
  const boxHeight = 27;

  // Background Box for Timeline
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.roundedRect(startX, startY, boxWidth, boxHeight, 1.5, 1.5, 'FD');

  // Timeline Header / SLA badge inside box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('CHRONOLOGIE & CYCLE DE VIE DES TRAVAUX DE REPRISE', startX + 3, startY + 3.8);

  // Status stage percent badge
  let stagePct = 25;
  let stageText = 'Étape 1/4 : Constat initial notifié';
  if (anomaly.status === 'resolue') {
    stagePct = 100;
    stageText = 'Étape 4/4 : Réserve levée et validée (100%)';
  } else if (anomaly.status === 'en_cours') {
    stagePct = 50;
    stageText = 'Étape 2/4 : Prise en charge & Travaux en cours';
  }

  doc.setFontSize(6);
  if (anomaly.status === 'resolue') {
    doc.setTextColor(16, 185, 129); // emerald-600
  } else if (anomaly.status === 'en_cours') {
    doc.setTextColor(217, 119, 6); // amber-600
  } else {
    doc.setTextColor(220, 38, 38); // red-600
  }
  doc.text(stageText, startX + boxWidth - 3, startY + 3.8, { align: 'right' });

  // 4 Milestone Definitions
  const milestones = [
    {
      index: 1,
      name: '1. Constat Initial',
      date: formatDateFr(anomaly.date),
      detail: `Émis : ${anomaly.verifiedBy || 'GCB'}`,
      isDone: true,
      isActive: anomaly.status === 'ouverte',
    },
    {
      index: 2,
      name: '2. Prise en Charge',
      date: anomaly.inProgressDate ? formatDateFr(anomaly.inProgressDate) : 'En attente',
      detail: anomaly.inProgressDate ? 'Sous-traitant mobilisé' : 'Ordre en attente',
      isDone: anomaly.status === 'en_cours' || anomaly.status === 'resolue' || !!anomaly.inProgressDate,
      isActive: anomaly.status === 'en_cours' && !anomaly.resolvedDate,
    },
    {
      index: 3,
      name: '3. Mesure Corrective',
      date: anomaly.status === 'resolue' ? formatDateFr(anomaly.resolvedDate || '') : (anomaly.status === 'en_cours' ? 'En cours' : 'À planifier'),
      detail: anomaly.actionTaken ? 'Reprise selon DTR' : (anomaly.status === 'en_cours' ? 'Exécution travaux' : 'Selon prescription'),
      isDone: anomaly.status === 'resolue',
      isActive: false,
    },
    {
      index: 4,
      name: '4. Levée & Clôture',
      date: anomaly.resolvedDate ? formatDateFr(anomaly.resolvedDate) : 'Non clôturée',
      detail: anomaly.resolvedDate ? `Visa : ${anomaly.verifiedBy || 'GCB'}` : 'Contrôle à planifier',
      isDone: anomaly.status === 'resolue',
      isActive: false,
    },
  ];

  const lineY = startY + 11;
  const leftPad = 15;
  const usableWidth = boxWidth - leftPad * 2;
  const stepGap = usableWidth / 3;

  // Base connector gray line
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(1.2);
  doc.line(startX + leftPad, lineY, startX + leftPad + usableWidth, lineY);

  // Active colored line progress
  let activeSegments = 0;
  if (anomaly.status === 'resolue') activeSegments = 3;
  else if (anomaly.status === 'en_cours') activeSegments = 1.5;
  else activeSegments = 0;

  if (activeSegments > 0) {
    if (anomaly.status === 'resolue') {
      doc.setDrawColor(16, 185, 129); // emerald-500
    } else {
      doc.setDrawColor(217, 119, 6); // amber-500
    }
    doc.setLineWidth(1.2);
    doc.line(startX + leftPad, lineY, startX + leftPad + (activeSegments * stepGap), lineY);
  }

  // Draw 4 milestone circles and texts
  milestones.forEach((m, idx) => {
    const cx = startX + leftPad + idx * stepGap;

    if (m.isDone) {
      // Completed node (Emerald / Amber)
      if (anomaly.status === 'resolue' || idx < 2) {
        doc.setFillColor(16, 185, 129); // emerald-500
        doc.setDrawColor(16, 185, 129);
      } else {
        doc.setFillColor(217, 119, 6);
        doc.setDrawColor(217, 119, 6);
      }
      doc.circle(cx, lineY, 2.5, 'F');

      // White check or number inside
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5);
      doc.text(idx === 3 && anomaly.status === 'resolue' ? 'OK' : `${m.index}`, cx, lineY + 1.6, { align: 'center' });
    } else if (m.isActive) {
      // Current active node
      doc.setFillColor(254, 243, 199); // amber-100
      doc.setDrawColor(217, 119, 6);
      doc.setLineWidth(0.6);
      doc.circle(cx, lineY, 2.5, 'FD');

      doc.setFillColor(217, 119, 6);
      doc.circle(cx, lineY, 1.2, 'F');
    } else {
      // Pending gray node
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.4);
      doc.circle(cx, lineY, 2.3, 'FD');

      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(4.5);
      doc.text(`${m.index}`, cx, lineY + 1.5, { align: 'center' });
    }

    // Texts under the node
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(m.isDone ? 15 : 100, m.isDone ? 23 : 116, m.isDone ? 42 : 139);
    doc.text(m.name, cx, lineY + 5.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.setTextColor(71, 85, 105);
    doc.text(m.date, cx, lineY + 8.5, { align: 'center' });

    doc.setFontSize(4.8);
    doc.setTextColor(148, 163, 184);
    doc.text(m.detail, cx, lineY + 11.2, { align: 'center' });
  });

  // Footer summary note inside the box
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(startX + 2, startY + boxHeight - 4.5, startX + boxWidth - 2, startY + boxHeight - 4.5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.5);
  if (anomaly.status === 'resolue') {
    doc.setTextColor(16, 185, 129);
    const resolvedText = `✓ Quitus accordé le ${formatDateFr(anomaly.resolvedDate || '')} par ${anomaly.verifiedBy || 'GCB'} · Mesures : ${anomaly.actionTaken || 'Conforme DTR'} ${anomaly.closureNotes ? `(${anomaly.closureNotes})` : ''}`;
    doc.text(doc.splitTextToSize(resolvedText, boxWidth - 6)[0], startX + 3, startY + boxHeight - 1.5);
  } else if (anomaly.status === 'en_cours') {
    doc.setTextColor(180, 83, 9);
    const inProgText = `En cours de reprise par ${anomaly.subcontractorName}. Échéance : ${formatDateFr(anomaly.deadlineDate)} ${anomaly.inProgressNotes ? `· Note : ${anomaly.inProgressNotes}` : ''}`;
    doc.text(doc.splitTextToSize(inProgText, boxWidth - 6)[0], startX + 3, startY + boxHeight - 1.5);
  } else {
    doc.setTextColor(185, 28, 28);
    const openText = `Ordre de reprise en souffrance · Échéance impérative de réfection fixée au : ${formatDateFr(anomaly.deadlineDate)}`;
    doc.text(openText, startX + 3, startY + boxHeight - 1.5);
  }

  return boxHeight;
}

/**
 * EXPORT COMPLET DU RAPPORT DES ANOMALIES & NON-CONFORMITÉS (FORMAT A4 OFFICIEL GCB)
 * Inclut la synthèse KPI, le tableau récapitulatif et les fiches détaillées avec leur timeline vectorielle.
 */
export function generateAnomaliesReportPDF(params: {
  project: ProjectInfo;
  anomalies: Anomaly[];
  subcontractors: Subcontractor[];
  filterContext?: {
    statusFilter?: string;
    subFilterName?: string;
    reserveTypeName?: string;
  };
}): void {
  const { project, anomalies, subcontractors, filterContext } = params;

  // A4 dimensions: 210 x 297 mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = margin;

  // --- BRANDING HEADER GCB ---
  // Top accent bar (Dark Red/Amber Construction Theme)
  doc.setFillColor(185, 28, 28); // Red 700 GCB Quality
  doc.rect(margin, currentY, pageWidth - margin * 2, 2.5, 'F');
  currentY += 5;

  // GCB Box Logo
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.roundedRect(margin, currentY, 18, 14, 2, 2, 'F');
  doc.setTextColor(251, 191, 36); // Amber 400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('GCB', margin + 9, currentY + 9, { align: 'center' });

  // Organization info
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('SOCIÉTÉ NATIONALE DE GÉNIE CIVIL ET BÂTIMENT', margin + 22, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('DIRECTION BÂTIMENT · SUIVI DES SOUS-TRAITANTS (MAÇONNERIE & FINITIONS)', margin + 22, currentY + 9);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Filiale du Groupe Sonatrach · Contrôle Qualité & Traçabilité des Travaux', margin + 22, currentY + 12.5);

  // Document Badge on Right
  const badgeWidth = 72;
  const badgeX = pageWidth - margin - badgeWidth;
  doc.setFillColor(254, 242, 242); // Red 50
  doc.roundedRect(badgeX, currentY, badgeWidth, 14, 2, 2, 'F');
  doc.setDrawColor(252, 165, 165); // Red 300
  doc.roundedRect(badgeX, currentY, badgeWidth, 14, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28); // Red 700
  doc.text('REGISTRE DES ANOMALIES & RÉSERVES', badgeX + badgeWidth / 2, currentY + 4.8, { align: 'center' });

  const now = new Date();
  const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Édité le : ${todayStr}`, badgeX + badgeWidth / 2, currentY + 9.2, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Réf : GCB-QUAL-${project.code.replace(/\s+/g, '_')}`, badgeX + badgeWidth / 2, currentY + 12.5, { align: 'center' });

  currentY += 18;

  // Divider line
  doc.setDrawColor(185, 28, 28);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 4;

  // --- PROJECT IDENTIFICATION & AUDIT CONTEXT ---
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 18, 1.5, 1.5, 'FD');

  const col1X = margin + 4;
  const col2X = margin + 96;

  doc.setFontSize(7.5);
  // Left Column
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Chantier / Ouvrage :', col1X, currentY + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${project.name}`, col1X + 28, currentY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Code & Localisation :', col1X, currentY + 9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${project.code} · ${project.location}`, col1X + 28, currentY + 9);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Maître d’Ouvrage :', col1X, currentY + 13.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${project.client}`, col1X + 28, currentY + 13.5);

  // Right Column
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Conducteur de Travaux GCB :', col2X, currentY + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${project.supervisorName}`, col2X + 42, currentY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Périmètre du Rapport :', col2X, currentY + 9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const filterDesc = filterContext?.statusFilter && filterContext.statusFilter !== 'all'
    ? `Filtre : ${filterContext.statusFilter.toUpperCase()}`
    : 'Toutes les non-conformités répertoriées';
  doc.text(filterDesc, col2X + 42, currentY + 9);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Sous-Traitant visé :', col2X, currentY + 13.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text(filterContext?.subFilterName || 'Tous les sous-traitants', col2X + 42, currentY + 13.5);

  currentY += 22;

  // --- STATISTIQUES ET INDICATEURS QUALITÉ (KPI BOXES) ---
  const totalCount = anomalies.length;
  const openCount = anomalies.filter((a) => a.status === 'ouverte').length;
  const inProgressCount = anomalies.filter((a) => a.status === 'en_cours').length;
  const resolvedCount = anomalies.filter((a) => a.status === 'resolue').length;
  const overdueCount = anomalies.filter(
    (a) => a.status !== 'resolue' && a.deadlineDate && new Date(a.deadlineDate) < new Date()
  ).length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;

  const kpiWidth = (pageWidth - margin * 2 - 9) / 4;

  // Card 1: Total
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, kpiWidth, 14, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL CONSTATS', margin + kpiWidth / 2, currentY + 4, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(totalCount.toString(), margin + kpiWidth / 2, currentY + 9.5, { align: 'center' });
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Fiches de non-conformité', margin + kpiWidth / 2, currentY + 12.5, { align: 'center' });

  // Card 2: Ouvertes
  const kpi2X = margin + kpiWidth + 3;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(kpi2X, currentY, kpiWidth, 14, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(185, 28, 28);
  doc.text('ANOMALIES OUVERTES', kpi2X + kpiWidth / 2, currentY + 4, { align: 'center' });
  doc.setFontSize(11);
  doc.text(openCount.toString(), kpi2X + kpiWidth / 2, currentY + 9.5, { align: 'center' });
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text('En attente de reprise', kpi2X + kpiWidth / 2, currentY + 12.5, { align: 'center' });

  // Card 3: En Cours
  const kpi3X = kpi2X + kpiWidth + 3;
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(252, 211, 77);
  doc.roundedRect(kpi3X, currentY, kpiWidth, 14, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(180, 83, 9);
  doc.text('EN COURS DE REPRISE', kpi3X + kpiWidth / 2, currentY + 4, { align: 'center' });
  doc.setFontSize(11);
  doc.text(inProgressCount.toString(), kpi3X + kpiWidth / 2, currentY + 9.5, { align: 'center' });
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Travaux engagés sur site', kpi3X + kpiWidth / 2, currentY + 12.5, { align: 'center' });

  // Card 4: Résolues / Levées
  const kpi4X = kpi3X + kpiWidth + 3;
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(kpi4X, currentY, kpiWidth, 14, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(16, 185, 129);
  doc.text('RÉSERVES LEVÉES', kpi4X + kpiWidth / 2, currentY + 4, { align: 'center' });
  doc.setFontSize(11);
  doc.text(`${resolvedCount} (${resolutionRate}%)`, kpi4X + kpiWidth / 2, currentY + 9.5, { align: 'center' });
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Validées après récolement', kpi4X + kpiWidth / 2, currentY + 12.5, { align: 'center' });

  currentY += 18;

  // Overdue warning banner if any
  if (overdueCount > 0) {
    doc.setFillColor(254, 226, 226);
    doc.setDrawColor(239, 68, 68);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 6.5, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(185, 28, 28);
    doc.text(
      `ALERTE DÉPASSEMENT DE DÉLAI : ${overdueCount} non-conformité(s) ont dépassé la date limite de reprise sans être levées. Intervention prioritaire requise.`,
      margin + 3,
      currentY + 4.3
    );
    currentY += 9;
  }

  // --- SECTION 1: TABLEAU RÉCAPITULATIF SYNTHÉTIQUE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. TABLEAU RÉCAPITULATIF DES NON-CONFORMITÉS & STATUTS', margin, currentY);
  currentY += 2.5;

  const tableBody = anomalies.map((a, idx) => {
    let statusLabel = 'OUVERTE';
    if (a.status === 'resolue') statusLabel = 'LEVÉE';
    else if (a.status === 'en_cours') statusLabel = 'EN COURS';

    let slaLabel = formatDateFr(a.deadlineDate);
    if (a.status === 'resolue') {
      slaLabel = `Levée (${formatDateFr(a.resolvedDate || '')})`;
    } else if (a.deadlineDate && new Date(a.deadlineDate) < new Date()) {
      slaLabel = `RETARD (${formatDateFr(a.deadlineDate)})`;
    }

    let cycleProgress = 'Jalon 1/4 (25%)';
    if (a.status === 'resolue') cycleProgress = 'Jalon 4/4 (100%)';
    else if (a.status === 'en_cours') cycleProgress = 'Jalon 2/4 (50%)';

    return [
      `#${a.id}`,
      formatDateFr(a.date),
      a.subcontractorName,
      a.location,
      `${a.title}\n[${a.category.toUpperCase()}]`,
      a.severity.toUpperCase(),
      statusLabel,
      slaLabel,
      cycleProgress,
    ];
  });

  if (tableBody.length === 0) {
    tableBody.push(['-', '-', 'Aucune non-conformité répertoriée', '-', '-', '-', '-', '-', '-']);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Réf', 'Date', 'Sous-Traitant', 'Localisation', 'Objet du Désordre', 'Gravité', 'Statut', 'Échéance', 'Avancement Cycle']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 6.8,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 16, halign: 'center' },
      2: { cellWidth: 32, fontStyle: 'bold' },
      3: { cellWidth: 26 },
      4: { cellWidth: 'auto' },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 17, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 20, halign: 'center' },
      8: { cellWidth: 21, halign: 'center' },
    },
    styles: {
      fontSize: 6.2,
      cellPadding: 1.5,
      overflow: 'linebreak',
    },
    didParseCell: (data) => {
      // Colorize severity & status cells
      if (data.column.index === 5 && data.section === 'body') {
        const text = String(data.cell.raw);
        if (text.includes('CRITIQUE')) {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fontStyle = 'bold';
        } else if (text.includes('MAJEURE')) {
          data.cell.styles.textColor = [180, 83, 9];
        }
      }
      if (data.column.index === 6 && data.section === 'body') {
        const text = String(data.cell.raw);
        if (text === 'LEVÉE') {
          data.cell.styles.textColor = [16, 185, 129];
          data.cell.styles.fillColor = [240, 253, 244];
        } else if (text === 'EN COURS') {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fillColor = [254, 243, 199];
        } else if (text === 'OUVERTE') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fillColor = [254, 242, 242];
        }
      }
      if (data.column.index === 7 && data.section === 'body') {
        const text = String(data.cell.raw);
        if (text.includes('RETARD')) {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // --- SECTION 2: FICHES DÉTAILLÉES AVEC CHRONOLOGIE VISUELLE ASSOCIEÉ ---
  // If not enough room for the section title, add page
  if (currentY > pageHeight - 55) {
    doc.addPage();
    currentY = margin + 5;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. FICHES DÉTAILLÉES & CHRONOLOGIES DU CYCLE DE VIE DES TRAVAUX', margin, currentY);
  currentY += 3;

  const cardWidth = pageWidth - margin * 2;

  anomalies.forEach((anomaly, index) => {
    // Check if card fits on current page (each detailed card needs ~ 62 mm)
    if (currentY > pageHeight - 65) {
      doc.addPage();
      currentY = margin + 5;
    }

    // Card Header Bar
    const cardTopY = currentY;
    let headerColor = [241, 245, 249]; // Slate 100
    let badgeColor = [71, 85, 105];
    let badgeBg = [226, 232, 240];

    if (anomaly.status === 'resolue') {
      headerColor = [240, 253, 244]; // Emerald 50
      badgeColor = [16, 185, 129];
      badgeBg = [209, 250, 229];
    } else if (anomaly.status === 'en_cours') {
      headerColor = [254, 252, 232]; // Amber 50
      badgeColor = [180, 83, 9];
      badgeBg = [254, 243, 199];
    } else {
      headerColor = [254, 242, 242]; // Red 50
      badgeColor = [185, 28, 28];
      badgeBg = [254, 202, 202];
    }

    // Outer card boundary (FD)
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);

    // Header strip
    doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
    doc.rect(margin, currentY, cardWidth, 7.5, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, currentY, cardWidth, 7.5, 'S');

    // Header text: Number & Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Fiche N°${index + 1} (Réf #${anomaly.id}) : ${anomaly.title}`, margin + 3, currentY + 5);

    // Badges on right side
    const statusText = anomaly.status === 'resolue' ? 'LEVÉE / QUITUS' : anomaly.status === 'en_cours' ? 'EN COURS DE REPRISE' : 'OUVERTE / EN ATTENTE';
    doc.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
    doc.roundedRect(pageWidth - margin - 48, currentY + 1.2, 45, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    doc.text(statusText, pageWidth - margin - 25.5, currentY + 4.5, { align: 'center' });

    currentY += 9.5;

    // Row of key attributes
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Sous-Traitant :', margin + 3, currentY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(anomaly.subcontractorName, margin + 24, currentY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Localisation :', margin + 78, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(anomaly.location, margin + 96, currentY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Gravité :', margin + 148, currentY);
    doc.setFont('helvetica', 'bold');
    if (anomaly.severity === 'critique') doc.setTextColor(185, 28, 28);
    else if (anomaly.severity === 'majeure') doc.setTextColor(180, 83, 9);
    else doc.setTextColor(71, 85, 105);
    doc.text(anomaly.severity.toUpperCase(), margin + 160, currentY);

    currentY += 4.5;

    // Constat & Instruction boxes side-by-side
    const halfWidth = (cardWidth - 4) / 2;

    // Box 1: Constat
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin + 2, currentY, halfWidth, 13, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(185, 28, 28);
    doc.text('CONSTAT DU DÉSORDRE / MALFAÇON :', margin + 4, currentY + 3.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(30, 41, 59);
    const splitDesc = doc.splitTextToSize(anomaly.description, halfWidth - 5);
    doc.text(splitDesc.slice(0, 3), margin + 4, currentY + 6.8);

    // Box 2: Recommendation & Deadline
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(252, 211, 77);
    doc.roundedRect(margin + halfWidth + 4, currentY, halfWidth - 2, 13, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(180, 83, 9);
    doc.text(`INSTRUCTION GCB · DÉLAI AU ${formatDateFr(anomaly.deadlineDate)} :`, margin + halfWidth + 6, currentY + 3.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(15, 23, 42);
    const splitRec = doc.splitTextToSize(anomaly.recommendation, halfWidth - 7);
    doc.text(splitRec.slice(0, 3), margin + halfWidth + 6, currentY + 6.8);

    currentY += 15;

    // DESSIN VECTORIEL DE LA CHRONOLOGIE ASSOCIEE
    const timelineHeight = drawVectorAnomalyTimeline(doc, margin + 2, currentY, cardWidth - 4, anomaly);
    currentY += timelineHeight + 3;

    // Outer card border
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.rect(margin, cardTopY, cardWidth, currentY - cardTopY, 'S');

    currentY += 4.5;
  });

  // --- SECTION 3: VISAS ET SIGNATURES OFFICIELLES ---
  // Ensure enough room for signatures
  if (currentY > pageHeight - 42) {
    doc.addPage();
    currentY = margin + 5;
  }

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 4;

  const signColWidth = (pageWidth - margin * 2) / 2;

  // Left Sign: Conducteur de Travaux GCB
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('LE CONDUCTEUR DE TRAVAUX (SUIVI GCB)', margin + signColWidth / 2, currentY + 3, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(project.supervisorName, margin + signColWidth / 2, currentY + 7, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('[ Visa, Date & Cachet Officiel GCB ]', margin + signColWidth / 2, currentY + 22, { align: 'center' });

  // Right Sign: Sous-Traitant Destinataire
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ACCUSÉ DE RÉCEPTION & ENGAGEMENT DU SOUS-TRAITANT', margin + signColWidth + signColWidth / 2, currentY + 3, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Chef de Chantier / Conducteur de Travaux Entreprise', margin + signColWidth + signColWidth / 2, currentY + 7, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('[ Nom, Date, Émargement & Cachet ]', margin + signColWidth + signColWidth / 2, currentY + 22, { align: 'center' });

  // --- FOOTER SUR TOUTES LES PAGES ---
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8);

    doc.text(
      'GCB · Société Nationale de Génie Civil et Bâtiment · Registre Officiel des Non-Conformités & Suivi du Cycle de Vie',
      margin,
      pageHeight - 5
    );
    doc.text(`Page ${i} sur ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
  }

  // Save PDF file
  const safeProjectCode = project.code.replace(/\s+/g, '_');
  const fileName = `GCB_Rapport_Anomalies_Chronologie_${safeProjectCode}_${todayStr.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}

/**
 * EXPORT D'UNE FICHE INDIVIDUELLE D'ANOMALIE AU FORMAT A4 AVEC CHRONOLOGIE GRAND FORMAT
 */
export function generateSingleAnomalyPDF(params: {
  project: ProjectInfo;
  anomaly: Anomaly;
}): void {
  const { project, anomaly } = params;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = margin;

  // Header Banner
  doc.setFillColor(185, 28, 28);
  doc.rect(margin, currentY, pageWidth - margin * 2, 2.5, 'F');
  currentY += 5;

  // Logo GCB
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, currentY, 18, 14, 2, 2, 'F');
  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('GCB', margin + 9, currentY + 9, { align: 'center' });

  // Organization info
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('SOCIÉTÉ NATIONALE DE GÉNIE CIVIL ET BÂTIMENT', margin + 22, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('DIRECTION BÂTIMENT · SUIVI DES SOUS-TRAITANTS', margin + 22, currentY + 9);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Filiale du Groupe Sonatrach · Fiche d’Ordre de Reprise & Traçabilité Qualité', margin + 22, currentY + 12.5);

  // Document Badge on Right
  const badgeWidth = 75;
  const badgeX = pageWidth - margin - badgeWidth;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(badgeX, currentY, badgeWidth, 14, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(badgeX, currentY, badgeWidth, 14, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28);
  doc.text(`FICHE DE NON-CONFORMITÉ N° ${anomaly.id}`, badgeX + badgeWidth / 2, currentY + 5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Constat du : ${formatDateFr(anomaly.date)}`, badgeX + badgeWidth / 2, currentY + 9.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Statut actuel : ${anomaly.status.toUpperCase()}`, badgeX + badgeWidth / 2, currentY + 12.5, { align: 'center' });

  currentY += 18;

  // Divider line
  doc.setDrawColor(185, 28, 28);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;

  // Identification Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 24, 1.5, 1.5, 'FD');

  const col1X = margin + 4;
  const col2X = margin + 98;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Chantier / Projet :', col1X, currentY + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(project.name, col1X + 28, currentY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Code Affaire :', col1X, currentY + 9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${project.code} · ${project.location}`, col1X + 28, currentY + 9.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Sous-Traitant visé :', col1X, currentY + 14.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text(anomaly.subcontractorName, col1X + 28, currentY + 14.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Localisation exacte :', col1X, currentY + 19.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(anomaly.location, col1X + 28, currentY + 19.5);

  // Right column
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Émis par (Conducteur GCB) :', col2X, currentY + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(project.supervisorName, col2X + 42, currentY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Corps d’état / Catégorie :', col2X, currentY + 9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(anomaly.category.toUpperCase(), col2X + 42, currentY + 9.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Niveau de Gravité :', col2X, currentY + 14.5);
  doc.setFont('helvetica', 'bold');
  if (anomaly.severity === 'critique') doc.setTextColor(185, 28, 28);
  else if (anomaly.severity === 'majeure') doc.setTextColor(180, 83, 9);
  else doc.setTextColor(71, 85, 105);
  doc.text(anomaly.severity.toUpperCase(), col2X + 42, currentY + 14.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Date Limite de Reprise :', col2X, currentY + 19.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text(formatDateFr(anomaly.deadlineDate), col2X + 42, currentY + 19.5);

  currentY += 28;

  // Descriptif du constat
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. CONSTAT DE NON-CONFORMITÉ & DÉTAIL DU DÉSORDRE', margin, currentY);
  currentY += 2.5;

  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 20, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(185, 28, 28);
  doc.text(anomaly.title, margin + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  const splitD = doc.splitTextToSize(anomaly.description, pageWidth - margin * 2 - 8);
  doc.text(splitD, margin + 4, currentY + 10.5);

  currentY += 24;

  // Instructions techniques GCB
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. INSTRUCTIONS TECHNIQUES & ORDRE DE REPRISE NOTIFIÉ', margin, currentY);
  currentY += 2.5;

  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(252, 211, 77);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text(`Prescriptions d’exécution (Conformité DTR & Règles de l’art) :`, margin + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  const splitR = doc.splitTextToSize(anomaly.recommendation, pageWidth - margin * 2 - 8);
  doc.text(splitR, margin + 4, currentY + 10.5);

  currentY += 26;

  // Timeline visuelle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. CHRONOLOGIE DU CYCLE DE VIE & TRAÇABILITÉ DES INTERVENTIONS', margin, currentY);
  currentY += 2.5;

  const tHeight = drawVectorAnomalyTimeline(doc, margin, currentY, pageWidth - margin * 2, anomaly);
  currentY += tHeight + 6;

  // Tableau détaillé des événements d'historique s'ils existent
  if (anomaly.history && anomaly.history.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('JOURNAL D’AUDIT DES ÉVÉNEMENTS :', margin, currentY);
    currentY += 2;

    const histBody = anomaly.history.map((h, i) => [
      `${i + 1}`,
      formatDateFr(h.date),
      h.title,
      h.author,
      h.comment || '-',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['N°', 'Date', 'Étape / Événement', 'Intervenant', 'Observations']],
      body: histBody,
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontSize: 6.5,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 18, halign: 'center' },
        2: { cellWidth: 42, fontStyle: 'bold' },
        3: { cellWidth: 32 },
        4: { cellWidth: 'auto' },
      },
      styles: {
        fontSize: 6.2,
        cellPadding: 1.5,
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // Signatures
  if (currentY > pageHeight - 40) {
    doc.addPage();
    currentY = margin + 5;
  }

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 4;

  const half = (pageWidth - margin * 2) / 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('LE CONDUCTEUR DE TRAVAUX GCB', margin + half / 2, currentY + 3, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(project.supervisorName, margin + half / 2, currentY + 7, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('[ Signature & Cachet de Chantier ]', margin + half / 2, currentY + 22, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ACCUSÉ DE RÉCEPTION DU SOUS-TRAITANT', margin + half + half / 2, currentY + 3, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(anomaly.subcontractorName, margin + half + half / 2, currentY + 7, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('[ Nom, Date, Émargement & Cachet ]', margin + half + half / 2, currentY + 22, { align: 'center' });

  // Footers
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8);

    doc.text(
      `GCB · Fiche Ordre de Reprise & Chronologie N° ${anomaly.id} · ${project.name}`,
      margin,
      pageHeight - 5
    );
    doc.text(`Page ${i} sur ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
  }

  const fileName = `GCB_Fiche_Anomalie_${anomaly.id}_${anomaly.subcontractorName.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

