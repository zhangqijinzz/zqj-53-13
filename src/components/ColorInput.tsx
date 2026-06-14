import React, { useState, useEffect, useRef } from 'react';
import { Pipette, Check, AlertTriangle } from 'lucide-react';
import { ColorRole, ROLE_LABEL, usePaletteStore } from '@/store/usePaletteStore';
import { isValidHex, normalizeHex, rgbToHsl, hexToRgb } from '@/utils/colorUtils';

interface Props {
  role: ColorRole;
}

const getTextColorForBg = (hex: string): string => {
  const { r, g, b } = hexToRgb(hex);
  const lum = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
  return lum > 0.6 ? '#1F2937' : '#FFFFFF';
};

const ColorInput: React.FC<Props> = ({ role }) => {
  const { colors, activeColorRole, setColor, setActiveRole } = usePaletteStore();
  const hex = colors[role];
  const [input, setInput] = useState(hex.replace('#', ''));
  const [isValid, setIsValid] = useState(true);
  const hiddenPickerRef = useRef<HTMLInputElement>(null);
  const isActive = activeColorRole === role;

  useEffect(() => {
    setInput(hex.replace('#', ''));
    setIsValid(true);
  }, [hex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
    setInput(v);
    if (v.length === 6 || v.length === 3) {
      const full = '#' + v;
      if (isValidHex(full)) {
        setColor(role, full);
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } else if (v.length === 0) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  const handleBlur = () => {
    setInput(hex.replace('#', ''));
    setIsValid(true);
  };

  const onPickerClick = () => hiddenPickerRef.current?.click();

  const textOnSwatch = getTextColorForBg(hex);
  const { l } = rgbToHsl(hexToRgb(hex));

  return (
    <button
      type="button"
      onClick={() => setActiveRole(role)}
      onKeyDown={(e) => { if (e.key === 'Enter') setActiveRole(role); }}
      className={`group relative flex flex-col rounded-xl border-2 p-3 text-left transition-all duration-200 ${
        isActive
          ? 'border-brand-500 shadow-lifted -translate-y-0.5'
          : 'border-canvas-200 hover:border-canvas-300 hover:shadow-soft hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wider uppercase ${
          isActive
            ? 'bg-brand-500 text-white'
            : 'bg-canvas-100 text-stone-600'
        }`}>
          {ROLE_LABEL[role]}
        </span>
        {isActive && (
          <Check size={14} className="text-brand-500" strokeWidth={3} />
        )}
      </div>

      <div
        className="relative h-20 rounded-lg overflow-hidden mb-3 cursor-pointer"
        style={{ backgroundColor: hex }}
        onClick={(e) => {
          e.stopPropagation();
          onPickerClick();
        }}
      >
        <div
          className="absolute inset-0 flex items-end justify-between p-2 transition-opacity duration-200"
          style={{ color: textOnSwatch }}
        >
          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono opacity-90">
            L {l.toFixed(0)}%
          </div>
          <Pipette
            size={16}
            className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm"
          />
        </div>
        <input
          ref={hiddenPickerRef}
          type="color"
          value={hex}
          onChange={(e) => setColor(role, e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>

      <div className="relative">
        <div className={`flex items-center gap-1 rounded-md border px-2 py-1.5 bg-canvas-50 transition-colors ${
          !isValid ? 'border-red-300 bg-red-50' : isActive ? 'border-brand-300' : 'border-canvas-200'
        }`}>
          <span className="text-xs font-mono text-stone-500 select-none">#</span>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onClick={(e) => e.stopPropagation()}
            spellCheck={false}
            maxLength={6}
            className="flex-1 bg-transparent outline-none text-sm font-mono font-semibold text-stone-800 uppercase tracking-wider"
            placeholder="HEX"
          />
          {!isValid && <AlertTriangle size={14} className="text-red-500" />}
        </div>
      </div>
    </button>
  );
};

export default ColorInput;
