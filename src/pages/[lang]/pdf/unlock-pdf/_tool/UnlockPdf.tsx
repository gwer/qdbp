import { useEffect, useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';
import { PdfPicker, usePreload } from '@/ui/pdf/Picker';
import { openPdf, pdfName, saveBlob } from '@/ui/pdf/pdflib';
import { Result, type OutFile } from '@/ui/pdf/Result';
import type { PdfSource } from '@/ui/pdf/source';

/** Что было защищено: пароль на открытие, только ограничения или ничего. */
type Kind = 'password' | 'restricted' | 'none';

export function UnlockPdf({ lang, t }: ToolProps) {
  usePreload(true);
  const [source, setSource] = useState<PdfSource | null>(null);
  const [kind, setKind] = useState<Kind | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState<OutFile | null>(null);

  useEffect(() => {
    setKind(null);
    if (!source) return;
    if (source.password !== undefined) return setKind('password');
    // У незашифрованного файла pdf.js не сообщает прав; у зашифрованного — набор разрешённых действий.
    let alive = true;
    source.doc.getPermissions().then(
      (p) => alive && setKind(p ? 'restricted' : 'none'),
      () => alive && setKind('none'),
    );
    return () => {
      alive = false;
    };
  }, [source]);

  const run = async () => {
    if (!source) return;
    setBusy(true);
    setFailed(false);
    try {
      const doc = await openPdf(source.bytes, source.password);
      setResult({ name: pdfName(source.file.name, '_unlocked'), blob: await saveBlob(doc) });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PdfPicker
        t={t}
        lang={lang}
        source={source}
        onSource={(s) => {
          setSource(s);
          setResult(null);
          setFailed(false);
        }}
      />
      {source && kind && (
        <>
          <p>{t(`ui.kind.${kind}`)}</p>
          {kind !== 'none' && (
            <div class="actions">
              <button type="button" class="btn" disabled={busy} onClick={() => void run()}>
                {busy ? t('pdf.working') : t('ui.unlock')}
              </button>
            </div>
          )}
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
