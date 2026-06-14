import React from 'react';
import { Palette } from 'lucide-react';
import { usePaletteStore } from '@/store/usePaletteStore';
import { normalizeHex } from '@/utils/colorUtils';

const PRESET_COLORS: string[] = [
  '#10B981', '#34D399', '#059669', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
  '#F43F5E', '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#1F2937', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6',
];

const HARMONY_PRESETS: Array<{ name: string; p: string; s: string; b: string; t: string }> = [
  { name: '翡翠冷静', p: '#10B981', s: '#0EA5E9', b: '#FFFFFF', t: '#111827' },
  { name: '落日橙金', p: '#F97316', s: '#6366F1', b: '#FFFBEB', t: '#1F2937' },
  { name: '深夜靛蓝', p: '#6366F1', s: '#EC4899', b: '#0F172A', t: '#F8FAFC' },
  { name: '薄荷奶昔', p: '#06B6D4', s: '#F59E0B', b: '#ECFEFF', t: '#164E63' },
  { name: '玫瑰复古', p: '#F43F5E', s: '#8B5CF6', b: '#FFF1F2', t: '#4C0519' },
  { name: '森林墨绿', p: '#059669', s: '#DC2626', b: '#064E3B', t: '#ECFDF5' },
];

const PaletteGrid: React.FC = () => {
  const { colors, activeColorRole, setColor } = usePaletteStore();

  const currentHex = colors[activeColorRole];
  const applyPalette = (preset: typeof HARMONY_PRESETS[number]) => {
    setColor('primary', preset.p);
    setColor('secondary', preset.s);
    setColor('background', preset.b);
    setColor('text', preset.t);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            <Palette size={12} className="inline -mt-0.5 mr-1" />
            快速选色
          </span>
          <span className="text-[11px] text-stone-400 font-mono">
            作用于：<span className="text-brand-600 font-semibold">{activeColorRole}</span>
          </span>
        </div>
        <div className="grid grid-cols-8 md:grid-cols-12 gap-1.5">
          {PRESET_COLORS.map((c) => {
            const isActive = normalizeHex(currentHex).toUpperCase() === c.toUpperCase();
            return (
              <button
                key={c}
                type="button"
                onClick={() => setColor(activeColorRole, c)}
                className={`aspect-square rounded-lg transition-all duration-150 hover:scale-110 hover:shadow-md relative ${
                  isActive ? 'ring-2 ring-brand-500 ring-offset-2 scale-105' : ''
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            预设方案
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {HARMONY_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPalette(p)}
              className="group relative rounded-xl border border-canvas-200 p-2 hover:border-brand-300 hover:shadow-soft transition-all duration-150 text-left"
            >
              <div className="flex h-9 rounded-md overflow-hidden mb-2">
                <div style={{ backgroundColor: p.p }} className="flex-1" />
                <div style={{ backgroundColor: p.s }} className="flex-1" />
                <div style={{ backgroundColor: p.b, borderLeft: '1px solid #e7e5e4', borderRight: '1px solid #e7e5e4' }} className="flex-1" />
                <div style={{ backgroundColor: p.t }} className="flex-1" />
              </div>
              <div className="text-xs font-medium text-stone-700 group-hover:text-brand-700 transition-colors">
                {p.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaletteGrid;
