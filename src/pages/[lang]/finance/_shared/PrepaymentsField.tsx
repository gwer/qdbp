import { useEffect, useRef, useState } from 'preact/hooks';
import { formatInput, formatNumber } from '@/lib/format';
import { parseNumber } from '@/lib/parse';
import type { CustomFieldProps } from '@/ui/define';
import type { Prepayment } from './loan';
import { PREPAY_MODES, PREPAY_REPEATS, parsePrepayments, stringifyPrepayments } from './prepayments';

type Row = { after: string; amount: string; mode: string; repeat: string };

/**
 * Список досрочных погашений. Строки хранят текст полей как есть (пока пользователь печатает),
 * наружу уходит каноничная строка только из верно заполненных строк; ошибки показываются у строки.
 */
export function PrepaymentsField({ id, name, value, onChange, lang, t }: CustomFieldProps) {
  const toRows = (s: string): Row[] => {
    let list: Prepayment[] = [];
    try {
      list = parsePrepayments(s);
    } catch {
      // Битая запись в URL — показываем пустой список, расчёт сообщит об ошибке.
    }
    return list.map((p) => ({ after: String(p.after), amount: formatInput(lang, p.amount), mode: p.mode, repeat: p.repeat }));
  };
  const [rows, setRows] = useState<Row[]>(() => toRows(value));
  const sent = useRef(value);
  // Значение пришло снаружи (из URL после гидратации) — перечитать строки.
  useEffect(() => {
    if (value !== sent.current) {
      sent.current = value;
      setRows(toRows(value));
    }
  }, [value]);

  const errorsOf = (r: Row) => {
    const after = parseNumber(r.after, lang);
    const amount = parseNumber(r.amount, lang);
    return {
      after: after === null || !Number.isInteger(after) || after < 0 ? t('calc.error.integer') : null,
      amount: amount === null ? t('calc.error.number') : amount > 0 ? null : t('calc.error.min', { min: formatNumber(lang, 0.01) }),
    };
  };

  const update = (next: Row[]) => {
    setRows(next);
    const valid = next
      .filter((r) => {
        const e = errorsOf(r);
        return !e.after && !e.amount;
      })
      .map((r) => ({ after: parseNumber(r.after, lang)!, amount: parseNumber(r.amount, lang)!, mode: r.mode, repeat: r.repeat }) as Prepayment);
    const s = stringifyPrepayments(valid);
    sent.current = s;
    onChange(s);
  };
  const edit = (i: number, key: keyof Row, v: string) => update(rows.map((r, k) => (k === i ? { ...r, [key]: v } : r)));
  const last = rows.at(-1);

  return (
    <fieldset class="prepay" id={id}>
      <legend>{t(`inputs.${name}.label`)}</legend>
      {rows.map((r, i) => {
        const e = errorsOf(r);
        const fid = `${id}-${i}`;
        return (
          <div class="prepay-row" key={i}>
            <div class="field">
              <label for={`${fid}-after`}>{t('ui.prepay.after')}</label>
              <input
                id={`${fid}-after`}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={r.after}
                aria-invalid={e.after ? 'true' : undefined}
                onInput={(ev) => edit(i, 'after', ev.currentTarget.value)}
              />
            </div>
            <div class="field">
              <label for={`${fid}-amount`}>{t('ui.prepay.amount')}</label>
              <input
                id={`${fid}-amount`}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={r.amount}
                aria-invalid={e.amount ? 'true' : undefined}
                onInput={(ev) => edit(i, 'amount', ev.currentTarget.value)}
              />
            </div>
            <div class="field">
              <label for={`${fid}-repeat`}>{t('ui.prepay.repeat')}</label>
              <select id={`${fid}-repeat`} value={r.repeat} onChange={(ev) => edit(i, 'repeat', ev.currentTarget.value)}>
                {PREPAY_REPEATS.map((o) => (
                  <option key={o} value={o}>
                    {t(`ui.prepay.repeats.${o}`)}
                  </option>
                ))}
              </select>
            </div>
            <div class="field">
              <label for={`${fid}-mode`}>{t('ui.prepay.mode')}</label>
              <select id={`${fid}-mode`} value={r.mode} onChange={(ev) => edit(i, 'mode', ev.currentTarget.value)}>
                {PREPAY_MODES.map((o) => (
                  <option key={o} value={o}>
                    {t(`ui.prepay.modes.${o}`)}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" class="btn btn-secondary btn-small prepay-remove" aria-label={t('ui.prepay.remove')} title={t('ui.prepay.remove')} onClick={() => update(rows.filter((_, k) => k !== i))}>
              ×
            </button>
            {(e.after || e.amount) && <p class="field-error prepay-error">{e.after ?? e.amount}</p>}
          </div>
        );
      })}
      <button
        type="button"
        class="btn btn-secondary btn-small"
        onClick={() =>
          // Новая строка — через год после предыдущей, с той же суммой: так проще заполнять серию.
          update([...rows, last ? { ...last, after: String((parseNumber(last.after, lang) ?? 0) + 12), repeat: 'once' } : { after: '12', amount: '', mode: 'term', repeat: 'once' }])
        }
      >
        + {t('ui.prepay.add')}
      </button>
    </fieldset>
  );
}
