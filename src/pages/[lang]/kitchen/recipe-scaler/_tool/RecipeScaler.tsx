import { useState } from 'preact/hooks';
import { formatNumber } from '@/lib/format';
import { parseNumber } from '@/lib/parse';
import { CopyButton } from '@/ui/CopyButton';
import type { ToolProps } from '@/ui/define';
import { scaleLine } from './scale';

export function RecipeScaler({ lang, t }: ToolProps) {
  const [recipe, setRecipe] = useState(() => t('ui.example'));
  const [from, setFrom] = useState('4');
  const [to, setTo] = useState('6');

  const a = parseNumber(from, lang);
  const b = parseNumber(to, lang);
  const valid = a !== null && b !== null && a > 0 && b > 0;
  const factor = valid ? b! / a! : null;
  const format = (n: number) => formatNumber(lang, n, 'number', 2);
  // Дроби (½, ¼) привычны в американских рецептах; в остальных языках — десятичная запись.
  const scaled = factor === null ? '' : recipe.split('\n').map((l) => scaleLine(l, factor, format, lang === 'en')).join('\n');

  return (
    <div>
      <div class="calc-inputs">
        <div class="field">
          <label for="rs-from">{t('ui.from')}</label>
          <input id="rs-from" type="text" inputMode="decimal" value={from} onInput={(e) => setFrom(e.currentTarget.value)} aria-invalid={valid ? undefined : 'true'} />
        </div>
        <div class="field">
          <label for="rs-to">{t('ui.to')}</label>
          <input id="rs-to" type="text" inputMode="decimal" value={to} onInput={(e) => setTo(e.currentTarget.value)} aria-invalid={valid ? undefined : 'true'} />
        </div>
      </div>
      <p class="muted">{factor === null ? t('ui.invalid') : t('ui.factor', { factor: format(factor) })}</p>
      <div class="field">
        <label for="rs-in">{t('ui.input')}</label>
        <textarea id="rs-in" rows={8} value={recipe} onInput={(e) => setRecipe(e.currentTarget.value)} />
      </div>
      <div class="field">
        <label for="rs-out">{t('ui.output')}</label>
        <textarea id="rs-out" rows={8} readOnly value={scaled} />
      </div>
      <div class="actions">
        <CopyButton text={scaled} t={t} />
      </div>
    </div>
  );
}
