import type { ExtraProps } from '@/ui/define';
import type { fractions } from './tool';

export function Steps({ result, t }: ExtraProps<unknown, ReturnType<typeof fractions>>) {
  return (
    <details class="extra" open>
      <summary>{t('ui.solution')}</summary>
      <ol class="steps">
        {result.steps.map((s, i) => (
          <li key={i}>{t(`ui.steps.${s.key}`, s.params)}</li>
        ))}
      </ol>
    </details>
  );
}
