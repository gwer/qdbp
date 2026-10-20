import { formatNumber } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';
import type { RefinanceInput, refinance } from './tool';

/** Текущий кредит и новый рядом: платёж, срок, проценты, расходы и сколько всего придётся заплатить. */
export function Compare({ result, lang, t }: ExtraProps<RefinanceInput, ReturnType<typeof refinance>>) {
  const money = (n: number) => formatNumber(lang, n, 'money');
  const { current, next } = result;
  const rows: [string, string, string][] = [
    [t('ui.payment'), money(current.payment), money(next.payment)],
    [t('ui.term'), t('ui.months', { count: current.months }), t('ui.months', { count: next.months })],
    [t('ui.interest'), money(current.interest), money(next.interest)],
    [t('ui.fees'), '—', money(next.fees)],
    [t('ui.total'), money(current.total), money(next.total)],
  ];
  return (
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th />
            <th>{t('ui.now')}</th>
            <th>{t('ui.after')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, a, b]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{a}</td>
              <td>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
