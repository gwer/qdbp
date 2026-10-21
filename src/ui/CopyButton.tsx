import { useState } from 'preact/hooks';
import type { T } from '@/i18n/t';

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Старые браузеры и страницы без разрешения на буфер обмена.
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.append(el);
    el.select();
    // execCommand устарел, но это единственный запасной путь, когда Clipboard API недоступен. Оставлен намеренно;
    // вызов через узкий тип, чтобы проверка типов не помечала его как устаревший.
    const ok = (document as { execCommand(command: 'copy'): boolean }).execCommand('copy');
    el.remove();
    return ok;
  }
}

export function CopyButton({ text, t }: { text: string; t: T }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      class="btn btn-small"
      disabled={!text}
      onClick={async () => {
        if (await copy(text)) {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        }
      }}
    >
      {done ? t('common.copied') : t('common.copy')}
    </button>
  );
}
