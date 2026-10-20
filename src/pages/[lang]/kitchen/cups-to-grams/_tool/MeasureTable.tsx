import { formatNumber } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';
import { fromGrams, MEASURE_IDS, type Ingredient } from '../../_shared/measures';

/** Те же граммы во всех мерах — заодно обратный пересчёт «граммы → стаканы/ложки». */
export function MeasureTable({ result, lang, t }: ExtraProps<unknown, { grams: number; ingredient: Ingredient }>) {
  return (
    <div class="table-wrap">
      <table>
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
  );
}
