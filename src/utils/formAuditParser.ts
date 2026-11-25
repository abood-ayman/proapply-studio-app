import type { AuditFinding, AuditReport, AuditSeverity } from '../types';

const SEVERITY_ORDER: Record<AuditSeverity, number> = {
  critical: 0,
  warning: 1,
  ok: 2,
};

const RISK_RANK = { low: 0, moderate: 1, high: 2 } as const;

export function normalizeAuditFindings(findings: AuditFinding[]): AuditFinding[] {
  return [...findings]
    .map((item, idx) => ({
      id: item.id || `finding-${idx + 1}`,
      severity:
        item.severity === 'critical' || item.severity === 'warning' || item.severity === 'ok'
          ? item.severity
          : 'warning',
      fieldOrQuestion: item.fieldOrQuestion?.trim() || `Item ${idx + 1}`,
      detectedAnswer: item.detectedAnswer?.trim() || 'Not specified',
      issue: item.issue?.trim() || '',
      recommendation: item.recommendation?.trim() || '',
    }))
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

export function summarizeAuditCounts(findings: AuditFinding[]): {
  critical: number;
  warning: number;
  ok: number;
} {
  let critical = 0;
  let warning = 0;
  let ok = 0;
  for (const item of findings) {
    if (item.severity === 'critical') critical += 1;
    else if (item.severity === 'warning') warning += 1;
    else ok += 1;
  }
  return { critical, warning, ok };
}

export function buildAuditReport(raw: {
  portalDetected?: string;
  overallRisk?: string;
  findings?: AuditFinding[];
}): AuditReport {
  const findings = normalizeAuditFindings(Array.isArray(raw.findings) ? raw.findings : []);
  const counts = summarizeAuditCounts(findings);
  const overallRisk: AuditReport['overallRisk'] =
    counts.critical > 0 ? 'high' : counts.warning > 0 ? 'moderate' : 'low';

  return {
    portalDetected: raw.portalDetected?.trim() || 'Job Application Portal',
    // Never report a lower risk than the findings themselves imply.
    overallRisk:
      (raw.overallRisk === 'high' || raw.overallRisk === 'moderate' || raw.overallRisk === 'low') &&
      RISK_RANK[raw.overallRisk] >= RISK_RANK[overallRisk]
        ? raw.overallRisk
        : overallRisk,
    auditedAt: new Date().toISOString(),
    findings,
  };
}

export const SAMPLE_PORTAL_REVIEW_TEXT = `Oracle Taleo / UN Career Portal — Application Final Summary
Candidate Name: Sample Candidate
Email: name@example.com
Phone: +00 000 000 0000
Current Location: City, Country

Eligibility & Legal Disclosures:
1. Have you ever been convicted of a felony or criminal offense? Answer: Yes
2. Have you ever been dismissed or suspended from employment for disciplinary reasons? Answer: No
3. Are you willing to accept short-term / temporary employment contracts? Answer: [Blank]
4. Do you hold a valid university degree or expected graduation date? Answer: Bachelor of MIS (Expected June 2028)
5. Notice Period / Availability: Answer: Immediately available
6. LinkedIn Profile URL: https://www.linkedin.com/in/example`;
