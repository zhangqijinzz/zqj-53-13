import { hexToRgb, RGB } from './colorUtils';

export const relativeLuminance = ({ r, g, b }: RGB): number => {
  const toLinear = (c: number) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
};

export const contrastRatio = (hex1: string, hex2: string): number => {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
};

export const formatRatio = (ratio: number): string => {
  return `${ratio.toFixed(2)}:1`;
};

export type WcagLevel = 'AAA' | 'AA' | 'Fail';

export interface WcagResult {
  ratio: number;
  normalAA: boolean;
  normalAAA: boolean;
  largeAA: boolean;
  largeAAA: boolean;
  uiComponentAA: boolean;
}

export const wcagPass = (hexForeground: string, hexBackground: string): WcagResult => {
  const ratio = contrastRatio(hexForeground, hexBackground);
  return {
    ratio,
    normalAA: ratio >= 4.5,
    normalAAA: ratio >= 7,
    largeAA: ratio >= 3,
    largeAAA: ratio >= 4.5,
    uiComponentAA: ratio >= 3,
  };
};

export const getOverallLevel = (r: WcagResult): WcagLevel => {
  if (r.normalAAA && r.largeAAA) return 'AAA';
  if (r.normalAA && r.largeAA) return 'AA';
  return 'Fail';
};

export const levelColor = (level: WcagLevel): string => {
  if (level === 'AAA') return '#059669';
  if (level === 'AA')  return '#10B981';
  return '#DC2626';
};

export const levelBadge = (level: WcagLevel): string => {
  if (level === 'AAA') return 'AAA';
  if (level === 'AA')  return 'AA';
  return 'FAIL';
};

export interface PaletteContrastReport {
  textOnBg: WcagResult;
  primaryOnBg: WcagResult;
  secondaryOnBg: WcagResult;
  textOnPrimary: WcagResult;
  textOnSecondary: WcagResult;
  primarySecondary: WcagResult;
  overallScore: number;
}

export const evaluatePalette = (
  primary: string,
  secondary: string,
  background: string,
  text: string,
): PaletteContrastReport => {
  const textOnBg = wcagPass(text, background);
  const primaryOnBg = wcagPass(primary, background);
  const secondaryOnBg = wcagPass(secondary, background);
  const textOnPrimary = wcagPass(text, primary);
  const textOnSecondary = wcagPass(text, secondary);
  const primarySecondary = wcagPass(primary, secondary);

  const weighted =
    textOnBg.ratio           * 0.28 +
    textOnPrimary.ratio      * 0.22 +
    textOnSecondary.ratio    * 0.18 +
    primaryOnBg.ratio        * 0.12 +
    secondaryOnBg.ratio      * 0.10 +
    primarySecondary.ratio   * 0.10;

  const maxRatio = 21;
  const score = Math.min(100, (weighted / 9) * 100);

  return {
    textOnBg, primaryOnBg, secondaryOnBg,
    textOnPrimary, textOnSecondary, primarySecondary,
    overallScore: Math.round(score * 10) / 10,
    _maxRatio: maxRatio as any,
  } as PaletteContrastReport;
};
