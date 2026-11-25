export type AppLanguage = 'en' | 'ar';

export type TabId =
  | 'cv-builder'
  | 'id-merger'
  | 'cert-bundle'
  | 'cover-and-audit'
  | 'profile-manager';

export type CvMode = 'instant' | 'ai';

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  expectedGraduation: string;
}

export interface CvProfile {
  fullName: string;
  targetRole: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  summary: string;
  coreCompetencies: string[];
  experiences: ExperienceItem[];
  education: EducationItem;
  certificates: string[];
}

export interface CvScaleMetrics {
  densityTier: 'relaxed' | 'balanced' | 'compact' | 'ultra-compact';
  fontScale: number;
  namePt: number;
  rolePt: number;
  sectionHeadingPt: number;
  bodyPt: number;
  metaPt: number;
  lineHeight: number;
  marginMm: number;
  sectionGapMm: number;
  itemGapMm: number;
  estimatedUsedHeightMm: number;
  fitsSinglePage: boolean;
}

export interface IdCardSlot {
  dataUrl: string;
  originalDataUrl: string;
  rotation: 0 | 90 | 180 | 270;
  width: number;
  height: number;
  fileName: string;
}

export interface CertificateDocItem {
  id: string;
  fileName: string;
  dataUrl: string;
  originalDataUrl: string;
  rotation: 0 | 90 | 180 | 270;
  width: number;
  height: number;
}

export type ItemsPerPageOption = 1 | 2 | 4;

export interface CardBoxMm {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DualCardA4Layout {
  pageWidthMm: number;
  pageHeightMm: number;
  frontBox: CardBoxMm;
  backBox: CardBoxMm;
  fitsSinglePage: boolean;
}

export type AuditSeverity = 'critical' | 'warning' | 'ok';

export interface AuditFinding {
  id: string;
  severity: AuditSeverity;
  fieldOrQuestion: string;
  detectedAnswer: string;
  issue: string;
  recommendation: string;
}

export interface AuditReport {
  portalDetected: string;
  overallRisk: 'high' | 'moderate' | 'low';
  auditedAt: string;
  findings: AuditFinding[];
}

export interface CoverLetterResult {
  subjectLine: string;
  letterBody: string;
  generatedAt: string;
}

export interface VaultMetadata {
  cvGeneratedAt: string | null;
  cvFilename: string | null;
  idGeneratedAt: string | null;
  idFilename: string | null;
  certsGeneratedAt: string | null;
  certsFilename: string | null;
  lastAuditAt: string | null;
  lastAuditSummary: {
    critical: number;
    warning: number;
    ok: number;
  } | null;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}
