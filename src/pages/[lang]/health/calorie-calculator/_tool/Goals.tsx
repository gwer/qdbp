import { formatNumber } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';

/**
 * Калории в день для темпов похудения и набора. 1 кг жира ≈ 7 700 ккал, 1 фунт ≈ 3 500 ккал —
 * распространённое приближение (реальный темп со временем замедляется).
 * Ниже 1 200 ккал (женщины) и 1 500 ккал (мужчины) без врача не советуют.
 */
export function goals(tdee: number, imperial: boolean) {
  const steps = imperial ? [-2, -1, -0.5, 0, 0.5, 1] : [-1, -0.5, -0.25, 0, 0.25, 0.5];
  const perUnit = imperial ? 3500 : 7700;
  return steps.map((rate) => ({ rate, kcal: tdee + (rate * perUnit) / 7 }));
}

export function Goals({ values, result, lang, t, units }: ExtraProps<{ sex: 'male' | 'female' }, { tdee: number }>) {
  const imperial = units === 'imperial';
  const min = values.sex === 'female' ? 1200 : 1500;
  const unit = imperial ? t('ui.lb') : t('ui.kg');
  return (
    <>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('ui.goal')}</th>
              <th>{t('ui.kcal')}</th>
            </tr>
          </thead>
          <tbody>
            {goals(result.tdee, imperial).map(({ rate, kcal }) => (
              <tr key={rate}>
                <td>
                  {rate === 0
                    ? t('ui.maintain')
                    : t(rate < 0 ? 'ui.lose' : 'ui.gain', { amount: `${formatNumber(lang, Math.abs(rate))} ${unit}` })}
                </td>
                <td>
                  {formatNumber(lang, kcal, 'integer')}
                  {kcal < min && <span class="muted"> — {t('ui.tooLow')}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p class="muted">{t('ui.goalsNote', { min: formatNumber(lang, min, 'integer') })}</p>
    </>
  );
}
