import React, { useMemo } from 'react';
import { Wand2, ArrowRight, ThumbsUp } from 'lucide-react';
import { usePaletteStore, ColorRole, ROLE_LABEL } from '@/store/usePaletteStore';
import { generateSuggestions, Suggestion } from '@/utils/suggestEngine';
import { formatRatio, wcagPass, getOverallLevel, levelColor } from '@/utils/contrastCalc';
import { ROLE_ORDER } from '@/store/usePaletteStore';

interface Props {
  role: ColorRole;
  against: ColorRole;
  suggestions: Suggestion[];
  onApply: (hex: string) => void;
  roleAccent: string;
}

const RoleSection: React.FC<Props> = ({ role, against, suggestions, onApply, roleAccent }) => {
  const { colors } = usePaletteStore();
  const current = colors[role];
  const againstHex = colors[against];

  return (
    <div className="border border-canvas-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border"
            style={{
              color: roleAccent,
              borderColor: roleAccent + '50',
              backgroundColor: roleAccent + '12',
            }}
          >
            {ROLE_LABEL[role]} 优化建议
          </span>
          <span className="text-[10px] text-stone-500 font-mono">
            对比于 {ROLE_LABEL[against]} {againstHex}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {suggestions.map((s, idx) => {
          const level = getOverallLevel(s.contrast);
          const levelC = levelColor(level);
          const currentContrast = formatRatio(wcagPass(current, againstHex).ratio);
          const improvedPct = s.contrast.ratio > wcagPass(current, againstHex).ratio
            ? `+${((s.contrast.ratio / wcagPass(current, againstHex).ratio - 1) * 100).toFixed(0)}%`
            : '';
          return (
            <div
              key={idx}
              className="group flex items-center gap-3 p-2 rounded-lg border border-canvas-100 hover:border-brand-300 hover:bg-brand-50/30 transition-all duration-150"
            >
              <div className="flex items-center gap-1 shrink-0">
                <div
                  className="w-8 h-8 rounded-md border border-canvas-200 shadow-sm flex items-center justify-center text-[9px] font-mono"
                  style={{ backgroundColor: current }}
                  title={`原 ${current}`}
                >
                  原
                </div>
                <ArrowRight size={12} className="text-stone-400" />
                <div
                  className="w-8 h-8 rounded-md border border-canvas-200 shadow-sm"
                  style={{ backgroundColor: s.hex }}
                  title={s.hex}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-stone-800">{s.hex}</span>
                  <span className="font-mono text-[11px] text-stone-500 line-through opacity-60">
                    {current} ({currentContrast})
                  </span>
                  {improvedPct && (
                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded">
                      {improvedPct}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="font-mono text-[11px] font-bold"
                    style={{ color: levelC }}
                  >
                    {formatRatio(s.contrast.ratio)}
                  </span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                    style={{ color: levelC, borderColor: levelC + '40', backgroundColor: levelC + '10' }}
                  >
                    {level}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    Δ {(s.distance).toFixed(0)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onApply(s.hex)}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-brand-500 hover:bg-brand-600 shadow-soft hover:-translate-y-0.5 transition-all"
              >
                <ThumbsUp size={12} /> 应用
              </button>
            </div>
          );
        })}
        {suggestions.length === 0 && (
          <div className="text-center py-3 text-xs text-stone-500">
            当前配色已达标，无需优化建议 ✨
          </div>
        )}
      </div>
    </div>
  );
};

const SuggestionList: React.FC = () => {
  const { colors, setColor } = usePaletteStore();

  const textOnBg = useMemo(
    () => generateSuggestions(colors.text, colors.background, { targetRatio: 4.5, count: 4 }),
    [colors.text, colors.background],
  );

  const textOnPrimary = useMemo(
    () => generateSuggestions(colors.text, colors.primary, { targetRatio: 4.5, count: 3 }),
    [colors.text, colors.primary],
  );

  const primaryOnBg = useMemo(
    () => generateSuggestions(colors.primary, colors.background, { targetRatio: 3, count: 4 }),
    [colors.primary, colors.background],
  );

  const secondaryOnBg = useMemo(
    () => generateSuggestions(colors.secondary, colors.background, { targetRatio: 3, count: 4 }),
    [colors.secondary, colors.background],
  );

  const rawSections: { role: ColorRole; against: ColorRole; list: Suggestion[]; accent: string }[] = [
    { role: 'text',       against: 'background', list: textOnBg,      accent: '#DC2626' },
    { role: 'primary',    against: 'background', list: primaryOnBg,   accent: '#6366F1' },
    { role: 'secondary',  against: 'background', list: secondaryOnBg, accent: '#F59E0B' },
    { role: 'text',       against: 'primary',    list: textOnPrimary, accent: '#0EA5E9' },
  ];

  const sections = rawSections.filter(s => s.list.some(x =>
    x.contrast.ratio > wcagPass(colors[s.role], colors[s.against]).ratio + 0.2
  ));

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-brand-700 bg-brand-50 border border-brand-200">
          <Wand2 size={16} />
        </span>
        <div>
          <h3 className="font-display font-semibold text-stone-800">智能替代建议</h3>
          <p className="text-[11px] text-stone-500">
            基于相似度优先算法，寻找相近但对比度更高的替代色
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {sections.length === 0 ? (
          <div className="col-span-full text-center py-8 rounded-xl bg-brand-50/50 border border-brand-200">
            <div className="font-display text-xl font-bold text-brand-700 mb-1">🎉 完美！</div>
            <p className="text-xs text-brand-600">
              当前所有颜色组合均已达到 WCAG 标准，没有需要优化的项
            </p>
          </div>
        ) : (
          sections.map((s, i) => (
            <RoleSection
              key={`${s.role}-${s.against}-${i}`}
              role={s.role}
              against={s.against}
              suggestions={s.list}
              onApply={(hex) => setColor(s.role, hex)}
              roleAccent={s.accent}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SuggestionList;
