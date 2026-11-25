import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAuditReport, normalizeAuditFindings, summarizeAuditCounts } from './formAuditParser';

test('normalizeAuditFindings orders critical -> warning -> ok', () => {
  const sorted = normalizeAuditFindings([
    {
      id: '3',
      severity: 'ok',
      fieldOrQuestion: 'Email',
      detectedAnswer: 'a@b.com',
      issue: 'None',
      recommendation: 'Verified',
    },
    {
      id: '1',
      severity: 'critical',
      fieldOrQuestion: 'Criminal conviction',
      detectedAnswer: 'Yes',
      issue: 'Selected Yes accidentally',
      recommendation: 'Change to No if not convicted',
    },
    {
      id: '2',
      severity: 'warning',
      fieldOrQuestion: 'Short-term contract',
      detectedAnswer: 'Blank',
      issue: 'Left blank',
      recommendation: 'Select Yes/No',
    },
  ]);

  assert.deepEqual(
    sorted.map((s) => s.severity),
    ['critical', 'warning', 'ok']
  );
});

test('summarizeAuditCounts and buildAuditReport calculate risk accurately', () => {
  const report = buildAuditReport({
    portalDetected: 'Oracle Taleo',
    findings: [
      {
        id: 'a',
        severity: 'critical',
        fieldOrQuestion: 'Dismissal',
        detectedAnswer: 'Yes',
        issue: 'Flagged',
        recommendation: 'Review',
      },
      {
        id: 'b',
        severity: 'ok',
        fieldOrQuestion: 'Phone',
        detectedAnswer: '+000000000000',
        issue: 'None',
        recommendation: 'OK',
      },
    ],
  });

  assert.equal(report.overallRisk, 'high');
  assert.deepEqual(summarizeAuditCounts(report.findings), {
    critical: 1,
    warning: 0,
    ok: 1,
  });
});

test('buildAuditReport never reports lower risk than findings imply', () => {
  const critical = { id: '1', severity: 'critical' as const, fieldOrQuestion: 'q', detectedAnswer: 'Yes', issue: 'i', recommendation: 'r' };
  assert.equal(buildAuditReport({ overallRisk: 'low', findings: [critical] }).overallRisk, 'high');
  assert.equal(buildAuditReport({ overallRisk: 'high', findings: [] }).overallRisk, 'high');
  assert.equal(buildAuditReport({ findings: [] }).overallRisk, 'low');
});
