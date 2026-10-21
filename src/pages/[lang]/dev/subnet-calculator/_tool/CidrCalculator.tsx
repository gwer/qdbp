import { useState } from 'preact/hooks';
import { formatNumber } from '@/lib/format';
import type { ToolProps } from '@/ui/define';
import { binaryIp, formatIp, parseCidr, split, subnet } from './cidr';

export function CidrCalculator({ lang, t }: ToolProps) {
  const [input, setInput] = useState('192.168.1.10/24');
  // Новый префикс для разбиения; 0 — не разбивать.
  const [into, setInto] = useState(0);
  const parsed = parseCidr(input);
  const s = parsed && subnet(parsed.ip, parsed.prefix);
  const prefixes = parsed ? Array.from({ length: Math.min(32, parsed.prefix + 8) - parsed.prefix }, (_, i) => parsed.prefix + 1 + i) : [];
  // Выбор, недоступный для нового префикса сети, не применяется: видимый список и результат совпадают.
  const chosen = prefixes.includes(into) ? into : 0;
  const parts = s && chosen ? split(s.network, parsed!.prefix, chosen) : null;
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
        ['binaryIp', binaryIp(parsed!.ip)],
        ['binaryMask', binaryIp(s.mask)],
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
      {s && prefixes.length > 0 && (
        <div class="field">
          <label for="cidr-split">{t('ui.split')}</label>
          <select id="cidr-split" value={chosen} onChange={(e) => setInto(Number(e.currentTarget.value))}>
            <option value={0}>{t('ui.noSplit')}</option>
            {prefixes.map((p) => (
              <option value={p} key={p}>
                {t('ui.splitInto', { count: 2 ** (p - parsed!.prefix), prefix: p })}
              </option>
            ))}
          </select>
        </div>
      )}
      {parts && (
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('ui.rows.network')}</th>
                <th>{t('ui.rows.range')}</th>
                <th>{t('ui.rows.broadcast')}</th>
              </tr>
            </thead>
            <tbody>
              {parts.subnets.map((p) => (
                <tr key={p.network}>
                  <td class="mono">
                    {formatIp(p.network)}/{chosen}
                  </td>
                  <td class="mono">
                    {formatIp(p.first)} – {formatIp(p.last)}
                  </td>
                  <td class="mono">{formatIp(p.broadcast)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {parts.count > parts.subnets.length && <p class="muted">{t('ui.more', { n: formatNumber(lang, parts.count - parts.subnets.length, 'integer') })}</p>}
        </div>
      )}
    </div>
  );
}
