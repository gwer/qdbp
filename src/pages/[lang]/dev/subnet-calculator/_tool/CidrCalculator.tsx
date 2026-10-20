import { useState } from 'preact/hooks';
import { formatNumber } from '@/lib/format';
import type { ToolProps } from '@/ui/define';
import { formatIp, parseCidr, subnet } from './cidr';

export function CidrCalculator({ lang, t }: ToolProps) {
  const [input, setInput] = useState('192.168.1.10/24');
  const parsed = parseCidr(input);
  const s = parsed && subnet(parsed.ip, parsed.prefix);
  const rows: [string, string][] = s
    ? [
        ['network', `${formatIp(s.network)}/${parsed!.prefix}`],
        ['mask', `${formatIp(s.mask)} (/${parsed!.prefix})`],
        ['wildcard', formatIp(s.wildcard)],
        ['broadcast', formatIp(s.broadcast)],
        ['range', `${formatIp(s.first)} – ${formatIp(s.last)}`],
        ['usable', formatNumber(lang, s.usable, 'integer')],
        ['size', formatNumber(lang, s.size, 'integer')],
        ['private', t(s.private ? 'ui.yes' : 'ui.no')],
      ]
    : [];
  return (
    <div>
      <div class="field">
        <label for="cidr-in">{t('ui.input')}</label>
        <input id="cidr-in" type="text" inputMode="decimal" autoComplete="off" spellcheck={false} value={input} onInput={(e) => setInput(e.currentTarget.value)} />
      </div>
      {!s ? (
        <p class="field-error">{t('ui.error')}</p>
      ) : (
        <div class="table-wrap">
          <table class="kv">
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k}>
                  <th scope="row">{t(`ui.rows.${k}`)}</th>
                  <td class="mono">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
