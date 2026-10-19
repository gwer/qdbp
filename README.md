# qdbp.net

Статический мультиязычный сайт браузерных инструментов и калькуляторов. Astro + Preact, только клиентская логика.
Планы и решения — в [docs/](docs/README.md), техническая часть — [docs/03-tech.md](docs/03-tech.md).

## Команды

```sh
pnpm install
pnpm dev            # dev-сервер (корень / в dev не редиректит — открывайте /ru/ или /en/)
pnpm test           # юнит-тесты (Vitest)
pnpm build          # сборка в dist/
pnpm check          # всё сразу: типы, тесты, сборка, пост-проверки dist/
pnpm urls:update    # подтвердить новые/удалённые URL в urls.txt
```

## Как добавить инструмент

1. Папка `src/pages/[lang]/{category}/{tool-id}/` — URL будет `/{lang}/{category}/{tool-id}/`; id уникален на весь сайт.
2. `index.astro` — скопировать как есть из любого инструмента (он одинаковый у всех).
3. `_tool/tool.ts` — `export const def = defineCalculator({ order, inputs, compute, outputs, Extra? })` или `defineTool({ order, component })`, затем `export default island(def)`. `order` — место в списке категории.
4. `_tool/*.test.ts` — эталонные значения из независимого источника.
5. `_tool/i18n/{lang}.json` + `_tool/content/{lang}.md` на каждый язык. Исходник пишется на русском. Язык включён, если есть оба файла.
6. `pnpm check`, затем `pnpm urls:update`, если появились новые URL.

Новая категория: папка `src/pages/[lang]/{category}/` с `index.astro` (скопировать из любой категории) и `_category/` (`category.ts`, `i18n/{lang}.json`).

Примеры: `math/percent-of` (только конфиг), `finance/loan-calculator` (конфиг + свой блок результата), `text/word-counter` (свой компонент).

Сборка падает, если: у инструмента или категории нет `index.astro` (или наоборот), у языка есть только один из двух файлов, код языка неизвестен, не хватает ключей перевода или наборы ключей у языков различаются, URL пропал без редиректа в `public/_redirects`, внутренняя ссылка битая, превышен бюджет размера.
