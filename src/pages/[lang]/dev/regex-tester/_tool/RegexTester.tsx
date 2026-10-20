import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { formatNumber } from '@/lib/format';
import { CopyButton } from '@/ui/CopyButton';
import type { ToolProps } from '@/ui/define';
import { FLAGS, MATCH_LIMIT, runJob, type Job, type JobResult, type Match } from './regex';

const SAMPLE_PATTERN = '(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})';
/** Дольше этого выражение считаем зависшим (катастрофический перебор) и останавливаем. */
const TIMEOUT_MS = 2000;

type Result = JobResult | { ok: false; timeout: true };

/** Текст с подсвеченными совпадениями; пустые совпадения — тонкой отметкой. */
function highlight(text: string, matches: Match[]) {
  const out: ComponentChildren[] = [];
  let pos = 0;
  matches.forEach((m, i) => {
    if (m.index > pos) out.push(text.slice(pos, m.index));
    out.push(<mark key={i} class={m.text ? `rx-m${i % 2}` : 'rx-empty'}>{m.text}</mark>);
    pos = m.index + m.text.length;
  });
  out.push(text.slice(pos));
  return out;
}

export function RegexTester({ lang, t }: ToolProps) {
  const [pattern, setPattern] = useState(SAMPLE_PATTERN);
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState(() => t('ui.sampleText'));
  const [replaceOn, setReplaceOn] = useState(true);
  const [replacement, setReplacement] = useState(() => t('ui.sampleReplacement'));
  const job: Job = { pattern, flags, text, replacement: replaceOn ? replacement : null };
  // Пример по умолчанию безопасен — считаем сразу (и при пререндере), остальное — в воркере.
  const [result, setResult] = useState<Result>(() => runJob(job));

  const worker = useRef<Worker | null>(null);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const first = useRef(true);

  const stop = () => {
    worker.current?.terminate();
    worker.current = null;
    busy.current = false;
  };

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // Предыдущий расчёт ещё идёт — он уже не нужен, а может и зависнуть: начинаем с нового воркера.
    if (busy.current) stop();
    clearTimeout(timer.current);
    if (!worker.current) {
      const w = new Worker(new URL('./regex.worker.ts', import.meta.url), { type: 'module' });
      w.onmessage = (e: MessageEvent<JobResult>) => {
        busy.current = false;
        clearTimeout(timer.current);
        setResult(e.data);
      };
      worker.current = w;
    }
    busy.current = true;
    worker.current.postMessage(job);
    timer.current = setTimeout(() => {
      stop();
      setResult({ ok: false, timeout: true });
    }, TIMEOUT_MS);
  }, [pattern, flags, text, replacement, replaceOn]);

  useEffect(() => () => (clearTimeout(timer.current), stop()), []);

  const toggleFlag = (f: string) => setFlags(FLAGS.filter((x) => (x === f) !== flags.includes(x)).join(''));
  const count = result.ok ? result.matches.length : 0;

  return (
    <div>
      <div class="field">
        <label for="rx-pattern">{t('ui.pattern')}</label>
        <div class="rx-pattern">
          <span class="mono muted">/</span>
          <input
            id="rx-pattern"
            type="text"
            class="mono"
            autoComplete="off"
            autoCapitalize="off"
            spellcheck={false}
            value={pattern}
            aria-invalid={!result.ok ? 'true' : undefined}
            onInput={(e) => setPattern(e.currentTarget.value)}
          />
          <span class="mono muted">/{flags}</span>
        </div>
      </div>
      <fieldset class="checks rx-flags">
        <legend class="visually-hidden">{t('ui.flagsLabel')}</legend>
        {FLAGS.map((f) => (
          <label key={f}>
            <input type="checkbox" checked={flags.includes(f)} onChange={() => toggleFlag(f)} />
            <span>
              <b class="mono">{f}</b> {t(`ui.flags.${f}`)}
            </span>
          </label>
        ))}
      </fieldset>
      <div class="field">
        <label for="rx-text">{t('ui.text')}</label>
        <textarea id="rx-text" class="mono" rows={6} spellcheck={false} value={text} onInput={(e) => setText(e.currentTarget.value)} />
      </div>

      {!result.ok ? (
        <p class="field-error" role="alert">
          {'timeout' in result ? t('ui.timeout', { seconds: TIMEOUT_MS / 1000 }) : `${t('ui.syntaxError')}: ${result.error}`}
        </p>
      ) : (
        <>
          <p class="rx-count">
            {count ? t('ui.count', { count, n: formatNumber(lang, count, 'integer') }) : t('ui.noMatches')}
            {result.truncated && <span class="muted"> {t('ui.truncated', { limit: formatNumber(lang, MATCH_LIMIT, 'integer') })}</span>}
          </p>
          {text && <div class="rx-highlight mono">{highlight(text, result.matches)}</div>}
          {count > 0 && (
            <div class="table-wrap rx-table">
              <table>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">{t('ui.index')}</th>
                    <th scope="col">{t('ui.match')}</th>
                    {result.matches[0].groups.length > 0 && <th scope="col">{t('ui.groups')}</th>}
                  </tr>
                </thead>
                <tbody>
                  {result.matches.map((m, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{m.index}</td>
                      <td class="mono">{m.text || <span class="muted">{t('ui.empty')}</span>}</td>
                      {m.groups.length > 0 && (
                        <td class="mono">
                          {m.groups.map((g) => (
                            <div key={g.n}>
                              <span class="muted">{g.name ? `${g.n} ${g.name}` : g.n}:</span>{' '}
                              {g.value === undefined ? <span class="muted">—</span> : g.value}
                            </div>
                          ))}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <label class="rx-replace-toggle">
        <input type="checkbox" checked={replaceOn} onChange={(e) => setReplaceOn(e.currentTarget.checked)} /> {t('ui.replace')}
      </label>
      {replaceOn && (
        <>
          <div class="field">
            <label for="rx-repl">{t('ui.replacement')}</label>
            <input
              id="rx-repl"
              type="text"
              class="mono"
              autoComplete="off"
              autoCapitalize="off"
              spellcheck={false}
              value={replacement}
              onInput={(e) => setReplacement(e.currentTarget.value)}
            />
          </div>
          <div class="field">
            <label for="rx-out">{t('ui.result')}</label>
            <textarea id="rx-out" class="mono" rows={4} readOnly value={result.ok ? (result.replaced ?? '') : ''} />
          </div>
          <div class="actions">
            <CopyButton text={result.ok ? (result.replaced ?? '') : ''} t={t} />
          </div>
        </>
      )}
    </div>
  );
}
