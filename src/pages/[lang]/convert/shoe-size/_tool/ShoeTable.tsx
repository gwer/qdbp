import { formatNumber } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';
import { SHOES } from './shoes';

export function ShoeTable({ lang, t, result }: ExtraProps<unknown, { eu: number } | null>) {
  const f = (n: number) => formatNumber(lang, n);
  return (
    <details class="extra">
      <summary>{t('ui.table')}</summary>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>EU</th>
              <th>UK</th>
              <th>{t('ui.usM')}</th>
              <th>{t('ui.usW')}</th>
              <th>{t('ui.cm')}</th>
            </tr>
          </thead>
          <tbody>
            {SHOES.map((r) => {
              const cells = [r.eu, r.uk, r.usM, r.usW, r.mm / 10].map(f);
              const on = result?.eu === r.eu;
              return (
                <tr key={r.mm}>
                  {cells.map((c, i) => (
                    <td key={i}>{on ? <strong>{c}</strong> : c}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}
