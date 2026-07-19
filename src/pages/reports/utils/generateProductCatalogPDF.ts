import jsPDF from "jspdf";
import type { IProduct, IFilterProductInput } from "../../../utils/interfaces/Product";
import { formatAmount } from "../../../utils/currency";

// ── Design tokens ─────────────────────────────────────────────
const INK: [number, number, number] = [30, 41, 59];
const INK_MID: [number, number, number] = [71, 85, 105];
const INK_LIGHT: [number, number, number] = [148, 163, 184];
const RULE: [number, number, number] = [203, 213, 225];
const ACCENT: [number, number, number] = [160, 200, 46];
const BG_CARD: [number, number, number] = [248, 250, 252];
const BG_IMG: [number, number, number] = [241, 245, 249];
const BG_CAT: [number, number, number] = [241, 245, 249];
const GREEN_PRICE: [number, number, number] = [74, 120, 10];
const GREEN_STOCK: [number, number, number] = [22, 101, 52];
const RED_STOCK: [number, number, number] = [185, 28, 28];

const MARGIN = 14;
const PAGE_W = 210;
const PAGE_H = 297;
const COLS = 3;
const COL_GAP = 4;
const COL_W = (PAGE_W - MARGIN * 2 - COL_GAP * (COLS - 1)) / COLS; // ~58 mm
const CARD_H = 46;
const ROW_GAP = 4;
const IMG_H = 22;
const CAT_H = 8;
const CAT_GAP = 3;
const FOOTER_Y = PAGE_H - 14;
const CONTENT_P1 = 36; // first page (has filter row)
const CONTENT_PN = 24; // subsequent pages

// ── Image helpers ─────────────────────────────────────────────
const fetchImageAsBase64 = async (url: string): Promise<string | null> => {
  if (!url) return null;
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const imgFormat = (dataUrl: string): string => {
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  if (dataUrl.startsWith("data:image/webp")) return "WEBP";
  return "JPEG";
};

// ── Layout helpers ────────────────────────────────────────────
const hRule = (doc: jsPDF, y: number, x1 = MARGIN, x2 = PAGE_W - MARGIN) => {
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.line(x1, y, x2, y);
};

// Truncate text to fit maxWidth, appending "…" if cut
const clip = (doc: jsPDF, text: string, maxWidth: number): string => {
  if (!text) return "";
  if (doc.getTextWidth(text) <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && doc.getTextWidth(t + "…") > maxWidth) {
    t = t.slice(0, -1);
  }
  return t + "…";
};

// ── Page header ───────────────────────────────────────────────
const drawHeader = (
  doc: jsPDF,
  isFirst: boolean,
  filters: { categoryName?: string; brandName?: string; status?: string },
  total: number
) => {
  // Accent top bar
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, PAGE_W, 3, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...INK);
  doc.text("CATÁLOGO DE PRODUCTOS", MARGIN, 14);

  // Right: count + date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK_LIGHT);
  const date = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(
    `${total} producto${total !== 1 ? "s" : ""}   ·   ${date}`,
    PAGE_W - MARGIN,
    14,
    { align: "right" }
  );

  hRule(doc, 19);

  if (isFirst) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...INK_MID);
    doc.text("FILTROS:", MARGIN, 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...INK);
    const ft = [
      `Categoría: ${filters.categoryName ?? "Todas"}`,
      `Marca: ${filters.brandName ?? "Todas"}`,
      `Estado: ${filters.status ?? "Todos"}`,
    ].join("     ·     ");
    doc.text(ft, MARGIN + 18, 25);

    hRule(doc, 31);
  }
};

// ── Page footer ───────────────────────────────────────────────
const drawFooter = (doc: jsPDF, pageNum: number, totalPages: number) => {
  hRule(doc, FOOTER_Y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text("Inventasys — Catálogo de Productos", MARGIN, FOOTER_Y + 5);
  doc.text(
    `Página ${pageNum} de ${totalPages}`,
    PAGE_W - MARGIN,
    FOOTER_Y + 5,
    { align: "right" }
  );
};

// ── Category divider ──────────────────────────────────────────
const drawCategoryDivider = (doc: jsPDF, name: string, count: number, y: number) => {
  doc.setFillColor(...BG_CAT);
  doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, CAT_H, "F");

  doc.setFillColor(...ACCENT);
  doc.rect(MARGIN, y, 3, CAT_H, "F");

  // Reserve space for the count badge on the right before truncating name
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const countTxt = `${count} producto${count !== 1 ? "s" : ""}`;
  const countW = doc.getTextWidth(countTxt) + 3;
  const nameMaxW = PAGE_W - MARGIN * 2 - 3 - 7 - countW - 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK);
  doc.text(clip(doc, name.toUpperCase(), nameMaxW), MARGIN + 7, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text(countTxt, PAGE_W - MARGIN, y + 6, { align: "right" });
};

