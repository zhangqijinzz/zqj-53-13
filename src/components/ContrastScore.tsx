import React, { useMemo } from 'react';
import { CheckCircle2, XCircle, Award, FileText, Sparkles, Scale } from 'lucide-react';
import { usePaletteStore } from '@/store/usePaletteStore';
import { evaluatePalette, getOverallLevel, levelColor, levelBadge, formatRatio, WcagResult } from '@/utils/contrastCalc';

const Badge: React.FC<{ pass: boolean; label: string }> = ({ pass, label }) => (
  <span
    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-colors ${
      pass
        ? 'bg-brand-50 text-brand-700 border-brand-200'
        : 'bg-red-50 text-red-700 border-red-200'
    }`}
  >
    {pass ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
    {label}
  </span>
);

const ContrastRow: React.FC<{ label: string; fg: string; bg: string; r: WcagResult; icon?: React.ReactNode }> = ({
  label, fg, bg, r, icon,
}) => {
  const level = getOverallLevel(r);
  return (
    <div className="flex items-center gap-3 py-2 border-b last:border-0 border-canvas-100">
      <div className="flex w-28 shrink-0 items-center gap-1.5">
        {icon && <span className="text-stone-500">{icon}</span>}
        <span className="text-[11px] font-medium text-stone-700">{label}</span>
      </div>
      <div className="flex gap-0.5 shrink-0">
        <div
          className="w-6 h-6 rounded-md border border-canvas-200 shadow-sm flex items-center justify-center text-[8px] font-mono"
          style={{ backgroundColor: bg, color: fg }}
          title={`bg:${bg}`}
        >
          Aa
        </div>
        <div
          className="w-6 h-6 rounded-md border border-canvas-200 -ml-1 shadow-sm"
          style={{ backgroundColor: fg }}
          title={`fg:${fg}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-sm font-mono font-bold tracking-tight"
            style={{ color: levelColor(level) }}
          >
            {formatRatio(r.ratio)}
          </span>
          <Badge pass={r.normalAA} label="AA" />
          <Badge pass={r.normalAAA} label="AAA" />
        </div>
        <div className="mt-1 h-1.5 bg-canvas-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (r.ratio / 10) * 100)}%`,
              backgroundColor: levelColor(level),
            }}
          />
        </div>
      </div>
      <span
        className="shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border"
        style={{
          color: levelColor(level),
          borderColor: levelColor(level) + '40',
          backgroundColor: levelColor(level) + '10',
        }}
      >
        {levelBadge(level)}
      </span>
    </div>
  );
};

const CircularScore: React.FC<{ score: number; label: string }> = ({ score, label }) => {
  const r = 42;
  const C = 2 * Math.PI * r;
  const offset = C - (score / 100) * C;
  const color = score >= 85 ? '#059669' : score >= 70 ? '#10B981' : score >= 50 ? '#F59E0B' : '#DC2626';
  const rating = score >= 90 ? '优秀' : score >= 75 ? '良好' : score >= 55 ? '一般' : '需优化';
  return (
    <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
      <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
        <circle cx="64" cy="64" r={r} stroke="#F5F5F4" strokeWidth="8" fill="none" />
        <circle
          cx="64" cy="64" r={r}
          stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={C} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display font-bold text-3xl" style={{ color }}>
          {score.toFixed(0)}
        </div>
        <div className="text-[10px] font-semibold text-stone-500 mt-0.5 uppercase tracking-wider">
          {rating} · {label}
        </div>
      </div>
    </div>
  );
};

const ContrastScore: React.FC = () => {
  const { colors } = usePaletteStore();
  const report = useMemo(
    () => evaluatePalette(colors.primary, colors.secondary, colors.background, colors.text),
    [colors],
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <CircularScore score={report.overallScore} label="综合分" />
        <div className="flex-1 w-full">
          <ContrastRow label="文字 vs 背景" icon={<FileText size={12} />}
            fg={colors.text} bg={colors.background} r={report.textOnBg} />
          <ContrastRow label="文字 vs 主色" icon={<Sparkles size={12} />}
            fg={colors.text} bg={colors.primary} r={report.textOnPrimary} />
          <ContrastRow label="文字 vs 辅色" icon={<Award size={12} />}
            fg={colors.text} bg={colors.secondary} r={report.textOnSecondary} />
          <ContrastRow label="主色 vs 背景" icon={<Scale size={12} />}
            fg={colors.primary} bg={colors.background} r={report.primaryOnBg} />
          <ContrastRow label="辅色 vs 背景" icon={<Scale size={12} />}
            fg={colors.secondary} bg={colors.background} r={report.secondaryOnBg} />
          <ContrastRow label="主色 vs 辅色" icon={<Scale size={12} />}
            fg={colors.primary} bg={colors.secondary} r={report.primarySecondary} />
        </div>
      </div>
    </div>
  );
};

export default ContrastScore;
