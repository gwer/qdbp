import { useMemo, useRef } from 'preact/hooks';

/**
 * Номер текущей операции. start() — новая операция, cancel() — отменить текущую (сменились файл или настройки),
 * live(id) — результат операции id ещё нужен. Результат отменённой операции не показывается: иначе
 * пользователь скачал бы файл со старыми настройками.
 */
export function useJob() {
  const n = useRef(0);
  return useMemo(
    () => ({
      start: () => ++n.current,
      cancel: () => {
        n.current++;
      },
      live: (id: number) => id === n.current,
    }),
    [],
  );
}
