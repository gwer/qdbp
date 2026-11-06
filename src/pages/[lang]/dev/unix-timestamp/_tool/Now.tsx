import { useEffect, useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';

/** Текущий Unix timestamp. Только в браузере: при сборке «сейчас» не вычисляется. */
export function Now({ t }: ToolProps) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Math.floor(Date.now() / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <p class="muted">
      {t('ui.now')}: <code>{now ?? '—'}</code>
    </p>
  );
}
