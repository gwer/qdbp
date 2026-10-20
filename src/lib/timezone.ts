// Часовые пояса через Intl: база поясов и правила летнего времени — из браузера (IANA tzdata).

const dtfCache = new Map<string, Intl.DateTimeFormat>();
function parts(zone: string, ms: number) {
  let f = dtfCache.get(zone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    dtfCache.set(zone, f);
  }
  const p = Object.fromEntries(f.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour, mi: +p.minute, s: +p.second };
}

/** Смещение пояса от UTC в минутах в момент ms (например, +180 для Москвы). */
export function offsetMinutes(zone: string, ms: number): number {
  const p = parts(zone, ms);
  return Math.round((Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - Math.floor(ms / 1000) * 1000) / 60000);
}

/**
 * Момент UTC для «настенного» времени в поясе. Для несуществующего времени (весенний перевод часов)
 * берётся время после перевода, для повторяющегося (осенний) — первое из двух.
 */
export function zonedToUtc(zone: string, date: string, minutes: number): number {
  const [y, mo, d] = date.split('-').map(Number);
  const local = Date.UTC(y, mo - 1, d) + minutes * 60000;
  let ms = local - offsetMinutes(zone, local) * 60000;
  const o2 = offsetMinutes(zone, ms);
  ms = local - o2 * 60000;
  // Осенний перевод: если и предыдущее смещение даёт то же местное время — берём более ранний момент.
  const earlier = local - offsetMinutes(zone, ms - 3600000) * 60000;
  if (earlier < ms && offsetMinutes(zone, earlier) === offsetMinutes(zone, ms - 3600000)) ms = earlier;
  return ms;
}

/** Местные дата ('YYYY-MM-DD') и время (минуты от полуночи) в поясе для момента ms. */
export function utcToZoned(zone: string, ms: number): { date: string; minutes: number } {
  const p = parts(zone, ms);
  const date = `${String(p.y).padStart(4, '0')}-${String(p.mo).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
  return { date, minutes: p.h * 60 + p.mi };
}

export const formatOffset = (min: number) => {
  const sign = min < 0 ? '−' : '+';
  const a = Math.abs(min);
  return `UTC${sign}${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`;
};

/** «America/New_York» → «New York», «America/Argentina/Buenos_Aires» → «Buenos Aires». */
export const cityOf = (zone: string) => (zone === 'UTC' ? 'UTC' : zone.split('/').pop()!.replace(/_/g, ' '));

export function allZones(): string[] {
  const list = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [];
  return list.includes('UTC') ? list : ['UTC', ...list];
}
