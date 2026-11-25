import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import type {
  CertificateDocItem,
  CoverLetterResult,
  CvProfile,
  IdCardSlot,
  ItemsPerPageOption,
} from '../types';
import { CERTIFICATES_PDF_FILENAME, computeCertificatePagesLayout } from './certBundleMath';
import { buildCoverLetterFilename, buildCvFilename, calculateCvScaleMetrics } from './cvLayout';
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  NATIONAL_ID_FILENAME,
  computeDualCardA4Layout,
} from './idMergerMath';

const PT_TO_MM = 0.352778;

export function generateCvPdfDocument(profile: CvProfile): {
  doc: jsPDF;
  filename: string;
} {
  const metrics = calculateCvScaleMetrics(profile);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const margin = metrics.marginMm;
  const contentWidth = A4_WIDTH_MM - margin * 2;
  const maxY = A4_HEIGHT_MM - margin;
  let y = margin;

  const ensureSpace = (neededMm: number): boolean => y + neededMm <= maxY;

  // Header: Full Name (Navy #0F172A)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(metrics.namePt);
  doc.setTextColor(15, 23, 42);
  doc.text(profile.fullName.trim() || 'Candidate Name', margin, y + metrics.namePt * PT_TO_MM * 0.8);
  y += metrics.namePt * PT_TO_MM * 1.15;

  // Target Role (Royal Blue #1E3A8A)
  if (profile.targetRole.trim()) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(metrics.rolePt);
    doc.setTextColor(30, 58, 138);
    doc.text(profile.targetRole.trim(), margin, y + metrics.rolePt * PT_TO_MM * 0.75);
    y += metrics.rolePt * PT_TO_MM * 1.2;
  }

  // Contact Bar
  const contactParts = [
    profile.location.trim(),
    profile.phone.trim(),
    profile.email.trim(),
    profile.linkedin.trim(),
  ].filter(Boolean);

  if (contactParts.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(metrics.metaPt);
    doc.setTextColor(71, 85, 105);
    const contactLine = contactParts.join('  |  ');
    const wrappedContact = doc.splitTextToSize(contactLine, contentWidth) as string[];
    for (const line of wrappedContact) {
      doc.text(line, margin, y + metrics.metaPt * PT_TO_MM * 0.75);
      y += metrics.metaPt * PT_TO_MM * 1.25;
    }
  }

  // Crisp Royal Blue Divider
  y += 1.2;
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.55);
  doc.line(margin, y, A4_WIDTH_MM - margin, y);
  y += metrics.sectionGapMm;

  const drawSectionHeader = (title: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(metrics.sectionHeadingPt);
    doc.setTextColor(15, 23, 42);
    doc.text(title.toUpperCase(), margin, y + metrics.sectionHeadingPt * PT_TO_MM * 0.8);
    y += metrics.sectionHeadingPt * PT_TO_MM * 1.1;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.25);
    doc.line(margin, y, A4_WIDTH_MM - margin, y);
    y += 2.2;
  };

  const bodyLineMm = metrics.bodyPt * PT_TO_MM * metrics.lineHeight;
  const metaLineMm = metrics.metaPt * PT_TO_MM * 1.25;

  if (profile.summary.trim() && ensureSpace(12)) {
    drawSectionHeader('Professional Summary');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(metrics.bodyPt);
    doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(profile.summary.trim(), contentWidth) as string[];
    for (const line of lines) {
      if (!ensureSpace(bodyLineMm)) break;
      doc.text(line, margin, y + metrics.bodyPt * PT_TO_MM * 0.75);
      y += bodyLineMm;
    }
    y += metrics.sectionGapMm;
  }

  if (profile.coreCompetencies.length > 0 && ensureSpace(12)) {
    drawSectionHeader('Core Competencies');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(metrics.bodyPt);
    doc.setTextColor(30, 41, 59);
    const skillsLine = profile.coreCompetencies.join('   •   ');
    const wrappedSkills = doc.splitTextToSize(skillsLine, contentWidth) as string[];
    for (const line of wrappedSkills) {
      if (!ensureSpace(bodyLineMm)) break;
      doc.text(line, margin, y + metrics.bodyPt * PT_TO_MM * 0.75);
      y += bodyLineMm;
    }
    y += metrics.sectionGapMm;
  }

  if (profile.experiences.length > 0 && ensureSpace(16)) {
    drawSectionHeader('Professional Experience');
    for (const exp of profile.experiences) {
      if (!ensureSpace(10)) break;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(metrics.bodyPt + 0.3);
      doc.setTextColor(15, 23, 42);
      doc.text(exp.role, margin, y + metrics.bodyPt * PT_TO_MM * 0.78);

      if (exp.period.trim()) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(metrics.metaPt);
        doc.setTextColor(30, 58, 138);
        doc.text(exp.period, A4_WIDTH_MM - margin, y + metrics.bodyPt * PT_TO_MM * 0.78, {
          align: 'right',
        });
      }
      y += bodyLineMm * 1.05;

      const companyLine = [exp.company, exp.location].filter(Boolean).join(' — ');
      if (companyLine) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(metrics.metaPt);
        doc.setTextColor(71, 85, 105);
        doc.text(companyLine, margin, y + metrics.metaPt * PT_TO_MM * 0.72);
        y += metaLineMm + 0.6;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(metrics.bodyPt);
      doc.setTextColor(30, 41, 59);
      const bulletIndent = 4.2;
      for (const bullet of exp.bullets) {
        const cleanBullet = bullet.trim();
        if (!cleanBullet) continue;
        const wrappedBullet = doc.splitTextToSize(
          cleanBullet,
          contentWidth - bulletIndent
        ) as string[];
        if (!ensureSpace(wrappedBullet.length * bodyLineMm)) break;

        doc.setTextColor(30, 58, 138);
        doc.text('•', margin + 0.8, y + metrics.bodyPt * PT_TO_MM * 0.75);
        doc.setTextColor(30, 41, 59);

        for (const bLine of wrappedBullet) {
          doc.text(bLine, margin + bulletIndent, y + metrics.bodyPt * PT_TO_MM * 0.75);
          y += bodyLineMm;
        }
        y += 0.5;
      }
      y += metrics.itemGapMm;
    }
    y += Math.max(0.5, metrics.sectionGapMm - metrics.itemGapMm);
  }

  if (profile.education.degree.trim() && ensureSpace(12)) {
    drawSectionHeader('Education');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(metrics.bodyPt + 0.2);
    doc.setTextColor(15, 23, 42);
    doc.text(profile.education.degree, margin, y + metrics.bodyPt * PT_TO_MM * 0.78);

    if (profile.education.expectedGraduation.trim()) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(metrics.metaPt);
      doc.setTextColor(30, 58, 138);
      doc.text(
        profile.education.expectedGraduation,
        A4_WIDTH_MM - margin,
        y + metrics.bodyPt * PT_TO_MM * 0.78,
        { align: 'right' }
      );
    }
    y += bodyLineMm * 1.05;

    if (profile.education.institution.trim()) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(metrics.metaPt);
      doc.setTextColor(71, 85, 105);
      doc.text(profile.education.institution, margin, y + metrics.metaPt * PT_TO_MM * 0.75);
      y += metaLineMm;
    }
    y += metrics.sectionGapMm;
  }

  if (profile.certificates.length > 0 && ensureSpace(10)) {
    drawSectionHeader('Certifications & Training');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(metrics.metaPt + 0.2);
    doc.setTextColor(30, 41, 59);

    const certs = profile.certificates;
    if (certs.length >= 4) {
      const colGap = 6;
      const colWidth = (contentWidth - colGap) / 2;
      for (let i = 0; i < certs.length; i += 2) {
        const leftLines = doc.splitTextToSize(`•  ${certs[i]}`, colWidth) as string[];
        const rightLines = certs[i + 1]
          ? (doc.splitTextToSize(`•  ${certs[i + 1]}`, colWidth) as string[])
          : [];
        const rows = Math.max(leftLines.length, rightLines.length);
        if (!ensureSpace(rows * metaLineMm)) break;

        for (let r = 0; r < rows; r++) {
          if (leftLines[r]) {
            doc.text(leftLines[r], margin, y + metrics.metaPt * PT_TO_MM * 0.75);
          }
          if (rightLines[r]) {
            doc.text(
              rightLines[r],
              margin + colWidth + colGap,
              y + metrics.metaPt * PT_TO_MM * 0.75
            );
          }
          y += metaLineMm * 1.08;
        }
        y += 0.4;
      }
    } else {
      for (const cert of certs) {
        const lines = doc.splitTextToSize(`•  ${cert}`, contentWidth) as string[];
        if (!ensureSpace(lines.length * metaLineMm)) break;
        for (const l of lines) {
          doc.text(l, margin, y + metrics.metaPt * PT_TO_MM * 0.75);
          y += metaLineMm * 1.08;
        }
      }
    }
  }

  const filename = buildCvFilename(profile.fullName);
  return { doc, filename };
}

