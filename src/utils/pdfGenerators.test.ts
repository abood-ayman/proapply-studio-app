import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCvPdfDocument, generateCoverLetterPdf } from './pdfGenerators.ts';
import { buildTemplateCoverLetter } from './coverLetterBuilder.ts';
import { DEFAULT_PROFILE } from './cvLayout.ts';

const PDF_MAGIC = '%PDF';

test('CV PDF builds a single A4 page from the sample profile', () => {
  const { doc, filename } = generateCvPdfDocument(DEFAULT_PROFILE);
  assert.equal(doc.getNumberOfPages(), 1);
  assert.match(filename, /English_CV\.pdf$/);
  const bytes = new Uint8Array(doc.output('arraybuffer'));
  assert.ok(bytes.length > 1000, 'PDF should have real content');
  const head = new TextDecoder('latin1').decode(bytes.slice(0, 4));
  assert.equal(head, PDF_MAGIC);
});

test('cover letter PDF builds from the offline template letter', () => {
  const letter = buildTemplateCoverLetter(DEFAULT_PROFILE, {
    jobTitle: 'Site Engineer',
    companyName: 'Example Co',
  });
  const { doc, filename } = generateCoverLetterPdf(DEFAULT_PROFILE, letter);
  assert.ok(doc.getNumberOfPages() >= 1);
  assert.match(filename, /Cover_Letter\.pdf$/);
  const bytes = new Uint8Array(doc.output('arraybuffer'));
  assert.ok(bytes.length > 1000, 'PDF should have real content');
  const head = new TextDecoder('latin1').decode(bytes.slice(0, 4));
  assert.equal(head, PDF_MAGIC);
});

test('CV PDF filename uses the candidate name', () => {
  const { filename } = generateCvPdfDocument(DEFAULT_PROFILE);
  assert.ok(filename.length > 'English_CV.pdf'.length, 'filename should include the candidate name');
  assert.ok(!filename.includes('/'), 'filename must be a plain file name');
});
