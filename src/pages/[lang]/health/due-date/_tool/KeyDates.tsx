import { addDays } from '@/lib/date';
import { formatDate } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';

/** Ключевые сроки от начала акушерского срока (дней) и полоса «неделя N из 40». */
const MILESTONES = [
  ['firstEnd', 97],
  ['thirdStart', 196],
  ['term', 259],
  ['due', 280],
  ['late', 294],
] as const;

export function KeyDates({ result, lang, t }: ExtraProps<unknown, { start: string; age: number }>) {
  const week = Math.min(42, Math.floor(result.age / 7) + 1);
  return (
    <>
      {result.age <= 294 && (
        <div class="progress">
          <progress max={280} value={Math.min(280, result.age)} aria-label={t('ui.week', { week })} />
          <span>{t('ui.week', { week })}</span>
        </div>
      )}
      <div class="table-wrap">
        <table>
          <tbody>
            {MILESTONES.map(([key, days]) => (
              <tr key={key} class={result.age >= days ? 'muted' : undefined}>
                <td>{t(`ui.milestones.${key}`)}</td>
                <td>{formatDate(lang, addDays(result.start, days))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
