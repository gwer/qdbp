import { isKnownLang } from '@/i18n/config';
import { isPlural, type Dict } from '@/i18n/t';
import type { InputSpec, ToolDef } from '@/ui/define';

// Объект форм множественного числа считается одним ключом: формы у языков разные.
export function flattenKeys(dict: Dict, prefix = ''): string[] {
  return Object.entries(dict).flatMap(([k, v]) =>
    typeof v === 'string' || isPlural(v) ? [prefix + k] : flattenKeys(v, `${prefix}${k}.`),
  );
}

export function requiredToolKeys(def: ToolDef): string[] {
  const keys = ['title', 'description'];
  if (def.kind !== 'calculator') return keys;
  for (const [name, spec] of Object.entries<InputSpec>(def.inputs)) {
    keys.push(`inputs.${name}.label`);
    if (spec.type === 'select') keys.push(...spec.options.map((o) => `inputs.${name}.options.${o}`));
  }
  for (const name of Object.keys(def.outputs)) keys.push(`outputs.${name}.label`);
  for (const key of def.errors ?? []) keys.push(`errors.${key}`);
  return keys;
}

export interface FileSet {
  /** Коды языков из имён JSON-файлов. */
  i18n: Record<string, Dict>;
  /** Коды языков из имён Markdown-файлов. */
  content: string[];
}

/**
 * Проверяет переводы одной сущности (инструмента или категории).
 * Возвращает список ошибок; пустой — всё в порядке.
 */
export function validateFiles(name: string, files: FileSet, required: string[], needContent = true): string[] {
  const errors: string[] = [];
  const jsonLangs = Object.keys(files.i18n);
  const allLangs = new Set([...jsonLangs, ...files.content]);

  for (const lang of allLangs) {
    if (!isKnownLang(lang)) errors.push(`${name}: неизвестный код языка "${lang}"`);
  }
  if (jsonLangs.length === 0) errors.push(`${name}: нет ни одного языка`);

  if (needContent) {
    for (const lang of jsonLangs) {
      if (!files.content.includes(lang)) errors.push(`${name}: есть i18n/${lang}.json, но нет content/${lang}.md`);
    }
    for (const lang of files.content) {
      if (!jsonLangs.includes(lang)) errors.push(`${name}: есть content/${lang}.md, но нет i18n/${lang}.json`);
    }
  }

  let reference: { lang: string; keys: Set<string> } | undefined;
  for (const lang of jsonLangs) {
    const keys = new Set(flattenKeys(files.i18n[lang]));
    const missing = required.filter((k) => !keys.has(k));
    if (missing.length) errors.push(`${name} [${lang}]: нет ключей ${missing.join(', ')}`);

    if (!reference) {
      reference = { lang, keys };
      continue;
    }
    const extra = [...keys].filter((k) => !reference!.keys.has(k));
    const lacking = [...reference.keys].filter((k) => !keys.has(k));
    if (extra.length || lacking.length) {
      errors.push(
        `${name}: наборы ключей ${reference.lang} и ${lang} различаются` +
          (lacking.length ? `; в ${lang} нет: ${lacking.join(', ')}` : '') +
          (extra.length ? `; в ${lang} лишние: ${extra.join(', ')}` : ''),
      );
    }
  }
  return errors;
}
