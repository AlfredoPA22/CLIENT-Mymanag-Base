const fmt = (d: Date, includeYear: boolean) =>
  d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    ...(includeYear ? { year: "numeric" } : {}),
  });

export const formatDateRange = (start: Date, end: Date): string => {
  const sameYear = start.getFullYear() === end.getFullYear();
  return sameYear
    ? `${fmt(start, false)} – ${fmt(end, true)}`
    : `${fmt(start, true)} – ${fmt(end, true)}`;
};
