import { formatNumber } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';
import { fromGrams, INGREDIENT_IDS, MEASURE_IDS, toGrams, type Ingredient, type Measure } from '../../_shared/measures';

/** Те же граммы во всех мерах — заодно обратный пересчёт «граммы → стаканы/ложки». */
export function MeasureTable({ values, result, lang, t }: ExtraProps<{ amount: number; measure: Measure }, { grams: number; ingredient: Ingredient }>) {
  const g = (n: number) => formatNumber(lang, n, 'number', n < 10 ? 1 : 0);
  return (
    <>
    <div class="table-wrap">
      <table class="wrap">
        <caption class="muted">{t('ui.table')}</caption>
        <tbody>
          {MEASURE_IDS.filter((m) => m !== 'g').map((m) => (
            <tr key={m}>
              <td>{t(`inputs.measure.options.${m}`)}</td>
              <td>{formatNumber(lang, fromGrams(result.grams, m, result.ingredient), 'number', 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {/* Прямой ответ на «сколько грамм в столовой ложке»: та же мера для всех продуктов. */}
    {values.measure !== 'g' && (
      <details class="extra">
        <summary>{t('ui.all', { amount: formatNumber(lang, values.amount), measure: t(`inputs.measure.options.${values.measure}`) })}</summary>
        <div class="table-wrap">
          <table class="wrap">
            <tbody>
              {INGREDIENT_IDS.map((id) => (
                <tr key={id} class={id === result.ingredient ? 'row-current' : undefined}>
                  <td>{t(`inputs.ingredient.options.${id}`)}</td>
                  <td>
                    {g(toGrams(values.amount, values.measure, id))} {t('ui.g')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    )}
    </>
  );
}
