import { useEffect, useRef, useState } from "react";
import { Calendar } from "primereact/calendar";
import { formatDateRange } from "../../utils/dateUtils";

interface DateRangePickerProps {
  value: [Date, Date];
  onChange: (range: [Date, Date]) => void;
}

const getShortcuts = (): { label: string; range: [Date, Date] }[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const dow = todayStart.getDay();
  const diffToMonday = dow === 0 ? -6 : 1 - dow;

  const startOfWeek = new Date(todayStart);
  startOfWeek.setDate(todayStart.getDate() + diffToMonday);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfWeek.getDate() - 7);
  const endOfLastWeek = new Date(startOfWeek);
  endOfLastWeek.setDate(startOfWeek.getDate() - 1);
  endOfLastWeek.setHours(23, 59, 59, 999);

  const last7Start = new Date(todayStart);
  last7Start.setDate(todayStart.getDate() - 6);

  const last30Start = new Date(todayStart);
  last30Start.setDate(todayStart.getDate() - 29);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

  return [
    { label: "Esta semana",     range: [startOfWeek, endOfWeek] },
    { label: "Semana pasada",   range: [startOfLastWeek, endOfLastWeek] },
    { label: "Últimos 7 días",  range: [last7Start, today] },
    { label: "Últimos 30 días", range: [last30Start, today] },
    { label: "Mes actual",      range: [startOfMonth, endOfMonth] },
    { label: "Mes anterior",    range: [startOfLastMonth, endOfLastMonth] },
    { label: "Este año",        range: [startOfYear, endOfYear] },
  ];
};

const fmtHeader = (d: Date | null) =>
  d
    ? d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const DateRangePicker = ({ value, onChange }: DateRangePickerProps) => {
  const [visible, setVisible] = useState(false);
  const [temp, setTemp] = useState<(Date | null)[]>([value[0], value[1]]);
  const shortcuts = getShortcuts();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) setTemp([value[0], value[1]]);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setVisible(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible]);

  const handleApply = () => {
    if (temp[0] && temp[1]) {
      onChange([temp[0], temp[1]]);
      setVisible(false);
    }
  };

  const isComplete = Boolean(temp[0] && temp[1]);

  const shortcutPill = (label: string, range: [Date, Date]) => {
    const active =
      temp[0]?.getTime() === range[0].getTime() &&
      temp[1]?.getTime() === range[1].getTime();
    return (
      <button
        key={label}
        onClick={() => setTemp([range[0], range[1]])}
        className={`whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
          active
            ? "bg-[#A0C82E]/15 text-[#7a9c22] ring-1 ring-[#A0C82E]/40"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
      >
        {label}
      </button>
    );
  };

  const shortcutRow = (label: string, range: [Date, Date]) => {
    const active =
      temp[0]?.getTime() === range[0].getTime() &&
      temp[1]?.getTime() === range[1].getTime();
    return (
      <button
        key={label}
        onClick={() => setTemp([range[0], range[1]])}
        className={`text-sm text-left px-3 py-2 rounded-lg font-medium transition-colors ${
          active
            ? "bg-[#A0C82E]/15 text-[#7a9c22]"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setVisible(true)}
        className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:border-[#A0C82E] hover:shadow transition-all duration-150 cursor-pointer"
      >
        <i className="pi pi-calendar text-slate-400 text-sm" />
        <span className="text-sm font-medium text-slate-500 hidden sm:inline">Período:</span>
        <span className="text-sm font-semibold text-slate-700">
          {formatDateRange(value[0], value[1])}
        </span>
        <i className="pi pi-chevron-down text-slate-400 text-xs ml-1" />
      </button>

      {/* Backdrop + Modal */}
      {visible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setVisible(false); }}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl flex flex-col w-full sm:w-auto"
            style={{ maxHeight: "90vh" }}
          >
            {/* Header */}
            <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">
                Seleccionar período
              </p>
              <p className="text-lg font-bold text-slate-800 leading-tight">
                {fmtHeader(temp[0] as Date | null)}{" "}
                <span className="text-slate-400 font-normal">–</span>{" "}
                {fmtHeader(temp[1] as Date | null)}
              </p>
            </div>

            {/* ── MÓVIL: shortcuts como pills arriba del calendario ── */}
            <div className="flex sm:hidden flex-wrap gap-1.5 px-4 py-3 border-b border-gray-100 flex-shrink-0">
              {shortcuts.map(({ label, range }) => shortcutPill(label, range))}
            </div>

            {/* ── MÓVIL: calendario centrado ── */}
            <div className="flex sm:hidden justify-center overflow-auto">
              <Calendar
                inline
                selectionMode="range"
                value={temp as Date[]}
                onChange={(e) => setTemp(e.value as (Date | null)[])}
                dateFormat="dd/mm/yy"
              />
            </div>

            {/* ── ESCRITORIO: calendario izq + shortcuts der ── */}
            <div className="hidden sm:flex">
              <Calendar
                inline
                selectionMode="range"
                value={temp as Date[]}
                onChange={(e) => setTemp(e.value as (Date | null)[])}
                dateFormat="dd/mm/yy"
              />
              <div className="flex flex-col gap-0.5 px-3 py-3 border-l border-gray-100 min-w-[155px] justify-center">
                {shortcuts.map(({ label, range }) => shortcutRow(label, range))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => setTemp([null, null])}
                className="text-sm text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={() => setVisible(false)}
                className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleApply}
                disabled={!isComplete}
                className="text-sm font-semibold px-5 py-1.5 rounded-lg bg-[#A0C82E] text-white hover:bg-[#8fb028] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DateRangePicker;