/**
 * Generates a strict 1-page pure-white A4 PDF with ZERO headers, titles, or text.
 * Only Front ID centered on top and Back ID centered directly below it.
 */
export function generateNationalIdPdfDocument(
  front: IdCardSlot,
  back: IdCardSlot
): { doc: jsPDF; filename: string } {
  const layout = computeDualCardA4Layout(
    { width: front.width, height: front.height },
    { width: back.width, height: back.height }
  );

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, 'F');

  doc.addImage(
    front.dataUrl,
    'JPEG',
    layout.frontBox.x,
    layout.frontBox.y,
    layout.frontBox.width,
    layout.frontBox.height,
    undefined,
    'FAST'
  );

  doc.addImage(
    back.dataUrl,
    'JPEG',
    layout.backBox.x,
    layout.backBox.y,
    layout.backBox.width,
    layout.backBox.height,
    undefined,
    'FAST'
  );

  return { doc, filename: NATIONAL_ID_FILENAME };
}

export function generateCertificatesPortfolioPdf(
  items: CertificateDocItem[],
  itemsPerPage: ItemsPerPageOption
): { doc: jsPDF; filename: string } {
  const pages = computeCertificatePagesLayout(items, itemsPerPage);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  pages.forEach((page, idx) => {
    if (idx > 0) doc.addPage('a4', 'portrait');
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, 'F');

    for (const placement of page.placements) {
      doc.addImage(
        placement.item.dataUrl,
        'JPEG',
        placement.box.x,
        placement.box.y,
        placement.box.width,
        placement.box.height,
        undefined,
        'FAST'
      );
    }
  });

  return { doc, filename: CERTIFICATES_PDF_FILENAME };
}

