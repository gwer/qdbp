import { addDays, isoWeek, usWeek } from '@/lib/date';
import { formatDayMonth } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';

type Input = { date: string; system: 'iso' | 'us' };

/** Все недели года по выбранной системе: номер, понедельник (воскресенье) — воскресенье (суббота). */
export function weeksOfYear(year: number, system: 'iso' | 'us') {
  const weeks: { week: number; start: string; end: string }[] = [];
  if (system === 'iso') {
    // Неделя 1 по ISO — та, где 4 января; год недели может отличаться от календарного на краях.
    for (let start = isoWeek(`${year}-01-04`).start, w = isoWeek(start); w.year === year; start = addDays(start, 7), w = isoWeek(start)) {
      weeks.push({ week: w.week, start: w.start, end: w.end });
    }
  } else {
    // В США неделя принадлежит календарному году своей даты: от недели с 1 января до недели с 31 декабря.
    for (let d = `${year}-01-01`; d.startsWith(String(year)); ) {
      const w = usWeek(d);
      weeks.push({ week: w.week, start: w.start, end: w.end });
      d = addDays(w.start, 7);
    }
  }
  return weeks;
}

export function Weeks({ values, result, lang, t }: ExtraProps<Input, { week: number; year: string }>) {
  const year = Number(result.year);
  const weeks = weeksOfYear(year, values.system);
  const d = (iso: string) => formatDayMonth(lang, iso);
  return (
    <details class="extra">
      <summary>{t('ui.all', { year, count: weeks.length })}</summary>
      <div class="table-wrap">
        <table>
          <tbody>
            {weeks.map((w) => (
              <tr key={w.week} class={w.week === result.week ? 'row-current' : undefined}>
                <td>{w.week}</td>
                <td>
                  {d(w.start)} – {d(w.end)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
