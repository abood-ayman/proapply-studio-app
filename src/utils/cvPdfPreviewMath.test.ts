import test from 'node:test';
import assert from 'node:assert/strict';
import {
  A4_PT_HEIGHT,
  A4_PT_WIDTH,
  MAX_PREVIEW_ZOOM,
  MIN_PREVIEW_ZOOM,
  clampPreviewZoom,
  computePdfCanvasRenderSize,
} from './cvPdfPreviewMath';
import { DEFAULT_PROFILE, EMPTY_PROFILE } from './cvLayout';
import { generateCvPdfDocument } from './pdfGenerators';

test('clampPreviewZoom clamps values safely within allowed bounds', () => {
  assert.equal(clampPreviewZoom(0.1), MIN_PREVIEW_ZOOM);
  assert.equal(clampPreviewZoom(3.5), MAX_PREVIEW_ZOOM);
  assert.equal(clampPreviewZoom(1.2), 1.2);
  assert.equal(clampPreviewZoom(Number.NaN), 1);
});

test('computePdfCanvasRenderSize maintains A4 aspect ratio and scales pixels by DPR', () => {
  const size1x = computePdfCanvasRenderSize(A4_PT_WIDTH, A4_PT_HEIGHT, 640, 1, 1);
  const size2x = computePdfCanvasRenderSize(A4_PT_WIDTH, A4_PT_HEIGHT, 640, 1, 2);

  assert.equal(size1x.cssWidth, 640);
  assert.equal(size1x.pixelWidth, 640);
  assert.equal(size2x.cssWidth, 640);
  assert.equal(size2x.pixelWidth, 1280);

  const ratio = size1x.cssHeight / size1x.cssWidth;
  assert.ok(Math.abs(ratio - A4_PT_HEIGHT / A4_PT_WIDTH) < 0.01);
});

test('generateCvPdfDocument outputs a valid single-page PDF byte buffer for previewing', () => {
  const { doc: sampleDoc, filename } = generateCvPdfDocument(DEFAULT_PROFILE);
  const sampleBytes = new Uint8Array(sampleDoc.output('arraybuffer'));
  const header = String.fromCharCode(...sampleBytes.slice(0, 5));

  assert.equal(header, '%PDF-');
  assert.equal(sampleDoc.getNumberOfPages(), 1);
  assert.equal(filename, 'Sample_Candidate_English_CV.pdf');

  const { doc: emptyDoc } = generateCvPdfDocument(EMPTY_PROFILE);
  assert.equal(emptyDoc.getNumberOfPages(), 1);
});
