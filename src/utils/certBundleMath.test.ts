import test from 'node:test';
import assert from 'node:assert/strict';
import type { CertificateDocItem } from '../types';
import { A4_HEIGHT_MM, A4_WIDTH_MM } from './idMergerMath';
import { computeCertificatePagesLayout } from './certBundleMath';

function mockCert(id: string, w: number, h: number): CertificateDocItem {
  return {
    id,
    fileName: `${id}.png`,
    dataUrl: 'data:image/jpeg;base64,AA==',
    originalDataUrl: 'data:image/jpeg;base64,AA==',
    rotation: 0,
    width: w,
    height: h,
  };
}

test('computeCertificatePagesLayout paginates 1, 2, and 4 items per A4 page accurately', () => {
  const items = [
    mockCert('c1', 1200, 850),
    mockCert('c2', 850, 1200),
    mockCert('c3', 1600, 1000),
    mockCert('c4', 1000, 1000),
    mockCert('c5', 1400, 900),
  ];

  const onePer = computeCertificatePagesLayout(items, 1);
  assert.equal(onePer.length, 5);

  const twoPer = computeCertificatePagesLayout(items, 2);
  assert.equal(twoPer.length, 3);
  assert.equal(twoPer[0].placements.length, 2);
  assert.equal(twoPer[2].placements.length, 1);

  const fourPer = computeCertificatePagesLayout(items, 4);
  assert.equal(fourPer.length, 2);
  assert.equal(fourPer[0].placements.length, 4);
  assert.equal(fourPer[1].placements.length, 1);

  for (const page of [...onePer, ...twoPer, ...fourPer]) {
    for (const p of page.placements) {
      assert.ok(p.box.x >= 0 && p.box.x + p.box.width <= A4_WIDTH_MM);
      assert.ok(p.box.y >= 0 && p.box.y + p.box.height <= A4_HEIGHT_MM);
    }
  }
});
