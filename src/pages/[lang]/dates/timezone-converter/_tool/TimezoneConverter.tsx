import { useEffect, useState } from 'preact/hooks';
import { LANG_META, type ClockMode, type Lang } from '@/i18n/config';
import { formatTyped, nowClock, parseClock, parseTyped } from '@/lib/clock';
import { daysBetween, isValidDate, todayISO } from '@/lib/date';
import { formatDateInput, parseDateInput } from '@/lib/date-input';
import { formatClock } from '@/lib/format';
import { allZones, formatOffset, offsetMinutes, utcToZoned, zonedToUtc } from '@/lib/timezone';
import type { ToolProps } from '@/ui/define';
import { readPref, writePref } from '@/ui/prefs';
import { DateField } from '@/ui/DateField';
import { TimeField } from '@/ui/TimeField';
import { cityName } from './cities';

const DEFAULTS: Record<Lang, { from: string; to: string[] }> = {
  ru: { from: 'Europe/Moscow', to: ['UTC', 'Europe/London', 'America/New_York', 'Asia/Novosibirsk', 'Asia/Vladivostok'] },
  en: { from: 'America/New_York', to: ['UTC', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'] },
  es: { from: 'Europe/Madrid', to: ['UTC', 'America/Mexico_City', 'America/Bogota', 'America/Argentina/Buenos_Aires', 'America/New_York'] },
  de: { from: 'Europe/Berlin', to: ['UTC', 'Europe/London', 'America/New_York', 'Asia/Dubai', 'Asia/Tokyo'] },
  pt: { from: 'America/Sao_Paulo', to: ['UTC', 'Europe/Lisbon', 'America/New_York', 'America/Manaus', 'Europe/London'] },
};

function genericName(zone: string, locale: string, ms: number) {
  try {
    return new Intl.DateTimeFormat(locale, { timeZone: zone, timeZoneName: 'longGeneric' })
      .formatToParts(new Date(ms))
      .find((p) => p.type === 'timeZoneName')?.value;
  } catch {
    return undefined;
  }
}

export function TimezoneConverter({ lang, t }: ToolProps) {
  const locale = LANG_META[lang].intl;
  const [clock, setClock] = useState<ClockMode>(LANG_META[lang].clock);
  const [dateText, setDateText] = useState('');
  const [time, setTime] = useState('');
  const [from, setFrom] = useState(DEFAULTS[lang].from);
  const [targets, setTargets] = useState(DEFAULTS[lang].to);
  const [zones, setZones] = useState<string[]>([]);
  const [adding, setAdding] = useState('');

  // «Сейчас», пояс пользователя, сохранённый формат времени и состояние из URL — только в браузере.
  useEffect(() => {
    const stored = readPref('clock');
    const mode: ClockMode = stored === '12' || stored === '24' ? stored : clock;
    const params = new URLSearchParams(location.search);
    const list = allZones();
    const valid = (z: string | null): z is string => !!z && list.includes(z);
    const own = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setClock(mode);
    setZones(list);
    setDateText(formatDateInput(isValidDate(params.get('date') ?? '') ? params.get('date')! : todayISO(), lang));
    const qt = parseClock(params.get('time') ?? '');
    setTime(formatTyped(qt ?? parseClock(nowClock())!, mode));
    setFrom(valid(params.get('from')) ? params.get('from')! : valid(own) ? own : from);
    const qto = (params.get('to') ?? '').split(',').filter(valid);
    if (qto.length) setTargets(qto);
  }, []);

  const write = (patch: Record<string, string>) => {
    const params = new URLSearchParams(location.search);
    for (const [k, v] of Object.entries(patch)) params.set(k, v);
    history.replaceState(null, '', `?${params}`);
  };

  const shortDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
  const minutes = parseTyped(time, clock);
  const date = parseDateInput(dateText, lang);
  const ms = minutes !== null && date ? zonedToUtc(from, date, minutes) : null;

  const switchClock = (m: ClockMode) => {
    if (minutes !== null) setTime(formatTyped(minutes, m));
    setClock(m);
    writePref('clock', m);
  };
  const setTargetsAndUrl = (list: string[]) => {
    setTargets(list);
    write({ to: list.join(',') });
  };

  const option = (z: string) => (
    <option value={z} key={z}>
      {cityName(z, lang)} ({formatOffset(offsetMinutes(z, ms ?? Date.now()))})
    </option>
  );
  const sorted = [...zones].sort((a, b) => cityName(a, lang).localeCompare(cityName(b, lang), locale));

  return (
    <div>
      <div class="calc-options" role="group" aria-label={t('calc.clock.label')}>
        <span>{t('calc.clock.label')}</span>
        {(['24', '12'] as const).map((m) => (
          <button type="button" key={m} aria-pressed={clock === m} onClick={() => clock !== m && switchClock(m)}>
            {t(m === '24' ? 'calc.clock.h24' : 'calc.clock.h12')}
          </button>
        ))}
      </div>
      <div class="calc-inputs">
        <div class="field">
          <label for="tz-date">{t('ui.date')}</label>
          <DateField common={{ id: 'tz-date', value: dateText }} raw={dateText} lang={lang} t={t} onChange={(v) => {
            setDateText(v);
            const iso = parseDateInput(v, lang);
            if (iso) write({ date: iso });
          }} />
        </div>
        <div class="field">
          <label for="tz-time">{t('ui.time')}</label>
          <TimeField common={{ id: 'tz-time', value: time }} raw={time} mode={clock} onChange={(v) => {
            setTime(v);
            const m = parseTyped(v, clock);
            if (m !== null) write({ time: formatTyped(m, '24') });
          }} />
        </div>
        <div class="field">
          <label for="tz-from">{t('ui.from')}</label>
          <select id="tz-from" value={from} onChange={(e) => (setFrom(e.currentTarget.value), write({ from: e.currentTarget.value }))}>
            {(zones.length ? sorted : [from]).map(option)}
          </select>
        </div>
      </div>
      {dateText && !date && <p class="field-error">{t('calc.error.date')}</p>}
      {time && minutes === null && <p class="field-error">{t('calc.error.time')}</p>}

      <div class="table-wrap tz-table">
        <table>
          <tbody>
            {targets.map((z) => {
              const local = ms === null ? null : utcToZoned(z, ms);
              const shift = local && date ? daysBetween(date, local.date) : 0;
              return (
                <tr key={z}>
                  <td>
                    <strong>{cityName(z, lang)}</strong>
                    <br />
                    <span class="muted">
                      {ms === null ? z : `${formatOffset(offsetMinutes(z, ms))} · ${genericName(z, locale, ms) ?? z}`}
                    </span>
                  </td>
                  <td>
                    <strong class="tz-time">{local ? formatClock(lang, local.minutes, clock) : '—'}</strong>
                    <br />
                    <span class="muted">{local ? `${shortDate(local.date)}${shift ? ` (${t(shift > 0 ? 'ui.nextDay' : 'ui.prevDay')})` : ''}` : ''}</span>
                  </td>
                  <td>
                    <button type="button" class="btn btn-secondary btn-small" aria-label={t('ui.remove')} onClick={() => setTargetsAndUrl(targets.filter((x) => x !== z))}>
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div class="tz-add">
        <select aria-label={t('ui.addLabel')} value={adding} onChange={(e) => setAdding(e.currentTarget.value)}>
          <option value="">{t('ui.addLabel')}</option>
          {sorted.filter((z) => !targets.includes(z)).map(option)}
        </select>
        <button type="button" class="btn btn-small" disabled={!adding} onClick={() => (setTargetsAndUrl([...targets, adding]), setAdding(''))}>
          {t('ui.add')}
        </button>
      </div>
    </div>
  );
}
