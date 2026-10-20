// Календарные даты без времени и часовых поясов.
// Дата хранится как строка ISO 'YYYY-MM-DD' (так её отдаёт <input type="date">),
// для арифметики переводится в номер дня от 1970-01-01 (UTC).

const DAY_MS = 86_400_000;
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Номер дня от 1970-01-01 или null, если строка — не реальная дата. */
export function dayNumber(iso: string): number | null {
  const m = ISO.exec(iso);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const ms = Date.UTC(y, mo - 1, d);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return null;
  return ms / DAY_MS;
}

export const isValidDate = (iso: string) => dayNumber(iso) !== null;

export function fromDayNumber(day: number): string {
  return new Date(day * DAY_MS).toISOString().slice(0, 10);
}

const parts = (iso: string) => iso.split('-').map(Number) as [number, number, number];
const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate(); // m: 1–12

/** Сегодняшняя дата по локальному времени пользователя. Только на клиенте. */
export function todayISO(): string {
  const now = new Date();
  return fromDayNumber(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / DAY_MS);
}

export const addDays = (iso: string, n: number) => fromDayNumber(dayNumber(iso)! + n);

/** Прибавляет месяцы; если такого числа нет (31 января + 1 месяц), берётся последний день месяца. */
export function addMonths(iso: string, n: number): string {
  const [y, m, d] = parts(iso);
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  const nd = Math.min(d, daysInMonth(ny, nm));
  return `${String(ny).padStart(4, '0')}-${String(nm).padStart(2, '0')}-${String(nd).padStart(2, '0')}`;
}

export const daysBetween = (from: string, to: string) => dayNumber(to)! - dayNumber(from)!;

/**
 * Полных лет, месяцев и дней от from до to (to ≥ from), как считают возраст:
 * сначала целые месяцы (с учётом коротких месяцев), затем остаток дней.
 */
export function diffYMD(from: string, to: string): { years: number; months: number; days: number } {
  const [fy, fm, fd] = parts(from);
  const [ty, tm, td] = parts(to);
  let months = (ty - fy) * 12 + (tm - fm);
  if (td < fd) months--;
  const anchor = addMonths(from, months);
  const days = daysBetween(anchor, to);
  return { years: Math.floor(months / 12), months: months % 12, days };
}

/** День недели: 0 — понедельник … 6 — воскресенье. */
export const weekday = (iso: string) => (dayNumber(iso)! + 3) % 7; // 1970-01-01 — четверг

/** Количество будних дней (пн–пт) в полуинтервале [from, to). */
export function weekdaysBetween(from: string, to: string): number {
  let a = dayNumber(from)!;
  const b = dayNumber(to)!;
  if (b <= a) return 0;
  let count = Math.floor((b - a) / 7) * 5;
  for (a += Math.floor((b - a) / 7) * 7; a < b; a++) if ((a + 3) % 7 < 5) count++;
  return count;
}

/** Неделя по ISO 8601: недели с понедельника, первая неделя содержит первый четверг года. */
export function isoWeek(iso: string): { week: number; year: number; start: string; end: string } {
  const day = dayNumber(iso)!;
  const start = day - weekday(iso);
  const thursday = start + 3;
  const year = new Date(thursday * DAY_MS).getUTCFullYear();
  const jan1 = Date.UTC(year, 0, 1) / DAY_MS;
  const week = Math.floor((thursday - jan1) / 7) + 1;
  return { week, year, start: fromDayNumber(start), end: fromDayNumber(start + 6) };
}

/** Неделя по системе США: недели с воскресенья, первая неделя содержит 1 января. */
export function usWeek(iso: string): { week: number; year: number; start: string; end: string } {
  const day = dayNumber(iso)!;
  const start = day - ((weekday(iso) + 1) % 7);
  const year = Number(iso.slice(0, 4));
  const jan1 = Date.UTC(year, 0, 1) / DAY_MS;
  const firstStart = jan1 - ((weekday(fromDayNumber(jan1)) + 1) % 7);
  return { week: Math.floor((start - firstStart) / 7) + 1, year, start: fromDayNumber(start), end: fromDayNumber(start + 6) };
}

/**
 * Значение по умолчанию для поля даты: 'YYYY-MM-DD', 'today', 'today+30', 'today-7'
 * или 'next-MM-DD' — ближайшая такая дата после сегодняшней (например, Новый год).
 * Относительные значения на сервере дают null — «сегодня» известно только в браузере.
 */
export function resolveDateDefault(spec: string, today: string | null): string | null {
  const m = /^today([+-]\d+)?$/.exec(spec);
  const next = /^next-(\d\d-\d\d)$/.exec(spec);
  if (!m && !next) return spec;
  if (!today) return null;
  if (next) {
    const year = Number(today.slice(0, 4));
    const candidate = `${year}-${next[1]}`;
    return candidate > today ? candidate : `${year + 1}-${next[1]}`;
  }
  return m![1] ? addDays(today, Number(m![1])) : today;
}
