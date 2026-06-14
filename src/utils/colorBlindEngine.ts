import { hexToRgb, rgbToHex, rgbToLms, lmsToRgb, clamp01, RGB, LMS } from './colorUtils';

export type VisionType =
  | 'normal'
  | 'protanopia' | 'protanomaly'
  | 'deuteranopia' | 'deuteranomaly'
  | 'tritanopia' | 'tritanomaly'
  | 'achromatopsia';

export const VISION_LABELS: Record<VisionType, { name: string; short: string; desc: string; prevalence: string }> = {
  normal:         { name: '正常视觉',   short: '正常',   desc: '标准色觉感知',                       prevalence: '~92% 人群' },
  protanopia:     { name: '红色盲',     short: '红色盲', desc: '无法感知红光，红绿色严重混淆',     prevalence: '男性 ~1.0%' },
  protanomaly:    { name: '红色弱',     short: '红色弱', desc: '红色感知减弱，红色饱和度降低',     prevalence: '男性 ~1.3%' },
  deuteranopia:   { name: '绿色盲',     short: '绿色盲', desc: '无法感知绿光，最常见红绿色盲',     prevalence: '男性 ~1.2%' },
  deuteranomaly:  { name: '绿色弱',     short: '绿色弱', desc: '绿色感知减弱，最常见色觉异常',     prevalence: '男性 ~5.0%' },
  tritanopia:     { name: '蓝色盲',     short: '蓝色盲', desc: '无法感知蓝光，黄绿与蓝紫混淆',     prevalence: '< 0.01%' },
  tritanomaly:    { name: '蓝色弱',     short: '蓝色弱', desc: '蓝色感知减弱，黄蓝区分度下降',     prevalence: '< 0.01%' },
  achromatopsia:  { name: '全色盲',     short: '全色盲', desc: '完全丧失色彩感知，只有灰度',       prevalence: '~0.003%' },
};

export const VISION_ORDER: VisionType[] = [
  'normal',
  'deuteranomaly', 'deuteranopia',
  'protanomaly', 'protanopia',
  'tritanomaly', 'tritanopia',
  'achromatopsia',
];

type LmsMatrix = [[number, number, number], [number, number, number], [number, number, number]];

const MATRICES: Record<Exclude<VisionType, 'normal'>, LmsMatrix> = {
  protanopia: [
    [0.0,      1.05118294, -0.05116099],
    [0.0,      1.0,        0.0],
    [0.0,      0.0,        1.0],
  ],
  protanomaly: [
    [0.46533,  0.71255,    -0.17788],
    [0.12345,  0.86578,     0.01077],
    [0.0,      0.0,         1.0],
  ],
  deuteranopia: [
    [1.0,      0.0,        0.0],
    [0.9513092,0.0,        0.04866992],
    [0.0,      0.0,        1.0],
  ],
  deuteranomaly: [
    [0.73478,  0.26522,    0.0],
    [0.22683,  0.73136,    0.04181],
    [0.0,      0.0,        1.0],
  ],
  tritanopia: [
    [1.0,      0.0,        0.0],
    [0.0,      1.0,        0.0],
    [-0.395913,0.801109,   0.0],
  ],
  tritanomaly: [
    [1.0,      0.0,        0.0],
    [0.0,      0.89528,    0.10472],
    [0.0,      0.06896,    0.93104],
  ],
  achromatopsia: [
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0],
  ],
};

const applyMatrix = (lms: LMS, m: LmsMatrix): LMS => ({
  l: m[0][0] * lms.l + m[0][1] * lms.m + m[0][2] * lms.s,
  m: m[1][0] * lms.l + m[1][1] * lms.m + m[1][2] * lms.s,
  s: m[2][0] * lms.l + m[2][1] * lms.m + m[2][2] * lms.s,
});

export const simulateColor = (hex: string, vision: VisionType): string => {
  if (vision === 'normal') return hex;
  if (vision === 'achromatopsia') {
    const { r, g, b } = hexToRgb(hex);
    const gray = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    return rgbToHex({ r: gray, g: gray, b: gray });
  }
  const mat = MATRICES[vision];
  const lms = rgbToLms(hexToRgb(hex));
  const transformed = applyMatrix(lms, mat);
  return rgbToHex(lmsToRgb(transformed));
};

export const simulateRgb = (rgb: RGB, vision: VisionType): RGB => {
  if (vision === 'normal') return rgb;
  if (vision === 'achromatopsia') {
    const gray = Math.round(0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b);
    return { r: gray, g: gray, b: gray };
  }
  const mat = MATRICES[vision];
  const lms = rgbToLms(rgb);
  const transformed = applyMatrix(lms, mat);
  return lmsToRgb(transformed);
};

export const rgbToCssString = (rgb: RGB, alpha = 1): string => {
  const a = clamp01(alpha);
  return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${a})`;
};

export const hexToCss = (hex: string, alpha = 1): string => {
  const rgb = hexToRgb(hex);
  return rgbToCssString(rgb, alpha);
};
