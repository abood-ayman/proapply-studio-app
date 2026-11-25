export const A4_PT_WIDTH = 595.28;
export const A4_PT_HEIGHT = 841.89;
export const MIN_PREVIEW_ZOOM = 0.6;
export const MAX_PREVIEW_ZOOM = 1.6;
export const PREVIEW_ZOOM_STEP = 0.2;

export function clampPreviewZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return 1;
  const clamped = Math.min(MAX_PREVIEW_ZOOM, Math.max(MIN_PREVIEW_ZOOM, zoom));
  return Number(clamped.toFixed(2));
}

export interface PdfCanvasRenderSize {
  cssWidth: number;
  cssHeight: number;
  pixelWidth: number;
  pixelHeight: number;
  viewportScale: number;
}

/**
 * Computes responsive CSS dimensions and crisp high-DPI canvas pixel dimensions
 * for rendering an A4 PDF page via pdf.js inside a container.
 */
export function computePdfCanvasRenderSize(
  pageWidthPt: number,
  pageHeightPt: number,
  containerWidthPx: number,
  zoomMultiplier: number,
  devicePixelRatio = 1
): PdfCanvasRenderSize {
  const safePageW = pageWidthPt > 0 ? pageWidthPt : A4_PT_WIDTH;
  const safePageH = pageHeightPt > 0 ? pageHeightPt : A4_PT_HEIGHT;
  const safeContainerW = Math.max(240, Math.min(1200, containerWidthPx || 640));
  const safeZoom = clampPreviewZoom(zoomMultiplier);
  const safeDpr = Math.min(2.5, Math.max(1, Number.isFinite(devicePixelRatio) ? devicePixelRatio : 1));

  const baseScale = safeContainerW / safePageW;
  const cssScale = baseScale * safeZoom;
  const cssWidth = Math.round(safePageW * cssScale);
  const cssHeight = Math.round(safePageH * cssScale);

  const viewportScale = cssScale * safeDpr;
  const pixelWidth = Math.max(1, Math.round(safePageW * viewportScale));
  const pixelHeight = Math.max(1, Math.round(safePageH * viewportScale));

  return {
    cssWidth,
    cssHeight,
    pixelWidth,
    pixelHeight,
    viewportScale,
  };
}
