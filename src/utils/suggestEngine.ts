import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, adjustLightness, adjustSaturation, adjustHue, colorDistanceCIE76 } from './colorUtils';
import { wcagPass, WcagResult, contrastRatio } from './contrastCalc';

export interface Suggestion {
  hex: string;
  distance: number;
  contrast: WcagResult;
  againstHex: string;
}

const exploreNeighborhood = (
  baseHex: string,
  againstHex: string,
  steps: number,
  count: number
): Suggestion[] => {
  const results: Suggestion[] = [];
  const baseHsl = rgbToHsl(hexToRgb(baseHex));
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random();
    const dHue = Math.cos(angle) * r * 35 * (steps / 3);
    const dSat = (Math.random() - 0.5) * 20 * steps;
    const dLight = Math.sin(angle) * r * 35 * (steps / 3);
    const hsl = {
      h: (baseHsl.h + dHue + 360) % 360,
      s: Math.max(0, Math.min(100, baseHsl.s + dSat)),
      l: Math.max(0, Math.min(100, baseHsl.l + dLight)),
    };
    const hex = rgbToHex(hslToRgb(hsl));
    if (seen.has(hex)) continue;
    seen.add(hex);
    const contrast = wcagPass(hex, againstHex);
    results.push({
      hex,
      againstHex,
      contrast,
      distance: colorDistanceCIE76(baseHex, hex),
    });
  }

  const gridLight = [-18, -12, -8, -6, -4, 4, 6, 8, 12, 18];
  const gridSat = [-10, -5, 5, 10];
  for (const dl of gridLight) {
    for (const ds of gridSat) {
      const hex = adjustSaturation(adjustLightness(baseHex, dl), ds);
      if (seen.has(hex)) continue;
      seen.add(hex);
      results.push({
        hex, againstHex,
        contrast: wcagPass(hex, againstHex),
        distance: colorDistanceCIE76(baseHex, hex),
      });
    }
  }

  return results;
};

const lightnessPush = (baseHex: string, againstHex: string, targetMinRatio = 4.5): string | null => {
  const baseHsl = rgbToHsl(hexToRgb(baseHex));
  const againstL = rgbToHsl(hexToRgb(againstHex)).l;
  const goDarker = baseHsl.l > againstL;

  for (let i = 1; i <= 60; i++) {
    const delta = (goDarker ? -1 : 1) * i;
    const newL = Math.max(0, Math.min(100, baseHsl.l + delta));
    const hex = rgbToHex(hslToRgb({ ...baseHsl, l: newL }));
    if (contrastRatio(hex, againstHex) >= targetMinRatio) {
      return hex;
    }
  }
  return null;
};

export const generateSuggestions = (
  baseHex: string,
  againstHex: string,
  options: { targetRatio?: number; count?: number } = {}
): Suggestion[] => {
  const { targetRatio = 4.5, count = 5 } = options;
  const baseResult = wcagPass(baseHex, againstHex);
  const baseIsFailing = baseResult.ratio < targetRatio;

  const all: Suggestion[] = [];
  all.push(...exploreNeighborhood(baseHex, againstHex, 1, 24));
  all.push(...exploreNeighborhood(baseHex, againstHex, 2, 18));
  all.push(...exploreNeighborhood(baseHex, againstHex, 3, 12));

  const pushed = lightnessPush(baseHex, againstHex, targetRatio);
  if (pushed) {
    all.push({
      hex: pushed, againstHex,
      contrast: wcagPass(pushed, againstHex),
      distance: colorDistanceCIE76(baseHex, pushed),
    });
  }

  const final = all
    .map(s => ({
      ...s,
      score: (baseIsFailing
        ? (s.contrast.ratio >= targetRatio ? 0 : (targetRatio - s.contrast.ratio) * 120)
        : (s.contrast.ratio >= targetRatio ? 0 : 80))
        + s.distance * 1.1,
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, count * 4);

  const uniq: Suggestion[] = [];
  const set = new Set<string>([baseHex]);
  for (const s of final) {
    if (set.has(s.hex)) continue;
    set.add(s.hex);
    uniq.push(s);
    if (uniq.length >= count) break;
  }
  return uniq;
};

export const generateTextBgSuggestions = (
  background: string,
  currentText: string
): Suggestion[] => {
  return generateSuggestions(currentText, background, { targetRatio: 4.5, count: 5 });
};

export const generatePrimarySuggestions = (
  primary: string,
  background: string,
  text: string
): Suggestion[] => {
  const a = generateSuggestions(primary, background, { targetRatio: 3, count: 4 });
  const b = generateSuggestions(primary, text, { targetRatio: 4.5, count: 4 });
  const combined = [...a, ...b]
    .sort((x, y) => x.distance - y.distance);
  const seen = new Set<string>();
  const result: Suggestion[] = [];
  for (const s of combined) {
    if (seen.has(s.hex)) continue;
    seen.add(s.hex);
    result.push(s);
    if (result.length >= 5) break;
  }
  return result.map(s => ({
    ...s,
    contrast: wcagPass(s.hex, background),
    againstHex: background,
  }));
};
