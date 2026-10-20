import { addMonths, daysBetween, diffYMD } from '@/lib/date';
import { LANG_META } from '@/i18n/config';
import { defineCalculator, InputError, type FormatContext } from '@/ui/define';
import { island } from '@/ui/ToolRoot';

export function age(birth: string, on: string) {
  if (on < birth) throw new InputError('beforeBirth');
  const { years, months, days } = diffYMD(birth, on);
  // День рождения 29 февраля в невисокосный год — 28 февраля (так работает addMonths).
  let next = addMonths(birth, 12 * years);
  if (next < on) next = addMonths(birth, 12 * (years + 1));
  const totalDays = daysBetween(birth, on);
  return {
    years,
    months,
    days,
    nextBirthday: daysBetween(on, next),
    nextDate: next,
    turning: next === on ? years : years + 1,
    totalMonths: years * 12 + months,
    totalWeeks: Math.floor(totalDays / 7),
    totalDays,
    bornOn: birth,
  };
}

/** День недели даты 'YYYY-MM-DD': «пятница». */
const weekday = (iso: string, { lang }: FormatContext) =>
  new Intl.DateTimeFormat(LANG_META[lang].intl, { weekday: 'long', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));

export const def = defineCalculator({
  order: 10,
  related: ['days-between', 'add-to-date'],
  inputs: {
    birth: { type: 'date', default: '1990-06-15' },
    on: { type: 'date', default: 'today' },
  },
  errors: ['beforeBirth'],
  compute: ({ birth, on }) => age(birth, on),
  outputs: {
    years: { type: 'integer' },
    months: { type: 'integer' },
    days: { type: 'integer' },
    nextBirthday: { type: 'integer' },
    nextDate: { type: 'date', style: 'full' },
    turning: { type: 'integer' },
    totalMonths: { type: 'integer' },
    totalWeeks: { type: 'integer' },
    totalDays: { type: 'integer' },
    bornOn: { type: 'custom', format: weekday },
  },
});

export default island(def);
