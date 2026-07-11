interface BuildSerialRangeParams {
  prefix: string;
  start: number;
  end: number;
  padding: number;
  suffix: string;
}

export const buildSerialRange = ({
  prefix,
  start,
  end,
  padding,
  suffix,
}: BuildSerialRangeParams): string[] => {
  if (start > end) return [];

  const result: string[] = [];
  for (let i = start; i <= end; i++) {
    const num = padding > 0 ? String(i).padStart(padding, "0") : String(i);
    result.push(`${prefix}${num}${suffix}`);
  }
  return result;
};