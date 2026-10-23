// Каталог строится из файловой структуры src/pages/[lang]/{category}/{tool}/:
//   {category}/index.astro — страница категории (одинаковая у всех категорий)
//   {category}/_category/  — category.ts + i18n/{lang}.json
//   {category}/{tool}/index.astro — страница (одинаковая у всех инструментов)
//   {category}/{tool}/_tool/ — tool.ts, i18n/{lang}.json, content/{lang}.md, тесты, код
// Используется только при сборке. Любая ошибка в файлах переводов валит сборку.
// Первый сегмент пути в glob — `*`, а не `[lang]`: квадратные скобки в glob — класс символов.
import type { MarkdownInstance } from 'astro';
import { SITE_LANGS, type Lang } from '@/i18n/config';
import type { Dict } from '@/i18n/t';
import { UI } from '@/i18n/ui';
import type { CategoryDef, InputSpec, ToolDef } from '@/ui/define';
import type { IslandProps } from '@/ui/ToolRoot';
import { requiredToolKeys, validateFiles, type FileSet } from './validate';

const toolDefs = import.meta.glob<ToolDef>('/src/pages/*/*/*/_tool/tool.ts', { eager: true, import: 'def' });
const toolPages = import.meta.glob('/src/pages/*/*/*/index.astro');
const toolI18n = import.meta.glob<Dict>('/src/pages/*/*/*/_tool/i18n/*.json', { eager: true, import: 'default' });
const toolContent = import.meta.glob<MarkdownInstance<Record<string, unknown>>>(
  '/src/pages/*/*/*/_tool/content/*.md',
  { eager: true },
);
const categoryDefs = import.meta.glob<CategoryDef>('/src/pages/*/*/_category/category.ts', {
  eager: true,
  import: 'default',
});
const categoryPages = import.meta.glob('/src/pages/*/*/index.astro');
const categoryI18n = import.meta.glob<Dict>('/src/pages/*/*/_category/i18n/*.json', { eager: true, import: 'default' });
const categoryIcons = import.meta.glob<string>('/src/pages/*/*/_category/icon.svg', { eager: true, query: '?raw', import: 'default' });

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
  def: CategoryDef;
  order: number;
  strings: Partial<Record<Lang, Dict>>;
  /** Inline SVG из _category/icon.svg (Lucide). */
  icon: string;
  tools: Tool[];
  /** Языки, на которых в категории есть хотя бы один инструмент. */
  langs: Lang[];
}

