import { useEffect, useState } from 'preact/hooks';
import { formatNumber } from '@/lib/format';
import type { ExtraProps } from '@/ui/define';
import { splitDuration } from './timer';

/** Живой отсчёт до момента из результата; обновляется раз в секунду. */
export function Countdown({ result, lang, t }: ExtraProps<unknown, { date: string; when: number }>) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const d = splitDuration(result.when - now);
  const n = (v: number) => formatNumber(lang, v, 'integer');
  const parts = [
    ['days', d.days],
    ['hours', d.hours],
    ['minutes', d.minutes],
    ['seconds', d.seconds],
  ] as const;

  return (
    <section class="countdown-box">
      <h2 class="countdown-title">{t(d.past ? 'ui.since' : 'ui.until')}</h2>
      <div class="countdown" role="timer">
        {parts.map(([key, value]) => (
          <div key={key}>
            <strong>{key === 'days' ? n(value) : String(value).padStart(2, '0')}</strong>
            <span>{t(`ui.${key}`, { count: value })}</span>
          </div>
        ))}
      </div>
      <p class="muted">
        {t('ui.totals', {
          weeks: t('ui.weeks', { count: Math.floor(d.days / 7), n: n(Math.floor(d.days / 7)) }),
          hours: n(d.totalHours),
          minutes: n(d.totalMinutes),
        })}
      </p>
    </section>
  );
}
