import { formatNumber } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';
import { fToC, GAS_MARKS, gasLabel, gasToF } from './oven';

// °C округлены до 5 градусов — так их пишут в рецептах и на ручках духовок.
const roundC = (f: number) => Math.round(fToC(f) / 5) * 5;

export function GasTable({ lang, t }: ExtraProps<unknown, unknown>) {
  return (
    <details class="extra">
      <summary>{t('ui.table')}</summary>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('ui.gas')}</th>
              <th>°F</th>
              <th>°C</th>
              <th>{t('ui.fan')}</th>
            </tr>
          </thead>
          <tbody>
            {GAS_MARKS.map((m) => {
              const f = gasToF(m)!;
              return (
                <tr key={m}>
                  <td>{gasLabel(m)}</td>
                  <td>{formatNumber(lang, f, 'integer')}</td>
                  <td>{formatNumber(lang, roundC(f), 'integer')}</td>
                  <td>{formatNumber(lang, roundC(f) - 20, 'integer')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}
