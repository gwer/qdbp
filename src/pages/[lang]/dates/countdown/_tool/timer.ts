/** Момент события по местным часам браузера, мс от эпохи. time — минуты от полуночи. */
export function localMoment(date: string, time: number): number {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, Math.floor(time / 60), time % 60).getTime();
}

/** Разбивка оставшегося (или прошедшего) времени на дни, часы, минуты и секунды. */
export function splitDuration(ms: number) {
  const past = ms < 0;
  const s = Math.floor(Math.abs(ms) / 1000);
  return {
    past,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    totalHours: Math.floor(s / 3600),
    totalMinutes: Math.floor(s / 60),
  };
}
