import type { ComponentChildren } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { formatNumber } from '@/lib/format';
import { Toggle } from '@/ui/Calculator';
import type { ToolProps } from '@/ui/define';
import { diffTexts, type Block, type Line } from './diff';

/** Сколько одинаковых строк показывать вокруг изменений, когда остальные скрыты. */
const CONTEXT = 3;
/** Уже этого «рядом» не помещается: показываем единым списком. */
const NARROW = '(max-width: 640px)';

type Mode = 'split' | 'unified';

const text = (l: Line) =>
  l.parts ? l.parts.map((p, i) => (p.changed ? <mark key={i}>{p.text}</mark> : p.text)) : l.text;

/** Одинаковые строки блока, которые надо показать, и сколько скрыто между ними. */
function visible(bl: Block, first: boolean, last: boolean, collapse: boolean): { head: number; hidden: number; tail: number } {
  const n = bl.a.length;
  const head = first ? 0 : CONTEXT;
  const tail = last ? 0 : CONTEXT;
  // Скрывать одну-две строки бессмысленно: разделитель займёт столько же места.
  if (!collapse || n <= head + tail + 2) return { head: n, hidden: 0, tail: 0 };
  return { head, hidden: n - head - tail, tail };
}

export function TextDiff({ lang, t }: ToolProps) {
  const [a, setA] = useState(() => t('ui.sampleA'));
  const [b, setB] = useState(() => t('ui.sampleB'));
  const [mode, setMode] = useState<Mode>('split');
  const [collapse, setCollapse] = useState(true);
  // До гидратации ширина экрана неизвестна — единый список подходит для любой.
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = matchMedia(NARROW);
    const update = () => setWide(!mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const { blocks, added, removed } = useMemo(() => diffTexts(a, b), [a, b]);
  const view: Mode = wide ? mode : 'unified';
  const same = added === 0 && removed === 0;

  const rows: ComponentChildren[] = [];
  blocks.forEach((bl, bi) => {
    if (bl.kind === 'equal') {
      const { head, hidden, tail } = visible(bl, bi === 0, bi === blocks.length - 1, collapse);
      const eq = (k: number) =>
        view === 'split' ? (
          <tr key={`e${bl.a[k].no}`}>
            <td class="diff-no">{bl.a[k].no}</td>
            <td class="diff-text">{bl.a[k].text}</td>
            <td class="diff-no">{bl.b[k].no}</td>
            <td class="diff-text">{bl.b[k].text}</td>
          </tr>
        ) : (
          <tr key={`e${bl.a[k].no}`}>
            <td class="diff-no">{bl.a[k].no}</td>
            <td class="diff-no">{bl.b[k].no}</td>
            <td class="diff-text">{bl.a[k].text}</td>
          </tr>
        );
      for (let k = 0; k < head; k++) rows.push(eq(k));
      if (hidden)
        rows.push(
          <tr key={`h${bl.a[head].no}`} class="diff-skip">
            <td colSpan={view === 'split' ? 4 : 3}>{t('ui.hidden', { count: hidden, n: formatNumber(lang, hidden, 'integer') })}</td>
          </tr>,
        );
      for (let k = bl.a.length - tail; k < bl.a.length; k++) rows.push(eq(k));
    } else if (view === 'split') {
      for (let k = 0; k < Math.max(bl.a.length, bl.b.length); k++) {
        const l = bl.a[k];
        const r = bl.b[k];
        rows.push(
          <tr key={`c${l?.no}-${r?.no}`}>
            <td class="diff-no">{l?.no}</td>
            <td class={l ? 'diff-text diff-del' : 'diff-none'}>{l && text(l)}</td>
            <td class="diff-no">{r?.no}</td>
            <td class={r ? 'diff-text diff-ins' : 'diff-none'}>{r && text(r)}</td>
          </tr>,
        );
      }
    } else {
      for (const l of bl.a)
        rows.push(
          <tr key={`d${l.no}`} class="diff-del">
            <td class="diff-no">{l.no}</td>
            <td class="diff-no" />
            <td class="diff-text">{text(l)}</td>
          </tr>,
        );
      for (const r of bl.b)
        rows.push(
          <tr key={`i${r.no}`} class="diff-ins">
            <td class="diff-no" />
            <td class="diff-no">{r.no}</td>
            <td class="diff-text">{text(r)}</td>
          </tr>,
        );
    }
  });

  return (
    <div>
      <div class="diff-inputs">
        <div class="field">
          <label for="diff-a">{t('ui.original')}</label>
          <textarea id="diff-a" rows={8} spellcheck={false} value={a} onInput={(e) => setA(e.currentTarget.value)} />
        </div>
        <div class="field">
          <label for="diff-b">{t('ui.changed')}</label>
          <textarea id="diff-b" rows={8} spellcheck={false} value={b} onInput={(e) => setB(e.currentTarget.value)} />
        </div>
      </div>
      <div class="actions">
        <button
          type="button"
          class="btn btn-small btn-secondary"
          onClick={() => {
            setA(b);
            setB(a);
          }}
        >
          {t('ui.swap')}
        </button>
      </div>

      {same ? (
        <p class="diff-stats">{t('ui.same')}</p>
      ) : (
        <>
          <p class="diff-stats">
            <span class="diff-stat-ins">{t('ui.added', { n: formatNumber(lang, added, 'integer') })}</span>
            <span class="diff-stat-del">{t('ui.removed', { n: formatNumber(lang, removed, 'integer') })}</span>
          </p>
          <div class="diff-options">
            {wide && (
              <Toggle
                label={t('ui.view')}
                value={mode}
                options={[
                  ['split', t('ui.split')],
                  ['unified', t('ui.unified')],
                ]}
                onChange={setMode}
              />
            )}
            <label class="diff-collapse">
              <input type="checkbox" checked={collapse} onChange={(e) => setCollapse(e.currentTarget.checked)} /> {t('ui.collapse')}
            </label>
          </div>
          <table class={`diff diff-${view}`}>
            <colgroup>
              {view === 'split' ? (
                <>
                  <col class="diff-col-no" />
                  <col />
                  <col class="diff-col-no" />
                  <col />
                </>
              ) : (
                <>
                  <col class="diff-col-no" />
                  <col class="diff-col-no" />
                  <col />
                </>
              )}
            </colgroup>
            <tbody>{rows}</tbody>
          </table>
        </>
      )}
    </div>
  );
}