const ROOT = '/src/pages/[lang]';
const TOOL_FILE = /^\/src\/pages\/[^/]+\/([^/]+)\/([^/]+)\/_tool\/(i18n|content)\/([^/]+)\.(json|md)$/;
const TOOL_DEF = /^\/src\/pages\/[^/]+\/([^/]+)\/([^/]+)\/_tool\/tool\.ts$/;
const CATEGORY_FILE = /^\/src\/pages\/[^/]+\/([^/]+)\/_category\/i18n\/([^/]+)\.json$/;

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
  for (const [file, def] of Object.entries(toolDefs)) {
    const [, category, id] = file.match(TOOL_DEF)!;
    const path = `${category}/${id}`;
    if (!def) {
      errors.push(`${path}: _tool/tool.ts не экспортирует def`);
      continue;
    }
    const set = fileSet(path);
    errors.push(...validateFiles(path, set, requiredToolKeys(def)));
    if (def.kind === 'calculator') {
      for (const [name, spec] of Object.entries<InputSpec>(def.inputs)) {
        if (spec.type !== 'select') continue;
        for (const [lang, v] of Object.entries(spec.byLang ?? {})) {
          if (!spec.options.includes(v)) errors.push(`${path}: inputs.${name}.byLang.${lang} = "${v}" нет среди options`);
        }
      }
    }
    if (!toolPages[`${ROOT}/${path}/index.astro`]) errors.push(`${path}: нет index.astro (скопируйте из любого инструмента)`);

    if (seenIds.has(id)) errors.push(`${path}: id "${id}" уже занят инструментом ${seenIds.get(id)}`);
    seenIds.set(id, path);

    const langs = SITE_LANGS.filter((l) => l in set.i18n && set.content.includes(l));
    const content: Tool['content'] = {};
    for (const lang of langs) content[lang] = toolContent[`${ROOT}/${path}/_tool/content/${lang}.md`].Content;
    tools.push({ id, category, path, def, langs, strings: set.i18n, content });
  }

  for (const path of files.keys()) {
    if (!tools.some((t) => t.path === path)) errors.push(`${path}: есть переводы, но нет _tool/tool.ts`);
  }
  for (const page of Object.keys(toolPages)) {
    const path = page.slice(ROOT.length + 1, -'/index.astro'.length);
    if (!tools.some((t) => t.path === path)) errors.push(`${path}: есть index.astro, но нет _tool/tool.ts`);
  }
  for (const tool of tools) {
    for (const rel of tool.def.related ?? []) {
      if (!seenIds.has(rel)) errors.push(`${tool.path}: в related неизвестный инструмент "${rel}"`);
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
    const def = categoryDefs[`${ROOT}/${id}/_category/category.ts`];
    if (!def) {
      errors.push(`${id}: нет _category/category.ts`);
      continue;
    }
    if (!categoryPages[`${ROOT}/${id}/index.astro`]) errors.push(`${id}: нет index.astro (скопируйте из любой категории)`);
    const icon = categoryIcons[`${ROOT}/${id}/_category/icon.svg`];
    if (!icon) errors.push(`${id}: нет _category/icon.svg`);
    const strings = catStrings.get(id) ?? {};
    errors.push(...validateFiles(`${id} (категория)`, { i18n: strings, content: [] }, ['name', 'description'], false));
    const catTools = tools
      .filter((t) => t.category === id)
      .sort((a, b) => (a.def.order ?? Infinity) - (b.def.order ?? Infinity) || a.id.localeCompare(b.id));
    const langs = SITE_LANGS.filter((l) => catTools.some((t) => t.langs.includes(l)));
    for (const lang of langs) {
      if (!strings[lang]) errors.push(`${id}: на ${lang} есть инструменты, но нет _category/i18n/${lang}.json`);
    }
    categories.push({ id, def, order: def.order, strings, icon: icon ?? '', tools: catTools, langs });
  }
  for (const page of Object.keys(categoryPages)) {
    const id = page.slice(ROOT.length + 1, -'/index.astro'.length);
    if (!categoryIds.has(id)) errors.push(`${id}: есть index.astro, но нет _category/category.ts`);
  }
  categories.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

  if (errors.length) throw new Error(`Ошибки в ${ROOT.slice(1)}:\n  - ${errors.join('\n  - ')}`);
  return { tools, categories };
}

export const { tools, categories } = build();

export const toolById = (id: string) => tools.find((t) => t.id === id);

export const toolTitle = (tool: Tool, lang: Lang) => tool.strings[lang]!.title as string;
/** Короткое имя — часть заголовка до двоеточия: «Калькулятор дней: сколько дней между датами» → «Калькулятор дней». */
export const toolName = (tool: Tool, lang: Lang) => toolTitle(tool, lang).split(':')[0].trim();
export const categoryName = (cat: Category, lang: Lang) => cat.strings[lang]!.name as string;

export const toolUrl = (tool: Tool, lang: Lang) => `/${lang}/${tool.path}/`;
export const categoryUrl = (cat: Category, lang: Lang) => `/${lang}/${cat.id}/`;

export const toolsIn = (cat: Category, lang: Lang) => cat.tools.filter((t) => t.langs.includes(lang));

export interface ToolPageProps {
  tool: Tool;
  lang: Lang;
  island: IslandProps;
}

/** getStaticPaths для index.astro инструмента: по странице на каждый язык, где есть перевод. */
export function toolPaths(def: ToolDef) {
  const tool = tools.find((t) => t.def === def);
  if (!tool) throw new Error('toolPaths: инструмент не найден в каталоге');
  return tool.langs.map((lang) => ({
    params: { lang },
    props: { tool, lang, island: { lang, strings: { tool: tool.strings[lang]!, ui: UI[lang] } } } satisfies ToolPageProps,
  }));
}

export interface CategoryPageProps {
  cat: Category;
  lang: Lang;
}

/** getStaticPaths для index.astro категории: по странице на каждый язык, где в категории есть инструменты. */
export function categoryPaths(def: CategoryDef) {
  const cat = categories.find((c) => c.def === def);
  if (!cat) throw new Error('categoryPaths: категория не найдена в каталоге');
  return cat.langs.map((lang) => ({ params: { lang }, props: { cat, lang } satisfies CategoryPageProps }));
}
