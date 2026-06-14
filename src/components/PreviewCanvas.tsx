import React, { useMemo } from 'react';
import { usePaletteStore } from '@/store/usePaletteStore';
import { hexToRgb } from '@/utils/colorUtils';
import { simulateRgb } from '@/utils/colorBlindEngine';

const css = (hex: string, vision: any, alpha = 1) => {
  const rgb = simulateRgb(hexToRgb(hex), vision);
  return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${alpha})`;
};

const PreviewCanvas: React.FC = () => {
  const { colors, currentVision } = usePaletteStore();
  const vision = currentVision;

  const bg = css(colors.background, vision, 1);
  const txt = css(colors.text, vision, 1);
  const pri = css(colors.primary, vision, 1);
  const sec = css(colors.secondary, vision, 1);
  const pri2 = css(colors.primary, vision, 0.12);
  const sec2 = css(colors.secondary, vision, 0.1);
  const txt2 = css(colors.text, vision, 0.6);
  const txt3 = css(colors.text, vision, 0.35);

  const chartBars = useMemo(() => {
    return [
      { val: 68, color: pri },
      { val: 82, color: sec },
      { val: 54, color: pri },
      { val: 91, color: sec },
      { val: 45, color: pri },
      { val: 73, color: sec },
      { val: 60, color: pri },
    ];
  }, [pri, sec]);

  return (
    <div
      className="rounded-2xl overflow-hidden border border-canvas-200 shadow-soft"
      style={{ backgroundColor: bg, color: txt }}
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-5 min-h-[420px]">
        <div className="md:col-span-2 rounded-xl overflow-hidden relative" style={{ backgroundColor: pri }}>
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="text-[10px] font-mono px-2 py-1 rounded-md"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              POSTER
            </span>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-white opacity-50" />
              <div className="w-2 h-2 rounded-full bg-white opacity-30" />
            </div>
          </div>
          <div className="flex flex-col justify-end p-5 h-full" style={{ color: css('#FFFFFF', vision, 1) }}>
            <div className="mb-2 h-2 w-16 rounded-full" style={{ backgroundColor: sec }} />
            <h3 className="font-display font-bold text-3xl leading-tight mb-2">
              色彩让设计
              <br />
              被每一个人看见
            </h3>
            <p className="text-sm opacity-90 max-w-[85%]">
              好的设计让信息清晰传递，无障碍设计让信息被所有人理解。
            </p>
            <div className="mt-5 flex gap-2">
              <div
                className="px-3 py-2 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: css('#FFFFFF', vision, 1), color: pri }}
              >
                立即体验
              </div>
              <div
                className="px-3 py-2 rounded-lg text-sm font-semibold border"
                style={{ borderColor: 'rgba(255,255,255,0.4)', color: css('#FFFFFF', vision, 1) }}
              >
                了解更多
              </div>
            </div>
          </div>
          <div
            className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-30 blur-2xl"
            style={{ backgroundColor: sec }}
          />
        </div>

        <div className="md:col-span-3 grid grid-rows-2 gap-4">
          <div className="rounded-xl p-4 relative" style={{ backgroundColor: bg, border: `1px solid ${txt3}` }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-1 rounded-md" style={{ backgroundColor: pri2, color: pri }}>
                  CARD
                </span>
                <h4 className="font-display font-semibold text-lg mt-2" style={{ color: txt }}>
                  产品设计年度大会
                </h4>
                <p className="text-xs mt-0.5" style={{ color: txt2 }}>
                  2026 · 上海国际会议中心 · 10 月 18-20 日
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-display font-bold"
                style={{ backgroundColor: pri, color: css('#FFFFFF', vision, 1) }}
              >
                D
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px dashed ${txt3}` }}>
              <div className="flex gap-1.5">
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: pri2, color: pri }}>设计</span>
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: sec2, color: sec }}>无障碍</span>
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: bg, border: `1px solid ${txt3}`, color: txt2 }}>￥399</span>
              </div>
              <button
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: sec, color: css('#FFFFFF', vision, 1) }}
              >
                报名参加 →
              </button>
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ backgroundColor: bg, border: `1px solid ${txt3}` }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono px-2 py-1 rounded-md" style={{ backgroundColor: sec2, color: sec }}>
                  CHART
                </span>
                <h4 className="font-display font-semibold text-base mt-2">月度设计迭代指标</h4>
              </div>
              <div className="flex items-center gap-3 text-[10px]" style={{ color: txt2 }}>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: pri }} />主色
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: sec }} />辅色
                </span>
              </div>
            </div>
            <div className="flex items-end gap-3 h-24">
              {chartBars.map((b, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-md transition-all duration-500"
                    style={{ height: `${b.val}%`, backgroundColor: b.color }}
                  />
                  <span className="text-[9px] font-mono" style={{ color: txt3 }}>
                    {['1月','2月','3月','4月','5月','6月','7月'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div
        className="px-5 py-2 text-[10px] font-mono flex items-center justify-between"
        style={{ backgroundColor: txt3, color: txt }}
      >
        <span>MODE: {String(vision).toUpperCase()}</span>
        <span className="opacity-70">
          bg: {colors.background} · text: {colors.text} · p: {colors.primary} · s: {colors.secondary}
        </span>
      </div>
    </div>
  );
};

export default PreviewCanvas;
