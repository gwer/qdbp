// Каталог инструментов строится из файловой структуры src/tools/{category}/{tool}/.
// Используется только при сборке. Любая ошибка в файлах переводов валит сборку.
import type { MarkdownInstance } from 'astro';
import { SITE_LANGS, type Lang } from '@/i18n/config';
import type { Dict } from '@/i18n/t';
import type { CategoryDef, ToolDef } from '@/ui/define';
import { requiredToolKeys, validateFiles, type FileSet } from './validate';

const toolDefs = import.meta.glob<{ default: ToolDef }>('/src/tools/*/*/tool.ts', { eager: true });
const toolI18n = import.meta.glob<Dict>('/src/tools/*/*/i18n/*.json', { eager: true, import: 'default' });
const toolContent = import.meta.glob<MarkdownInstance<Record<string, unknown>>>('/src/tools/*/*/content/*.md', {
  eager: true,
});
const categoryDefs = import.meta.glob<{ default: CategoryDef }>('/src/tools/*/category.ts', { eager: true });
const categoryI18n = import.meta.glob<Dict>('/src/tools/*/i18n/*.json', { eager: true, import: 'default' });

export interface Tool {
  id: string;
  category: string;
  /** "category/id" — путь папки и URL без языка. */
  path: string;
  def: ToolDef;
  langs: Lang[];
  strings: Partial<Record<Lang, Dict>>;
  content: Partial<Record<Lang, MarkdownInstance<Record<string, unknown>>['Content']>>;
}

export interface Category {
  id: string;
  order: number;
  strings: Partial<Record<Lang, Dict>>;
  tools: Tool[];
  /** Языки, на которых в категории есть хотя бы один инструмент. */
  langs: Lang[];
}

const TOOL_FILE = /^\/src\/tools\/([^/]+)\/([^/]+)\/(i18n|content)\/([^/]+)\.(json|md)$/;
const CATEGORY_FILE = /^\/src\/tools\/([^/]+)\/i18n\/([^/]+)\.json$/;

function build() {
  const errors: string[] = [];
  const files = new Map<string, FileSet>();
  const fileSet = (path: string) => {
    let set = files.get(path);
    if (!set) files.set(path, (set = { i18n: {}, content: [] }));
    return set;
  };

  for (const [file, dict] of Object.entries(toolI18n)) {
    const [, cat, id, , lang] = file.match(TOOL_FILE)!;
    fileSet(`${cat}/${id}`).i18n[lang] = dict;
  }
  for (const file of Object.keys(toolContent)) {
    const [, cat, id, , lang] = file.match(TOOL_FILE)!;
    fileSet(`${cat}/${id}`).content.push(lang);
  }

  const tools: Tool[] = [];
  const seenIds = new Map<string, string>();
  for (const [file, mod] of Object.entries(toolDefs)) {
    const [, category, id] = file.match(/^\/src\/tools\/([^/]+)\/([^/]+)\/tool\.ts$/)!;
    const path = `${category}/${id}`;
    const set = fileSet(path);
    errors.push(...validateFiles(`tools/${path}`, set, requiredToolKeys(mod.default)));

    if (seenIds.has(id)) errors.push(`tools/${path}: id "${id}" уже занят инструментом tools/${seenIds.get(id)}`);
    seenIds.set(id, path);

    const langs = SITE_LANGS.filter((l) => l in set.i18n && set.content.includes(l));
    const content: Tool['content'] = {};
    for (const lang of langs) content[lang] = toolContent[`/src/tools/${path}/content/${lang}.md`].Content;
    tools.push({ id, category, path, def: mod.default, langs, strings: set.i18n, content });
  }

  for (const path of files.keys()) {
    if (!tools.some((t) => t.path === path)) errors.push(`tools/${path}: есть переводы, но нет tool.ts`);
  }
  for (const tool of tools) {
    for (const rel of tool.def.related ?? []) {
      if (!seenIds.has(rel)) errors.push(`tools/${tool.path}: в related неизвестный инструмент "${rel}"`);
    }
  }

  const catStrings = new Map<string, Record<string, Dict>>();
  for (const [file, dict] of Object.entries(categoryI18n)) {
    const [, cat, lang] = file.match(CATEGORY_FILE)!;
    if (!catStrings.has(cat)) catStrings.set(cat, {});
    catStrings.get(cat)![lang] = dict;
  }

  const categories: Category[] = [];
  const categoryIds = new Set([...tools.map((t) => t.category), ...catStrings.keys()]);
  for (const id of categoryIds) {
    const def = categoryDefs[`/src/tools/${id}/category.ts`]?.default;
    if (!def) {
      errors.push(`tools/${id}: нет category.ts`);
      continue;
    }
    const strings = catStrings.get(id) ?? {};
    errors.push(...validateFiles(`tools/${id} (категория)`, { i18n: strings, content: [] }, ['name', 'description'], false));
    const catTools = tools.filter((t) => t.category === id);
    const langs = SITE_LANGS.filter((l) => catTools.some((t) => t.langs.includes(l)));
    for (const lang of langs) {
      if (!strings[lang]) errors.push(`tools/${id}: на ${lang} есть инструменты, но нет i18n/${lang}.json категории`);
    }
    categories.push({ id, order: def.order, strings, tools: catTools, langs });
  }
  categories.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

  if (errors.length) throw new Error(`Ошибки в src/tools:\n  - ${errors.join('\n  - ')}`);
  return { tools, categories };
}

export const { tools, categories } = build();

export const toolById = (id: string) => tools.find((t) => t.id === id);

export const toolTitle = (tool: Tool, lang: Lang) => tool.strings[lang]!.title as string;
export const categoryName = (cat: Category, lang: Lang) => cat.strings[lang]!.name as string;

export const toolUrl = (tool: Tool, lang: Lang) => `/${lang}/${tool.path}/`;
export const categoryUrl = (cat: Category, lang: Lang) => `/${lang}/${cat.id}/`;

export const toolsIn = (cat: Category, lang: Lang) => cat.tools.filter((t) => t.langs.includes(lang));
