export const parseSerialsInput = (rawText: string): string[] => {
  const splitted = rawText
    .split(/[\n,;\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return Array.from(new Set(splitted));
};