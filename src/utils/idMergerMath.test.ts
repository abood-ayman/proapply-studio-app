import test from 'node:test';
import assert from 'node:assert/strict';
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  computeDualCardA4Layout,
  enhanceRgbaContrastAndSharpness,
  getRotatedDimensions,
} from './idMergerMath';

test('getRotatedDimensions swaps width and height on 90 and 270 degree rotations', () => {
  assert.deepEqual(getRotatedDimensions(1000, 630, 0), { width: 1000, height: 630 });
  assert.deepEqual(getRotatedDimensions(1000, 630, 90), { width: 630, height: 1000 });
  assert.deepEqual(getRotatedDimensions(1000, 630, 180), { width: 1000, height: 630 });
  assert.deepEqual(getRotatedDimensions(1000, 630, 270), { width: 630, height: 1000 });
});

test('computeDualCardA4Layout strictly fits landscape cards on 1 centered A4 page', () => {
  const layout = computeDualCardA4Layout(
    { width: 1600, height: 1000 },
    { width: 1600, height: 1000 }
  );
  assert.equal(layout.fitsSinglePage, true);
  assert.equal(layout.pageWidthMm, A4_WIDTH_MM);
  assert.equal(layout.pageHeightMm, A4_HEIGHT_MM);
  assert.ok(layout.frontBox.y >= 20);
  assert.ok(layout.backBox.y > layout.frontBox.y + layout.frontBox.height);
  assert.ok(layout.backBox.y + layout.backBox.height <= A4_HEIGHT_MM - 20);
  // Centered horizontally
  const frontCenter = layout.frontBox.x + layout.frontBox.width / 2;
  assert.ok(Math.abs(frontCenter - A4_WIDTH_MM / 2) < 0.1);
});

test('computeDualCardA4Layout fits even tall portrait scans inside 1 single A4 page', () => {
  const layout = computeDualCardA4Layout(
    { width: 600, height: 1200 },
    { width: 700, height: 1400 }
  );
  assert.equal(layout.fitsSinglePage, true);
  assert.ok(layout.frontBox.height <= 116);
  assert.ok(layout.backBox.height <= 116);
  assert.ok(layout.backBox.y + layout.backBox.height <= A4_HEIGHT_MM);
});

test('enhanceRgbaContrastAndSharpness preserves alpha and clamps RGB channels', () => {
  // 3x3 pixel grid (36 bytes)
  const pixels = new Uint8ClampedArray(3 * 3 * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 120;
    pixels[i + 1] = 240;
    pixels[i + 2] = 30;
    pixels[i + 3] = 255;
  }
  const result = enhanceRgbaContrastAndSharpness(pixels, 3, 3);
  assert.equal(result.length, pixels.length);
  for (let i = 0; i < result.length; i += 4) {
    assert.equal(result[i + 3], 255);
    assert.ok(result[i] >= 0 && result[i] <= 255);
    assert.ok(result[i + 1] >= 0 && result[i + 1] <= 255);
  }
});