export function generateCoverLetterPdf(
  profile: CvProfile,
  coverLetter: CoverLetterResult
): { doc: jsPDF; filename: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const margin = 20;
  const contentWidth = A4_WIDTH_MM - margin * 2;
  let y = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(15, 23, 42);
  doc.text(profile.fullName.trim() || 'Candidate Name', margin, y);
  y += 6.5;

  const contact = [profile.location, profile.phone, profile.email].filter(Boolean).join('  |  ');
  if (contact) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(contact, margin, y);
    y += 5;
  }

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.line(margin, y, A4_WIDTH_MM - margin, y);
  y += 10;

  if (coverLetter.subjectLine.trim()) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    const subjLines = doc.splitTextToSize(coverLetter.subjectLine.trim(), contentWidth) as string[];
    for (const sLine of subjLines) {
      doc.text(sLine, margin, y);
      y += 5.5;
    }
    y += 4;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  const paragraphs = coverLetter.letterBody.split(/\n{2,}/);
  for (const para of paragraphs) {
    const clean = para.trim();
    if (!clean) continue;
    const lines = doc.splitTextToSize(clean, contentWidth) as string[];
    for (const line of lines) {
      if (y > A4_HEIGHT_MM - margin) break;
      doc.text(line, margin, y);
      y += 5.2;
    }
    y += 4.2;
  }

  return { doc, filename: buildCoverLetterFilename(profile.fullName) };
}

export async function generateApplicationBundleZip(
  profile: CvProfile,
  front: IdCardSlot | null,
  back: IdCardSlot | null,
  certItems: CertificateDocItem[],
  certsPerPage: ItemsPerPageOption
): Promise<{ blob: Blob; filename: string }> {
  const zip = new JSZip();

  const { doc: cvDoc, filename: cvFilename } = generateCvPdfDocument(profile);
  zip.file(cvFilename, cvDoc.output('arraybuffer'));

  if (front && back) {
    const { doc: idDoc, filename: idFilename } = generateNationalIdPdfDocument(front, back);
    zip.file(idFilename, idDoc.output('arraybuffer'));
  }

  if (certItems.length > 0) {
    const { doc: certDoc, filename: certFilename } = generateCertificatesPortfolioPdf(
      certItems,
      certsPerPage
    );
    zip.file(certFilename, certDoc.output('arraybuffer'));
  }

  const cleanName =
    profile.fullName
      .trim()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '_') || 'Candidate';

  const blob = await zip.generateAsync({ type: 'blob' });
  return {
    blob,
    filename: `${cleanName}_Application_Bundle.zip`,
  };
}
