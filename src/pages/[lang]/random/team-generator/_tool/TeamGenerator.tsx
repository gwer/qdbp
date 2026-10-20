import { useState } from 'preact/hooks';
import { listItems, splitIntoGroups } from '@/lib/random';
import { CopyButton } from '@/ui/CopyButton';
import type { ToolProps } from '@/ui/define';
import { IntField, SelectField } from '@/ui/files/fields';

export function TeamGenerator({ t }: ToolProps) {
  const [text, setText] = useState('');
  const [by, setBy] = useState<'teams' | 'size'>('teams');
  const [teams, setTeams] = useState(2);
  const [size, setSize] = useState(3);
  const [result, setResult] = useState<string[][] | null>(null);
  const items = listItems(text);
  // «По N человек» — команд столько, чтобы в каждой было не больше N.
  const wanted = by === 'size' ? Math.ceil(items.length / size) : teams;
  const n = Math.min(Math.max(2, wanted), Math.max(2, items.length));

  return (
    <div>
      <div class="field">
        <label for="tg-list">{t('ui.list')}</label>
        <textarea id="tg-list" rows={8} placeholder={t('ui.placeholder')} value={text} onInput={(e) => (setText(e.currentTarget.value), setResult(null))} />
      </div>
      <div class="calc-inputs">
        <SelectField
          id="tg-by"
          label={t('ui.by')}
          value={by}
          options={[
            ['teams', t('ui.byTeams')],
            ['size', t('ui.bySize')],
          ]}
          onChange={(v) => (setBy(v), setResult(null))}
        />
        {by === 'teams' ? (
          <IntField key="teams" id="tg-teams" label={t('ui.teams')} value={teams} min={2} max={1000} onChange={setTeams} />
        ) : (
          <IntField key="size" id="tg-size" label={t('ui.size')} value={size} min={1} max={1000} onChange={setSize} />
        )}
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
      {result && (
        <div class="actions">
          <CopyButton text={result.map((team, i) => `${t('ui.team', { n: i + 1 })}\n${team.join('\n')}`).join('\n\n')} t={t} />
        </div>
      )}
    </div>
  );
}
