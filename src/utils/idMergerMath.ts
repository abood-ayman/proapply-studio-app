import type { DualCardA4Layout } from '../types';

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const NATIONAL_ID_FILENAME = 'National_ID_Merged.pdf';

export function getRotatedDimensions(
  width: number,
  height: number,
  angleDeg: 0 | 90 | 180 | 270
): { width: number; height: number } {
  if (angleDeg === 90 || angleDeg === 270) {
    return { width: height, height: width };
  }
  return { width, height };
}

/**
 * Computes exact bounding boxes for Front and Back ID cards on a single
 * pure-white A4 page (210mm x 297mm) with zero extra text or headers.
 * Guarantees both cards fit vertically and horizontally with safe margins.
 */
export function computeDualCardA4Layout(
  frontSize: { width: number; height: number },
  backSize: { width: number; height: number }
): DualCardA4Layout {
  const marginX = 24; // mm each side -> max width 162mm
  const marginY = 24; // mm top/bottom -> max usable height 249mm
  const gapY = 18; // mm vertical gap between front & back cards

  const maxCardWidth = A4_WIDTH_MM - marginX * 2; // 162mm
  const maxSlotHeight = (A4_HEIGHT_MM - marginY * 2 - gapY) / 2; // 115.5mm

  const fitIntoSlot = (w: number, h: number): { width: number; height: number } => {
    const safeW = Math.max(1, w);
    const safeH = Math.max(1, h);
    // Target standard ID card proportion width (~110-140mm) while respecting slot bounds
    const targetMaxW = Math.min(maxCardWidth, 138);
    const scale = Math.min(targetMaxW / safeW, maxSlotHeight / safeH);
    return {
      width: Number((safeW * scale).toFixed(2)),
      height: Number((safeH * scale).toFixed(2)),
    };
  };

  const fDim = fitIntoSlot(frontSize.width, frontSize.height);
  const bDim = fitIntoSlot(backSize.width, backSize.height);

  const totalContentHeight = fDim.height + gapY + bDim.height;
  const startY = Number(((A4_HEIGHT_MM - totalContentHeight) / 2).toFixed(2));

  const frontBox = {
    x: Number(((A4_WIDTH_MM - fDim.width) / 2).toFixed(2)),
    y: startY,
    width: fDim.width,
    height: fDim.height,
  };

  const backBox = {
    x: Number(((A4_WIDTH_MM - bDim.width) / 2).toFixed(2)),
    y: Number((startY + fDim.height + gapY).toFixed(2)),
    width: bDim.width,
    height: bDim.height,
  };

  const fitsSinglePage =
    frontBox.x >= 0 &&
    backBox.x >= 0 &&
    frontBox.x + frontBox.width <= A4_WIDTH_MM &&
    backBox.x + backBox.width <= A4_WIDTH_MM &&
    frontBox.y >= 0 &&
    backBox.y + backBox.height <= A4_HEIGHT_MM;

  return {
    pageWidthMm: A4_WIDTH_MM,
    pageHeightMm: A4_HEIGHT_MM,
    frontBox,
    backBox,
    fitsSinglePage,
  };
}

/**
 * Pure pixel-level contrast & unsharp-style clarity enhancement for RGBA buffers.
 * Separated for deterministic unit testing and Canvas processing.
 */
export function enhanceRgbaContrastAndSharpness(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(pixels.length);

  // Step 1: Gentle S-curve contrast stretch + white background boost for scanned IDs
  const contrasted = new Uint8ClampedArray(pixels.length);
  for (let i = 0; i < pixels.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const v = pixels[i + c] / 255;
      // Contrast factor 1.24 centered around 0.48
      let adj = (v - 0.48) * 1.24 + 0.5;
      // Gently brighten near-white paper backgrounds
      if (adj > 0.88) {
        adj = Math.min(1, adj + (adj - 0.88) * 0.45);
      }
      contrasted[i + c] = Math.max(0, Math.min(255, Math.round(adj * 255)));
    }
    contrasted[i + 3] = pixels[i + 3];
  }

  // Step 2: Mild 3x3 sharpening kernel [0, -0.35, 0, -0.35, 2.4, -0.35, 0, -0.35, 0]
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        out[idx] = contrasted[idx];
        out[idx + 1] = contrasted[idx + 1];
        out[idx + 2] = contrasted[idx + 2];
        out[idx + 3] = contrasted[idx + 3];
        continue;
      }
      const up = ((y - 1) * width + x) * 4;
      const down = ((y + 1) * width + x) * 4;
      const left = (y * width + (x - 1)) * 4;
      const right = (y * width + (x + 1)) * 4;

      for (let c = 0; c < 3; c++) {
        const val =
          contrasted[idx + c] * 2.4 -
          0.35 *
            (contrasted[up + c] +
              contrasted[down + c] +
              contrasted[left + c] +
              contrasted[right + c]);
        out[idx + c] = Math.max(0, Math.min(255, Math.round(val)));
      }
      out[idx + 3] = contrasted[idx + 3];
    }
  }

  return out;
}

/**
 * Loads an image from dataUrl, bakes rotation (90/180/270) into a fresh HTML5 Canvas
 * buffer, and optionally applies pixel-level contrast & sharpness enhancement.
 */
export async function renderProcessedCardCanvas(
  sourceDataUrl: string,
  rotation: 0 | 90 | 180 | 270,
  enhance: boolean
): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 1800;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const srcW = Math.max(1, Math.round(img.width * scale));
      const srcH = Math.max(1, Math.round(img.height * scale));
      const outDims = getRotatedDimensions(srcW, srcH, rotation);

      const canvas = document.createElement('canvas');
      canvas.width = outDims.width;
      canvas.height = outDims.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -srcW / 2, -srcH / 2, srcW, srcH);
      ctx.restore();

      if (enhance) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const enhanced = enhanceRgbaContrastAndSharpness(
          imgData.data,
          canvas.width,
          canvas.height
        );
        imgData.data.set(enhanced);
        ctx.putImageData(imgData, 0, 0);
      }

      resolve({
        dataUrl: canvas.toDataURL('image/jpeg', 0.94),
        width: canvas.width,
        height: canvas.height,
      });
    };
    img.onerror = () => reject(new Error('Failed to decode ID image'));
    img.src = sourceDataUrl;
  });
}
