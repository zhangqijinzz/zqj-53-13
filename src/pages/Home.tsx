import { useState } from 'react';
import { Rainbow, Shuffle, RotateCcw, Copy, Check, Heart, Github } from 'lucide-react';
import SectionCard from '@/components/SectionCard';
import ColorInput from '@/components/ColorInput';
import PaletteGrid from '@/components/PaletteGrid';
import VisionTabs from '@/components/VisionTabs';
import PreviewCanvas from '@/components/PreviewCanvas';
import ContrastScore from '@/components/ContrastScore';
import SuggestionList from '@/components/SuggestionList';
import { usePaletteStore, ROLE_ORDER, ROLE_LABEL } from '@/store/usePaletteStore';

const Home: React.FC = () => {
  const { colors, reset, randomize } = usePaletteStore();
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (what: 'css' | 'json' | 'all') => {
    let text = '';
    if (what === 'css') {
      text = `:root {\n  --color-primary: ${colors.primary};\n  --color-secondary: ${colors.secondary};\n  --color-background: ${colors.background};\n  --color-text: ${colors.text};\n}`;
    } else if (what === 'json') {
      text = JSON.stringify({
        primary: colors.primary,
        secondary: colors.secondary,
        background: colors.background,
        text: colors.text,
      }, null, 2);
    } else {
      text = `Primary: ${colors.primary}\nSecondary: ${colors.secondary}\nBackground: ${colors.background}\nText: ${colors.text}`;
    }
    await navigator.clipboard.writeText(text);
    setCopied(what);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-canvas-50/70 border-b border-canvas-200">
        <div className="container">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center shadow-lifted">
                <Rainbow className="text-white" size={20} />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                </span>
              </div>
              <div>
                <h1 className="font-display font-bold text-xl leading-none tracking-tight text-stone-800">
                  ChromaCheck
                </h1>
                <p className="text-[10px] text-stone-500 mt-0.5 font-medium uppercase tracking-wider">
                  色觉友好配色检查器 · WCAG 2.1
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1.5">
              <button
                onClick={randomize}
                className="group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-accent-50 text-accent-700 hover:bg-accent-100 border border-accent-200 hover:-translate-y-0.5 hover:shadow-soft transition-all"
              >
                <Shuffle size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                随机方案
              </button>
              <button
                onClick={reset}
                className="group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-canvas-100 text-stone-600 hover:bg-canvas-200 border border-canvas-200 hover:-translate-y-0.5 hover:shadow-soft transition-all"
              >
                <RotateCcw size={14} />
                重置
              </button>
              <div className="w-px h-5 bg-canvas-200 mx-1" />
              <button
                onClick={() => handleCopy('css')}
                className="group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white text-stone-700 hover:bg-brand-50 border border-canvas-200 hover:border-brand-300 hover:-translate-y-0.5 hover:shadow-soft transition-all"
              >
                {copied === 'css' ? <Check size={14} className="text-brand-600" /> : <Copy size={14} />}
                {copied === 'css' ? '已复制!' : '复制 CSS'}
              </button>
              <button
                onClick={() => handleCopy('json')}
                className="group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white text-stone-700 hover:bg-brand-50 border border-canvas-200 hover:border-brand-300 hover:-translate-y-0.5 hover:shadow-soft transition-all"
              >
                {copied === 'json' ? <Check size={14} className="text-brand-600" /> : <Copy size={14} />}
                {copied === 'json' ? '已复制!' : 'JSON'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 md:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
          <aside className="space-y-6">
            <SectionCard title="配色输入" icon={<Rainbow size={16} />} accent="emerald" delay={50}>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {ROLE_ORDER.map((role) => (
                  <ColorInput key={role} role={role} />
                ))}
              </div>
              <PaletteGrid />

              <div className="md:hidden flex items-center justify-center gap-2 mt-5 pt-4 border-t border-canvas-100">
                <button
                  onClick={randomize}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-accent-50 text-accent-700 border border-accent-200"
                >
                  <Shuffle size={12} /> 随机
                </button>
                <button
                  onClick={reset}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-canvas-100 text-stone-600 border border-canvas-200"
                >
                  <RotateCcw size={12} /> 重置
                </button>
                <button
                  onClick={() => handleCopy('all')}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-white text-stone-700 border border-canvas-200"
                >
                  {copied === 'all' ? <Check size={12} /> : <Copy size={12} />}
                  {copied === 'all' ? '已复制' : '复制'}
                </button>
              </div>
            </SectionCard>
          </aside>

          <section className="space-y-6">
            <SectionCard accent="indigo" delay={100}>
              <VisionTabs />
            </SectionCard>

            <SectionCard title="实时模拟预览" delay={150}>
              <PreviewCanvas />
            </SectionCard>

            <SectionCard title="对比度评分 · WCAG 2.1" icon={<Heart size={16} />} accent="emerald" delay={200}>
              <ContrastScore />
            </SectionCard>

            <SectionCard title="替代色建议" accent="emerald" delay={250}>
              <SuggestionList />
            </SectionCard>
          </section>
        </div>
      </main>

      <footer className="border-t border-canvas-200 mt-8">
        <div className="container py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-stone-500">
          <div className="flex items-center gap-2">
            <Github size={14} />
            <span>© 2026 ChromaCheck · 为每个人设计更友好的色彩体验</span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span>P:{colors.primary}</span>
            <span>S:{colors.secondary}</span>
            <span>B:{colors.background}</span>
            <span>T:{colors.text}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
