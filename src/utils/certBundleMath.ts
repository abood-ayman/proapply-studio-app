import type { CertificateDocItem, CardBoxMm, ItemsPerPageOption } from '../types';
import { A4_HEIGHT_MM, A4_WIDTH_MM } from './idMergerMath';

export const CERTIFICATES_PDF_FILENAME = 'Certificates_Portfolio.pdf';

export interface CertPlacement {
  item: CertificateDocItem;
  box: CardBoxMm;
}

export interface CertPdfPage {
  pageNumber: number;
  placements: CertPlacement[];
}

/**
 * Computes exact A4 grid bounding boxes for 1, 2, or 4 certificate/document
 * images per A4 page (210mm x 297mm), preserving aspect ratios without clipping.
 */
export function computeCertificatePagesLayout(
  items: CertificateDocItem[],
  itemsPerPage: ItemsPerPageOption
): CertPdfPage[] {
  if (items.length === 0) return [];

  const marginX = 14;
  const marginY = 14;
  const gapX = 10;
  const gapY = 10;

  const cols = itemsPerPage === 4 ? 2 : 1;
  const rows = itemsPerPage === 1 ? 1 : 2;

  const usableW = A4_WIDTH_MM - marginX * 2 - gapX * (cols - 1);
  const usableH = A4_HEIGHT_MM - marginY * 2 - gapY * (rows - 1);
  const cellW = usableW / cols;
  const cellH = usableH / rows;

  const pages: CertPdfPage[] = [];
  for (let i = 0; i < items.length; i += itemsPerPage) {
    const slice = items.slice(i, i + itemsPerPage);
    const placements: CertPlacement[] = slice.map((item, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cellX = marginX + col * (cellW + gapX);
      const cellY = marginY + row * (cellH + gapY);

      const safeW = Math.max(1, item.width);
      const safeH = Math.max(1, item.height);
      const scale = Math.min(cellW / safeW, cellH / safeH);
      const drawW = Number((safeW * scale).toFixed(2));
      const drawH = Number((safeH * scale).toFixed(2));

      return {
        item,
        box: {
          x: Number((cellX + (cellW - drawW) / 2).toFixed(2)),
          y: Number((cellY + (cellH - drawH) / 2).toFixed(2)),
          width: drawW,
          height: drawH,
        },
      };
    });

    pages.push({
      pageNumber: pages.length + 1,
      placements,
    });
  }

  return pages;
}
