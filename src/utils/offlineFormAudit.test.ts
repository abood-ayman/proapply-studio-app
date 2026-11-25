import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFormOffline, splitFormItems } from './offlineFormAudit.ts';
import { SAMPLE_PORTAL_REVIEW_TEXT } from './formAuditParser.ts';

test('flags a Yes on a disqualifying question as critical', () => {
  const report = auditFormOffline(SAMPLE_PORTAL_REVIEW_TEXT, 'en');
  const felony = report.findings.find((f) => /felony|convicted/i.test(f.fieldOrQuestion));
  assert.ok(felony);
  assert.equal(felony.severity, 'critical');
  assert.equal(report.overallRisk, 'high');
});

test('flags blank answers and detects the portal', () => {
  const report = auditFormOffline(SAMPLE_PORTAL_REVIEW_TEXT, 'en');
  assert.match(report.portalDetected, /Taleo/i);
  const blank = report.findings.find((f) => /short-term/i.test(f.fieldOrQuestion));
  assert.ok(blank);
  assert.equal(blank.severity, 'critical');
});

test('marks safe answers as ok and never invents questions', () => {
  const report = auditFormOffline('1. Are you available immediately? Answer: Yes', 'en');
  assert.equal(report.findings.length, 1);
  assert.equal(report.findings[0].severity, 'ok');
  assert.equal(report.overallRisk, 'low');
});

test('handles empty input gracefully', () => {
  const report = auditFormOffline('', 'ar');
  assert.equal(report.findings.length, 1);
  assert.equal(report.findings[0].severity, 'warning');
});

test('flags invalid email as critical', () => {
  const report = auditFormOffline('Email: not-an-email', 'en');
  const email = report.findings.find((f) => /email/i.test(f.fieldOrQuestion));
  assert.ok(email);
  assert.equal(email.severity, 'critical');
});

test('splits numbered Q&A items', () => {
  const items = splitFormItems('1. Question one? Answer: Yes\n2. Question two? Answer: No');
  assert.equal(items.length, 2);
  assert.equal(items[0].answer, 'Yes');
});
