import jsPDF from "jspdf";

// ── Rendering de seriales dentro del PDF de orden de compra/venta ──
// Cuando una línea tiene muchos seriales, listarlos como un único
// texto corrido (colSpan) los hacía ilegibles: fuente diminuta y
// wrap sin control. Ahora se arman como una grilla de columnas fijas
// en fuente monoespaciada, alineada con padding de caracteres.
//
// Importante: el contenido se pasa como texto real con saltos de
// línea ("\n"), no dibujado a mano vía didDrawCell/minCellHeight.
// jspdf-autotable calcula el alto de paginación a partir del texto
// real de la celda; forzar minCellHeight en una celda con colSpan y
// contenido vacío hace que el cálculo de salto de página sea
// incorrecto y el contenido se desborde sobre el pie de página. Con
// texto real, autoTable pagina como lo hace con cualquier celda larga.
//
// Un producto con muchos seriales (cientos) puede necesitar más alto
// del que cabe en una sola página. Como una fila de autoTable no se
// puede partir entre páginas, los seriales de un mismo producto se
// dividen en varios "chunks" (cada uno su propia fila, de pocas
// líneas) para que autoTable pagine entre chunks con su
// comportamiento normal en vez de desbordar el contenido.

const SERIAL_COLOR: [number, number, number] = [51, 65, 85]; // slate-700
const CELL_BG: [number, number, number] = [248, 250, 252]; // slate-50

const SERIAL_FONT_SIZE = 7.5;
const GAP_CHARS = 3; // espacios entre columnas
const MIN_COL_CHARS = 14; // ancho mínimo de columna en caracteres
const ROWS_PER_CHUNK = 8; // filas de grilla por chunk — siempre cabe en una página nueva

const mmPerChar = (fontSize: number) => 0.6 * fontSize * 0.352778; // courier ~0.6em

const gridColumns = (serials: string[], rowWidth: number): { cols: number; colChars: number } => {
  const longest = serials.reduce((max, s) => Math.max(max, s.length), 0);
  const colChars = Math.max(MIN_COL_CHARS, longest + GAP_CHARS);
  const usableWidth = rowWidth - 12; // paddings izq/der de la celda
  const cols = Math.max(1, Math.floor(usableWidth / (colChars * mmPerChar(SERIAL_FONT_SIZE))));
  return { cols, colChars };
};

/**
 * Construye una o más filas (chunks) para insertar en el body de autoTable.
 * Cada chunk es un pequeño bloque de texto real (con "\n"), para que
 * autoTable calcule su alto y su paginación de forma nativa.
 */
export const buildSerialsRows = (
  serials: string[],
  colSpan: number,
  rowWidth: number,
  bgColor: [number, number, number] = CELL_BG
) => {
  if (serials.length === 0) return [];

  const { cols, colChars } = gridColumns(serials, rowWidth);
  const chunkSize = cols * ROWS_PER_CHUNK;

  const chunks: string[][] = [];
  for (let i = 0; i < serials.length; i += chunkSize) {
    chunks.push(serials.slice(i, i + chunkSize));
  }

  return chunks.map((chunkSerials, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === chunks.length - 1;

    const lines: string[] = [];
    if (isFirst) lines.push(`SERIALES (${serials.length})`);
    for (let i = 0; i < chunkSerials.length; i += cols) {
      lines.push(
        chunkSerials
          .slice(i, i + cols)
          .map((s) => s.padEnd(colChars))
          .join("")
          .trimEnd()
      );
    }

    return [
      {
        content: lines.join("\n"),
        colSpan,
        styles: {
          font: "courier" as const,
          fontStyle: "normal" as const,
          fontSize: SERIAL_FONT_SIZE,
          textColor: SERIAL_COLOR,
          fillColor: bgColor,
          halign: "left" as const,
          valign: "top" as const,
          // Los chunks intermedios llevan padding mínimo para que la
          // grilla se vea como un solo bloque continuo entre chunks.
          cellPadding: {
            top: isFirst ? 3 : 0.5,
            right: 4,
            bottom: isLast ? 3 : 0.5,
            left: 8,
          },
        },
      },
    ];
  });
};

/**
 * Agrega una línea horizontal bajo la última fila de un bloque de
 * producto (fila principal, descuento o el último chunk de seriales,
 * lo que corresponda) — separación entre productos sin cuadricular
 * columnas.
 *
 * No se usa alternancia de color de fondo por producto: el contraste
 * entre blanco y el gris casi-blanco del diseño (slate-50) es
 * demasiado sutil para leerse como una separación real, sobre todo en
 * capturas o pantallas comprimidas. La línea —más gruesa y de un tono
 * más oscuro que el resto de las reglas del documento— es la única
 * señal de límite entre productos, y es la misma para todos.
 */
const SEPARATOR: [number, number, number] = [148, 163, 184]; // slate-400

export const withBottomRule = (row: any[]) =>
  row.map((cell) => {
    const isCellObject = typeof cell === "object" && cell !== null;
    const base = isCellObject ? cell : { content: cell };
    return {
      ...base,
      styles: {
        ...(isCellObject ? base.styles : {}),
        lineWidth: { top: 0, right: 0, bottom: 0.5, left: 0 },
        lineColor: SEPARATOR,
      },
    };
  });

// ── Pie de página con numeración real (autoTable puede paginar) ──
export const drawPaginatedFooter = (
  doc: jsPDF,
  drawRule: (doc: jsPDF, y: number) => void,
  inkLight: [number, number, number],
  margin: number,
  pageW: number
) => {
  const totalPages = doc.getNumberOfPages();
  const generatedLabel = `Generado el ${new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })}`;

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    drawRule(doc, 283);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...inkLight);
    doc.text(generatedLabel, margin, 287);
    doc.text(`Página ${page} de ${totalPages}`, pageW - margin, 287, { align: "right" });
  }
};
