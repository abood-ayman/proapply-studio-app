import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PROFILE,
  EMPTY_PROFILE,
  buildCoverLetterFilename,
  buildCvFilename,
  calculateCvScaleMetrics,
  cloneProfile,
  mergeProfile,
  applyTailoredProfile,
} from './cvLayout';

test('buildCvFilename and buildCoverLetterFilename format clean ATS filenames', () => {
  assert.equal(
    buildCvFilename('Sample Candidate'),
    'Sample_Candidate_English_CV.pdf'
  );
  assert.equal(buildCvFilename(''), 'Candidate_English_CV.pdf');
  assert.equal(
    buildCoverLetterFilename('Sample Candidate'),
    'Sample_Candidate_Cover_Letter.pdf'
  );
});

test('calculateCvScaleMetrics keeps default and empty profiles strictly on 1 single A4 page', () => {
  const metrics = calculateCvScaleMetrics(DEFAULT_PROFILE);
  assert.equal(metrics.fitsSinglePage, true);
  assert.ok(metrics.estimatedUsedHeightMm <= 297);

  const emptyMetrics = calculateCvScaleMetrics(EMPTY_PROFILE);
  assert.equal(emptyMetrics.fitsSinglePage, true);
});

test('calculateCvScaleMetrics scales down typography for dense CVs without exceeding A4 height', () => {
  const dense = cloneProfile(DEFAULT_PROFILE);
  dense.summary = `${dense.summary} ${dense.summary} ${dense.summary}`;
  dense.experiences.push(
    {
      id: 'exp-3',
      role: 'Systems Analyst Intern',
      company: 'Suez Port Authority',
      location: 'City, Country',
      period: '2024',
      bullets: [
        'Audited daily logistics manifests and normalized relational database schemas across port operations.',
        'Automated weekly KPI spreadsheets using SQL queries and structured Excel pivot workbooks.',
        'Trained 12 administrative staff members on secure document archiving workflows.',
      ],
    },
    {
      id: 'exp-4',
      role: 'IT Operations Volunteer',
      company: 'Regional Youth Tech Initiative',
      location: 'City, Country',
      period: '2023',
      bullets: [
        'Configured local area networks and maintained Windows workstations for 35 trainees.',
        'Resolved hardware and printer incidents during multi-day training bootcamps.',
      ],
    }
  );

  const defaultMetrics = calculateCvScaleMetrics(DEFAULT_PROFILE);
  const denseMetrics = calculateCvScaleMetrics(dense);

  assert.equal(denseMetrics.fitsSinglePage, true);
  assert.ok(denseMetrics.estimatedUsedHeightMm <= 297);
  assert.ok(denseMetrics.fontScale <= defaultMetrics.fontScale);
});

test('mergeProfile preserves defaults when partial, and preserves blank when allowEmpty=true', () => {
  const merged = mergeProfile(DEFAULT_PROFILE, {
    fullName: '',
    targetRole: 'Database Administrator',
    coreCompetencies: ['SQL', 'Python'],
  });
  assert.equal(merged.fullName, DEFAULT_PROFILE.fullName);
  assert.equal(merged.targetRole, 'Database Administrator');

  const cleared = mergeProfile(EMPTY_PROFILE, EMPTY_PROFILE, true);
  assert.equal(cleared.fullName, '');
  assert.equal(cleared.experiences.length, 0);
});

test('applyTailoredProfile keeps facts, rewrites wording, drops invented experiences', () => {
  const base = cloneProfile(DEFAULT_PROFILE);
  const first = base.experiences[0];
  const out = applyTailoredProfile(base, {
    targetRole: 'Data Analyst',
    summary: 'New summary',
    experiences: [
      { id: first.id, role: 'CEO', company: 'FakeCorp', location: 'Mars', period: '1999', bullets: ['Rewrote bullet'] },
      { id: 'invented', role: 'X', company: 'Y', location: 'Z', period: '2020', bullets: ['Nope'] },
    ],
  });
  assert.equal(out.summary, 'New summary');
  assert.equal(out.targetRole, 'Data Analyst');
  assert.equal(out.experiences.length, base.experiences.length);
  assert.equal(out.experiences[0].company, first.company);
  assert.equal(out.experiences[0].role, first.role);
  assert.equal(out.experiences[0].period, first.period);
  assert.deepEqual(out.experiences[0].bullets, ['Rewrote bullet']);
  assert.ok(!out.experiences.some((e) => e.id === 'invented'));
});
