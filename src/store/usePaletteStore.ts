import { create } from 'zustand';
import { VisionType } from '@/utils/colorBlindEngine';
import { normalizeHex, isValidHex } from '@/utils/colorUtils';

export type ColorRole = 'primary' | 'secondary' | 'background' | 'text';

export const ROLE_LABEL: Record<ColorRole, string> = {
  primary: '主色',
  secondary: '辅色',
  background: '背景',
  text: '文字',
};

export const ROLE_ORDER: ColorRole[] = ['primary', 'secondary', 'background', 'text'];

const DEFAULT_COLORS: Record<ColorRole, string> = {
  primary:    '#6366F1',
  secondary:  '#F59E0B',
  background: '#FFFFFF',
  text:       '#1F2937',
};

const STORAGE_KEY = 'chromacheck-palette-v1';
const RECENT_COLORS_KEY = 'chromacheck-recent-colors-v1';
const MAX_RECENT_COLORS = 8;

interface StoredPalette {
  colors: Record<ColorRole, string>;
}

const loadFromStorage = (): Record<ColorRole, string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_COLORS;
    const data: StoredPalette = JSON.parse(raw);
    if (!data.colors) return DEFAULT_COLORS;
    return data.colors;
  } catch {
    return DEFAULT_COLORS;
  }
};

const persist = (colors: Record<ColorRole, string>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ colors }));
  } catch {
    void 0;
  }
};

const loadRecentColors = (): string[] => {
  try {
    const raw = localStorage.getItem(RECENT_COLORS_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter((c): c is string => typeof c === 'string' && isValidHex(c));
  } catch {
    return [];
  }
};

const persistRecentColors = (recentColors: string[]) => {
  try {
    localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(recentColors));
  } catch {
    void 0;
  }
};

interface PaletteState {
  colors: Record<ColorRole, string>;
  activeColorRole: ColorRole;
  currentVision: VisionType;
  recentColors: string[];
  setColor: (role: ColorRole, hex: string) => void;
  setActiveRole: (role: ColorRole) => void;
  setVision: (v: VisionType) => void;
  addRecentColor: (hex: string) => void;
  reset: () => void;
  randomize: () => void;
}

const PRESET_PAIRS: Array<Partial<Record<ColorRole, string>>> = [
  { primary: '#10B981', secondary: '#0EA5E9', background: '#F8FAFC', text: '#0F172A' },
  { primary: '#8B5CF6', secondary: '#EC4899', background: '#FAF5FF', text: '#2E1065' },
  { primary: '#EF4444', secondary: '#3B82F6', background: '#FFF7ED', text: '#1F2937' },
  { primary: '#0891B2', secondary: '#059669', background: '#F0FDFA', text: '#134E4A' },
  { primary: '#D97706', secondary: '#4B5563', background: '#FFFBEB', text: '#1F2937' },
];

export const usePaletteStore = create<PaletteState>((set, get) => ({
  colors: loadFromStorage(),
  activeColorRole: 'primary',
  currentVision: 'normal',
  recentColors: loadRecentColors(),

  addRecentColor: (hex) => {
    if (!isValidHex(hex)) return;
    const normalized = normalizeHex(hex);
    const current = get().recentColors;
    const filtered = current.filter((c) => normalizeHex(c) !== normalized);
    const next = [normalized, ...filtered].slice(0, MAX_RECENT_COLORS);
    persistRecentColors(next);
    set({ recentColors: next });
  },

  setColor: (role, hex) => {
    if (!isValidHex(hex)) return;
    const normalized = normalizeHex(hex);
    const next = { ...get().colors, [role]: normalized };
    persist(next);
    get().addRecentColor(normalized);
    set({ colors: next });
  },

  setActiveRole: (role) => set({ activeColorRole: role }),

  setVision: (v) => set({ currentVision: v }),

  reset: () => {
    persist(DEFAULT_COLORS);
    persistRecentColors([]);
    set({ colors: DEFAULT_COLORS, recentColors: [] });
  },

  randomize: () => {
    const pair = PRESET_PAIRS[Math.floor(Math.random() * PRESET_PAIRS.length)];
    const next = { ...get().colors, ...pair } as Record<ColorRole, string>;
    persist(next);
    Object.values(pair).forEach((hex) => {
      if (hex) get().addRecentColor(hex);
    });
    set({ colors: next });
  },
}));
