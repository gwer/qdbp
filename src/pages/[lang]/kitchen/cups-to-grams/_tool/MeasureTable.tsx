import { formatNumber } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';
import { CUP_IDS, fromGrams, INGREDIENT_IDS, MEASURE_IDS, PACKED_IDS, toGrams, type Ingredient, type Measure, type Packing } from '../../_shared/measures';

/** Те же граммы во всех мерах — заодно обратный пересчёт «граммы → стаканы/ложки». */
export function MeasureTable({ values, result, lang, t }: ExtraProps<{ amount: number; measure: Measure; packing: Packing }, { grams: number; ingredient: Ingredient }>) {
  const g = (n: number) => formatNumber(lang, n, 'number', n < 10 ? 1 : 0);
  const { measure, packing } = values;
  const cup = (CUP_IDS as readonly Measure[]).includes(measure);
  // Насколько рыхлый стакан легче плотного — для пояснения к выбору «плотно/рыхло».
  const less = 1 - toGrams(1, measure, result.ingredient, 'spooned') / toGrams(1, measure, result.ingredient, 'scooped');
  return (
    <>
    {cup && PACKED_IDS.includes(result.ingredient) && <p class="muted">{t('ui.packingNote', { less: formatNumber(lang, less * 100, 'percent', 0) })}</p>}
    <div class="table-wrap">
      <table class="wrap">
        <caption class="muted">{t('ui.table')}</caption>
        <tbody>
          {MEASURE_IDS.filter((m) => m !== 'g').map((m) => (
            <tr key={m}>
              <td>{t(`inputs.measure.options.${m}`)}</td>
              <td>{formatNumber(lang, fromGrams(result.grams, m, result.ingredient, packing), 'number', 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {/* Прямой ответ на «сколько грамм в столовой ложке»: та же мера для всех продуктов. */}
    {measure !== 'g' && (
      <details class="extra">
        <summary>{t('ui.all', { amount: formatNumber(lang, values.amount), measure: t(`inputs.measure.options.${measure}`) })}</summary>
        <div class="table-wrap">
          <table class="wrap">
            <tbody>
              {INGREDIENT_IDS.map((id) => (
                <tr key={id} class={id === result.ingredient ? 'row-current' : undefined}>
                  <td>{t(`inputs.ingredient.options.${id}`)}</td>
                  <td>
                    {g(toGrams(values.amount, measure, id, packing))} {t('ui.g')}
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