// ── Product card ──────────────────────────────────────────────
const drawCard = (
  doc: jsPDF,
  product: IProduct,
  x: number,
  y: number,
  imageData: string | null,
  currency: string
) => {
  const px = 3.5; // horizontal padding inside card

  // Card background
  doc.setFillColor(...BG_CARD);
  doc.rect(x, y, COL_W, CARD_H, "F");

  // Top accent stripe
  doc.setFillColor(...ACCENT);
  doc.rect(x, y, COL_W, 2, "F");

  // Image zone background
  doc.setFillColor(...BG_IMG);
  doc.rect(x, y + 2, COL_W, IMG_H, "F");

  // Image or placeholder
  if (imageData) {
    try {
      doc.addImage(
        imageData,
        imgFormat(imageData),
        x,
        y + 2,
        COL_W,
        IMG_H,
        undefined,
        "FAST"
      );
    } catch {
      drawPlaceholder(doc, x, y + 2, product.code);
    }
  } else {
    drawPlaceholder(doc, x, y + 2, product.code);
  }

  // ── Text content — fixed vertical positions ───────────────
  const textW = COL_W - px * 2;       // available text width
  const imgBottom = y + 2 + IMG_H;    // y where image area ends

  // Fixed anchors from imgBottom (independent of name length)
  // CARD_H=46, imgBottom=y+24 → card bottom=y+46, 3mm clearance at bottom
  const NAME_Y   = imgBottom + 3.5;   // name line 1         → y+27.5
  const META_Y   = imgBottom + 11;    // brand · category    → y+35
  const PRICE_Y  = imgBottom + 15;    // sale price          → y+39
  const STOCK_Y  = imgBottom + 19;    // stock               → y+43

  // Product name — up to 2 lines, each clipped to card width
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK);
  const rawLines = doc.splitTextToSize(product.name, textW) as string[];
  const nameLines = rawLines.slice(0, 2).map((l: string) => clip(doc, l, textW));
  doc.text(nameLines[0], x + px, NAME_Y);
  if (nameLines[1]) doc.text(nameLines[1], x + px, NAME_Y + 3.5);

  // Brand · Category — single line, truncated
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...INK_LIGHT);
  const rawMeta = [product.brand?.name, product.category?.name]
    .filter(Boolean)
    .join("  ·  ");
  doc.text(clip(doc, rawMeta || "—", textW), x + px, META_Y);

  // Sale price — truncated
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...GREEN_PRICE);
  const priceTxt = `${currency} ${formatAmount(product.sale_price ?? 0)}`;
  doc.text(clip(doc, priceTxt, textW), x + px, PRICE_Y);

  // Stock
  const qty = product.stock ?? 0;
  const inStock = qty > 0;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...(inStock ? GREEN_STOCK : RED_STOCK));
  doc.text(
    clip(doc, `${inStock ? "✓" : "✗"}  Stock: ${qty} uds.`, textW),
    x + px,
    STOCK_Y
  );

  // Card border
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.25);
  doc.rect(x, y, COL_W, CARD_H, "S");

  // Thin separator below accent stripe
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.15);
  doc.line(x, y + 2, x + COL_W, y + 2);
};

const drawPlaceholder = (doc: jsPDF, x: number, y: number, code: string) => {
  doc.setFillColor(235, 240, 245);
  doc.rect(x, y, COL_W, IMG_H, "F");

  // Camera icon area (simple visual)
  const cx = x + COL_W / 2;
  const cy = y + IMG_H / 2;
  doc.setFillColor(200, 210, 220);
  doc.roundedRect(cx - 6, cy - 5, 12, 9, 1.5, 1.5, "F");
  doc.setFillColor(255, 255, 255);
  doc.circle(cx, cy - 0.5, 2.5, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text(code || "SIN IMAGEN", cx, cy + 7, { align: "center" });
};

// ── Main export ───────────────────────────────────────────────
export interface ICatalogFilters extends IFilterProductInput {
  categoryName?: string;
  brandName?: string;
}

export const generateProductCatalogPDF = async (
  products: IProduct[],
  currency: string,
  filters: ICatalogFilters
) => {
  // Pre-load all images in parallel
  const imgMap = new Map<string, string | null>();
  await Promise.all(
    products.map(async (p) => {
      imgMap.set(p._id, p.image ? await fetchImageAsBase64(p.image) : null);
    })
  );

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Group by category (preserving insertion order)
  const groups = new Map<string, IProduct[]>();
  for (const p of products) {
    const cat = p.category?.name ?? "Sin categoría";
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(p);
  }

  let pageNum = 1;
  const pages: number[] = [1];
  let isFirst = true;
  let curY = CONTENT_P1;

  // First page header
  drawHeader(doc, true, filters, products.length);

  const spaceLeft = () => FOOTER_Y - 2 - curY;

  const addPage = () => {
    doc.addPage();
    pageNum++;
    pages.push(pageNum);
    isFirst = false;
    drawHeader(doc, false, filters, products.length);
    curY = CONTENT_PN;
  };

  for (const [catName, catProducts] of groups) {
    // Need space for divider + at least one card row
    if (spaceLeft() < CAT_H + CAT_GAP + CARD_H) {
      addPage();
    }

    drawCategoryDivider(doc, catName, catProducts.length, curY);
    curY += CAT_H + CAT_GAP;

    // Cards in rows of COLS columns
    for (let i = 0; i < catProducts.length; i += COLS) {
      if (spaceLeft() < CARD_H) {
        addPage();
      }

      for (let col = 0; col < COLS; col++) {
        const p = catProducts[i + col];
        if (!p) break;
        const x = MARGIN + col * (COL_W + COL_GAP);
        drawCard(doc, p, x, curY, imgMap.get(p._id) ?? null, currency);
      }

      curY += CARD_H + ROW_GAP;
    }

    curY += 4; // gap between category groups
  }

  // Draw footers on all pages with correct total
  const totalPages = pages.length;
  pages.forEach((pg) => {
    doc.setPage(pg);
    drawFooter(doc, pg, totalPages);
  });

  // Suppress unused variable warning
  void isFirst;

  doc.save(`catalogo_productos_${Date.now()}.pdf`);
};
