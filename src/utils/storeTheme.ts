export interface IStoreTheme {
  primary: string;
  primaryDark: string;
  primaryForeground: string;
  dark: string;
  darkLight: string;
  light: string;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const isValidHex = (hex: string) => /^#([0-9a-f]{6})$/i.test(hex);

export const hexToHsl = (hex: string): HSL => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

export const hslToHex = (h: number, s: number, l: number): string => {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;

  const k = (n: number) => (n + hue / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
};

const darken = (hex: string, amount: number) => {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, clamp(l - amount, 0, 100));
};

const pickForeground = (hex: string) => {
  const { l } = hexToHsl(hex);
  return l > 60 ? "#0b2e38" : "#ffffff";
};

/** Genera una paleta completa de la tienda a partir de un único color base. */
export const generateThemeFromBaseColor = (baseHex: string): IStoreTheme => {
  const { h, s } = hexToHsl(baseHex);

  const darkSaturation = clamp(s * 0.6, 25, 45);
  const lightHue = (h + 150) % 360;

  return {
    primary: baseHex,
    primaryDark: darken(baseHex, 12),
    primaryForeground: pickForeground(baseHex),
    dark: hslToHex(h, darkSaturation, 16),
    darkLight: hslToHex(h, darkSaturation, 24),
    light: hslToHex(lightHue, clamp(s, 50, 70), 55),
  };
};

export interface IStoreThemePreset {
  name: string;
  theme: IStoreTheme;
}

export const STORE_THEME_PRESETS: IStoreThemePreset[] = [
  {
    name: "Lima",
    theme: {
      primary: "#a0c82e",
      primaryDark: "#8db526",
      primaryForeground: "#0b2e38",
      dark: "#083744",
      darkLight: "#12586a",
      light: "#349ada",
    },
  },
  {
    name: "Coral",
    theme: {
      primary: "#ff6b4a",
      primaryDark: "#e5502f",
      primaryForeground: "#ffffff",
      dark: "#241b2f",
      darkLight: "#3a2a49",
      light: "#ffb84d",
    },
  },
  {
    name: "Océano",
    theme: {
      primary: "#17a2b8",
      primaryDark: "#128296",
      primaryForeground: "#ffffff",
      dark: "#0b2545",
      darkLight: "#16406b",
      light: "#fdbb5e",
    },
  },
  {
    name: "Berry",
    theme: {
      primary: "#e0457b",
      primaryDark: "#c22f63",
      primaryForeground: "#ffffff",
      dark: "#2b0b3f",
      darkLight: "#451a5c",
      light: "#ffc857",
    },
  },
  {
    name: "Bosque",
    theme: {
      primary: "#4c9a5b",
      primaryDark: "#3b7c48",
      primaryForeground: "#ffffff",
      dark: "#16281f",
      darkLight: "#223a2c",
      light: "#e8b93b",
    },
  },
  {
    name: "Medianoche",
    theme: {
      primary: "#6366f1",
      primaryDark: "#4f46e5",
      primaryForeground: "#ffffff",
      dark: "#0f172a",
      darkLight: "#1e293b",
      light: "#22d3ee",
    },
  },
];
