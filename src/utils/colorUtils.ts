export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };
export type LMS = { l: number; m: number; s: number };

export const clamp = (v: number, min = 0, max = 255): number =>
  Math.max(min, Math.min(max, v));

export const clamp01 = (v: number): number =>
  Math.max(0, Math.min(1, v));

export const isValidHex = (hex: string): boolean =>
  /^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(hex.trim());

export const normalizeHex = (hex: string): string => {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) {
    h = h.split('').map(c => c + c).join('');
  }
  return '#' + h.toUpperCase();
};

export const hexToRgb = (hex: string): RGB => {
  const normalized = normalizeHex(hex).replace('#', '');
  return {
    r: parseInt(normalized.substring(0, 2), 16),
    g: parseInt(normalized.substring(2, 4), 16),
    b: parseInt(normalized.substring(4, 6), 16),
  };
};

export const rgbToHex = ({ r, g, b }: RGB): string => {
  const toHex = (n: number) =>
    Math.round(clamp(n)).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const rgbToHsl = ({ r, g, b }: RGB): HSL => {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rr: h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6; break;
      case gg: h = ((bb - rr) / d + 2) / 6; break;
      case bb: h = ((rr - gg) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hue2rgb = (p: number, q: number, t: number): number => {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
};

export const hslToRgb = ({ h, s, l }: HSL): RGB => {
  const hh = (h % 360) / 360;
  const ss = clamp01(s / 100);
  const ll = clamp01(l / 100);

  if (ss === 0) {
    const v = Math.round(ll * 255);
    return { r: v, g: v, b: v };
  }
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  return {
    r: Math.round(hue2rgb(p, q, hh + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hh) * 255),
    b: Math.round(hue2rgb(p, q, hh - 1 / 3) * 255),
  };
};

export const rgbToLms = ({ r, g, b }: RGB): LMS => {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  return {
    l: 0.31399022 * rr + 0.63951294 * gg + 0.04649755 * bb,
    m: 0.15537241 * rr + 0.75789446 * gg + 0.08670142 * bb,
    s: 0.01775239 * rr + 0.10944209 * gg + 0.87256922 * bb,
  };
};

export const lmsToRgb = ({ l, m, s }: LMS): RGB => {
  const r =  5.47221206 * l - 4.6419601  * m + 0.16963708 * s;
  const g = -1.1252419  * l + 2.29317094 * m - 0.1678952  * s;
  const b =  0.02980165 * l - 0.19318073 * m + 1.16364789 * s;
  return {
    r: Math.round(clamp(r * 255)),
    g: Math.round(clamp(g * 255)),
    b: Math.round(clamp(b * 255)),
  };
};

export const colorDistanceCIE76 = (hex1: string, hex2: string): number => {
  const a = hexToRgb(hex1);
  const b = hexToRgb(hex2);
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) +
    Math.pow(a.g - b.g, 2) +
    Math.pow(a.b - b.b, 2)
  );
};

export const adjustLightness = (hex: string, delta: number): string => {
  const hsl = rgbToHsl(hexToRgb(hex));
  hsl.l = clamp(hsl.l + delta, 0, 100);
  return rgbToHex(hslToRgb(hsl));
};

export const adjustSaturation = (hex: string, delta: number): string => {
  const hsl = rgbToHsl(hexToRgb(hex));
  hsl.s = clamp(hsl.s + delta, 0, 100);
  return rgbToHex(hslToRgb(hsl));
};

export const adjustHue = (hex: string, delta: number): string => {
  const hsl = rgbToHsl(hexToRgb(hex));
  hsl.h = (hsl.h + delta + 360) % 360;
  return rgbToHex(hslToRgb(hsl));
};

export const mixColors = (hex1: string, hex2: string, t: number): string => {
  const a = hexToRgb(hex1);
  const b = hexToRgb(hex2);
  const tt = clamp01(t);
  return rgbToHex({
    r: a.r + (b.r - a.r) * tt,
    g: a.g + (b.g - a.g) * tt,
    b: a.b + (b.b - a.b) * tt,
  });
};
