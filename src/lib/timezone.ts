// Часовые пояса через Intl: база поясов и правила летнего времени — из браузера (IANA tzdata).

const DAY_MS = 86400000;

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
  // Смещения за сутки до и после: если между ними был перевод часов, это смещения по обе стороны от него.
  const before = local - offsetMinutes(zone, local - DAY_MS) * 60000;
  const after = local - offsetMinutes(zone, local + DAY_MS) * 60000;
  const valid = (ms: number) => offsetMinutes(zone, ms) * 60000 === local - ms;
  if (valid(before)) return valid(after) ? Math.min(before, after) : before; // осенью подходят оба — берём первое
  if (valid(after)) return after;
  return before; // весенний пропуск: со «старым» смещением получаем время после перевода
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
