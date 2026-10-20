import { useState } from 'preact/hooks';
import { listItems, splitIntoGroups } from '@/lib/random';
import type { ToolProps } from '@/ui/define';

export function TeamGenerator({ t }: ToolProps) {
  const [text, setText] = useState('');
  const [teams, setTeams] = useState(2);
  const [result, setResult] = useState<string[][] | null>(null);
  const items = listItems(text);
  const n = Math.min(Math.max(2, teams), Math.max(2, items.length));

  return (
    <div>
      <div class="field">
        <label for="tg-list">{t('ui.list')}</label>
        <textarea id="tg-list" rows={8} placeholder={t('ui.placeholder')} value={text} onInput={(e) => (setText(e.currentTarget.value), setResult(null))} />
      </div>
      <div class="calc-inputs">
        <div class="field">
          <label for="tg-teams">{t('ui.teams')}</label>
          <input id="tg-teams" type="text" inputMode="numeric" value={String(teams)} onInput={(e) => setTeams(Number(e.currentTarget.value) || 2)} />
        </div>
      </div>
      <div class="actions">
        <button type="button" class="btn" disabled={items.length < 2} onClick={() => setResult(splitIntoGroups(items, n))}>
          {t('ui.split')}
        </button>
        <span class="muted">{t('ui.people', { count: items.length })}</span>
      </div>
      {result && (
        <div class="teams" aria-live="polite">
          {result.map((team, i) => (
            <div class="team" key={i}>
              <strong>{t('ui.team', { n: i + 1 })}</strong>
              <ul>
                {team.map((m, j) => (
                  <li key={j}>{m}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
