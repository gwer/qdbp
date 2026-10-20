import { InputError } from '@/ui/define';
import type { PrepayMode, PrepayRepeat, Prepayment } from './loan';

export const PREPAY_MODES: readonly PrepayMode[] = ['term', 'payment'];
export const PREPAY_REPEATS: readonly PrepayRepeat[] = ['once', 'monthly', 'quarterly', 'yearly'];

/**
 * Досрочные погашения в URL и в поле калькулятора: «после:сумма:что:как часто» через «;»,
 * например «24:500000:term:once;36:10000:payment:monthly». Пустая строка — без досрочных погашений.
 */
export function stringifyPrepayments(list: readonly Prepayment[]): string {
  return list.map((p) => `${p.after}:${p.amount}:${p.mode}:${p.repeat}`).join(';');
}

/** Разбор строки поля; некорректная запись (руками в URL) — InputError('prepayments'). */
export function parsePrepayments(s: string): Prepayment[] {
  if (!s) return [];
  return s.split(';').map((item) => {
    const [after, amount, mode, repeat] = item.split(':');
    const p = { after: Number(after), amount: Number(amount), mode: mode as PrepayMode, repeat: (repeat ?? 'once') as PrepayRepeat };
    if (!Number.isInteger(p.after) || p.after < 0 || !(p.amount > 0) || !PREPAY_MODES.includes(p.mode) || !PREPAY_REPEATS.includes(p.repeat)) {
      throw new InputError('prepayments');
    }
    return p;
  });
}
