import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTemplateCoverLetter, isProfileEmpty } from './coverLetterBuilder.ts';
import { DEFAULT_PROFILE, EMPTY_PROFILE } from './cvLayout.ts';

test('template letter uses only profile data and company/job title', () => {
  const result = buildTemplateCoverLetter(DEFAULT_PROFILE, {
    companyName: 'Acme Egypt',
    jobTitle: 'Data Entry Specialist',
  });
  assert.equal(result.subjectLine, 'Application for Data Entry Specialist – Acme Egypt');
  assert.ok(result.letterBody.includes('Dear Hiring Team at Acme Egypt,'));
  assert.ok(result.letterBody.includes('Data Entry Specialist at Acme Egypt'));
  assert.ok(result.letterBody.includes('Sample skill one'));
  assert.ok(result.letterBody.includes('Sincerely,\nSample Candidate'));
});

test('template letter falls back to target role and generic greeting', () => {
  const result = buildTemplateCoverLetter(DEFAULT_PROFILE, { companyName: '', jobTitle: '' });
  assert.equal(result.subjectLine, 'Application for Sample Target Role');
  assert.ok(result.letterBody.includes('Dear Hiring Team,'));
  assert.ok(!result.letterBody.includes('undefined'));
});

test('template letter never contains undefined or empty artifacts', () => {
  const result = buildTemplateCoverLetter(EMPTY_PROFILE, { companyName: '', jobTitle: '' });
  assert.ok(!result.letterBody.includes('undefined'));
  assert.ok(!result.letterBody.includes('  '));
  assert.ok(isProfileEmpty(EMPTY_PROFILE));
  assert.ok(!isProfileEmpty(DEFAULT_PROFILE));
});

test('template letter does not duplicate a Training marker already in the company', () => {
  const profile = {
    ...EMPTY_PROFILE,
    fullName: 'Test Person',
    experiences: [
      { id: 'e1', role: 'Trainee', company: 'PETROJET – Pipeline Project (Training)', location: '', period: 'Training', bullets: [] },
    ],
  };
  const result = buildTemplateCoverLetter(profile, { companyName: '', jobTitle: '' });
  assert.ok(!result.letterBody.includes('(Training) (Training)'));
  assert.ok((result.letterBody.match(/Training/g) || []).length <= 2);
});
