import { useState } from 'preact/hooks';
import { formatNumber } from '@/lib/format';
import { CopyButton } from '@/ui/CopyButton';
import type { ToolProps } from '@/ui/define';
import { contrast, parseColor, rgbToCmyk, rgbToHsl, rgbToHsv, rgbToOklch, toHex, type Rgba } from './color';

const r0 = (x: number) => Math.round(x);
const r1 = (x: number) => Math.round(x * 10) / 10;

function formats(c: Rgba): [string, string][] {
  const hsl = rgbToHsl(c);
  const hsv = rgbToHsv(c);
  const cmyk = rgbToCmyk(c);
  const ok = rgbToOklch(c);
  const a = c.a < 1 ? ` / ${r1(c.a * 100)}%` : '';
  return [
    ['HEX', toHex(c)],
    ['RGB', `rgb(${c.r} ${c.g} ${c.b}${a})`],
    ['HSL', `hsl(${r0(hsl.h)} ${r0(hsl.s)}% ${r0(hsl.l)}%${a})`],
    ['HSV', `hsv(${r0(hsv.h)}, ${r0(hsv.s)}%, ${r0(hsv.v)}%)`],
    ['CMYK', `cmyk(${r0(cmyk.c)}%, ${r0(cmyk.m)}%, ${r0(cmyk.y)}%, ${r0(cmyk.k)}%)`],
    ['OKLCH', `oklch(${r1(ok.l * 100)}% ${Math.round(ok.c * 1000) / 1000} ${r1(ok.h)}${a})`],
  ];
}

const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };
const BLACK: Rgba = { r: 0, g: 0, b: 0, a: 1 };

export function ColorConverter({ lang, t }: ToolProps) {
  const [input, setInput] = useState('#3451d1');
  // Свой фон для проверки контраста: «мой текст на моём фоне».
  const [bgInput, setBgInput] = useState('#fff4e5');
  const color = parseColor(input);
  const bgColor = parseColor(bgInput);
  const custom = bgColor && { ...bgColor, a: 1 };
  const solid = color && { ...color, a: 1 };

  const rating = (ratio: number) => (ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA18' : 'fail');

  return (
    <div>
      <div class="color-input">
        <div class="field">
          <label for="color-in">{t('ui.input')}</label>
          <input id="color-in" type="text" autoComplete="off" spellcheck={false} value={input} onInput={(e) => setInput(e.currentTarget.value)} />
        </div>
        <input
          type="color"
          aria-label={t('ui.picker')}
          value={solid ? toHex(solid) : '#000000'}
          onInput={(e) => setInput(e.currentTarget.value)}
        />
      </div>
      {!color ? (
        <p class="field-error">{t('ui.error')}</p>
      ) : (
        <>
          <div class="color-swatch" style={{ background: `rgba(${color.r},${color.g},${color.b},${color.a})` }} />
          {formats(color).map(([name, value]) => (
            <div class="hash-row" key={name}>
              <div class="hash-head">
                <strong>{name}</strong>
                <CopyButton text={value} t={t} />
              </div>
              <p class="mono-out">{value}</p>
            </div>
          ))}
          <h3 class="color-h">{t('ui.contrast')}</h3>
          {[
            [t('ui.onWhite'), WHITE],
            [t('ui.onBlack'), BLACK],
            ...(custom ? [[t('ui.onCustom', { color: toHex(custom) }), custom]] : []),
          ].map(([label, bg]) => {
            // Два знака, округление вниз: WCAG не разрешает округлять 4,499 до 4,5.
            const ratio = contrast(solid!, bg as Rgba);
            return (
              <div class="contrast-row" key={label as string}>
                <span class="contrast-sample" style={{ background: toHex(bg as Rgba), color: toHex(solid!) }}>
                  Aa
                </span>
                <span>
                  {label as string}: <strong>{formatNumber(lang, Math.floor(ratio * 100) / 100, 'money')}:1</strong> — {t(`ui.rating.${rating(ratio)}`)}
                </span>
              </div>
            );
          })}
          <div class="color-input">
            <div class="field">
              <label for="color-bg">{t('ui.background')}</label>
              <input id="color-bg" type="text" autoComplete="off" spellcheck={false} value={bgInput} onInput={(e) => setBgInput(e.currentTarget.value)} />
            </div>
            <input type="color" aria-label={t('ui.background')} value={custom ? toHex(custom) : '#ffffff'} onInput={(e) => setBgInput(e.currentTarget.value)} />
          </div>
          {!bgColor && <p class="field-error">{t('ui.error')}</p>}
        </>
      )}
    </div>
  );
}
