import { formatNumber } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';
import type { Kind } from './tool';

type Values = { a: number; b: number; c: number; kind: Kind };

/** Подставленная формула: «X = B × C / A = 12 × 5 / 3 = 20». */
export function Formula({ values, result, lang }: ExtraProps<Values, { x: number }>) {
  const n = (v: number) => formatNumber(lang, v, 'number', 6);
  const { a, b, c, kind } = values;
  const direct = kind === 'direct';
  return (
    <p class="muted">
      X = {direct ? 'B × C / A' : 'A × B / C'} = {direct ? `${n(b)} × ${n(c)} / ${n(a)}` : `${n(a)} × ${n(b)} / ${n(c)}`} ={' '}
      <strong>{n(result.x)}</strong>
    </p>
  );
}
