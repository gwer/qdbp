import { useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';
import { PdfPicker, usePreload } from '@/ui/pdf/Picker';
import { pdfName } from '@/ui/pdf/pdflib';
import { Result, type OutFile } from '@/ui/pdf/Result';
import type { PdfSource } from '@/ui/pdf/source';
import { protect, type Restrictions } from './protect';

export function ProtectPdf({ lang, t }: ToolProps) {
  usePreload(false);
  const [source, setSource] = useState<PdfSource | null>(null);
  const [password, setPassword] = useState('');
  const [owner, setOwner] = useState('');
  const [show, setShow] = useState(false);
  const [r, setR] = useState<Restrictions>({ print: false, copy: false, edit: false });
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState<OutFile | null>(null);

  const restricted = r.print || r.copy || r.edit;
  const ownerError = restricted && owner && owner === password;
  const ready = !!password && (!restricted || (!!owner && !ownerError));
  const reset = () => {
    setResult(null);
    setFailed(false);
  };

  const run = async () => {
    if (!source) return;
    setBusy(true);
    reset();
    try {
      const bytes = await protect(source.bytes, source.password, password, owner, r);
      setResult({ name: pdfName(source.file.name, '_protected'), blob: new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' }) });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const type = show ? 'text' : 'password';
  return (
    <div>
      <PdfPicker t={t} lang={lang} source={source} onSource={(s) => (setSource(s), reset())} />
      {source && (
        <>
          <div class="calc-inputs">
            <div class="field">
              <label for="protect-pw">{t('ui.password')}</label>
              <input id="protect-pw" type={type} autoComplete="new-password" value={password} onInput={(e) => (setPassword(e.currentTarget.value), reset())} />
            </div>
          </div>
          <div class="checks">
            <label>
              <input type="checkbox" checked={show} onChange={(e) => setShow(e.currentTarget.checked)} /> {t('ui.show')}
            </label>
          </div>
          <fieldset class="checks pdf-fieldset">
            <legend>{t('ui.restrict')}</legend>
            {(['print', 'copy', 'edit'] as const).map((k) => (
              <label key={k}>
                <input type="checkbox" checked={r[k]} onChange={(e) => (setR({ ...r, [k]: e.currentTarget.checked }), reset())} /> {t(`ui.${k}`)}
              </label>
            ))}
          </fieldset>
          {restricted && (
            <div class="calc-inputs">
              <div class="field field-wide">
                <label for="protect-owner">{t('ui.owner')}</label>
                <input
                  id="protect-owner"
                  type={type}
                  autoComplete="new-password"
                  value={owner}
                  aria-invalid={ownerError ? 'true' : undefined}
                  onInput={(e) => (setOwner(e.currentTarget.value), reset())}
                />
                {ownerError ? <p class="field-error">{t('ui.ownerSame')}</p> : <p class="muted">{t('ui.ownerHint')}</p>}
              </div>
            </div>
          )}
          <p class="muted">{t('ui.remember')}</p>
          <div class="actions">
            <button type="button" class="btn" disabled={busy || !ready} onClick={() => void run()}>
              {busy ? t('pdf.working') : t('ui.protect')}
            </button>
          </div>
          {failed && (
            <p class="field-error" role="alert">
              {t('pdf.error')}
            </p>
          )}
          {result && <Result t={t} lang={lang} files={[result]} />}
        </>
      )}
    </div>
  );
}
