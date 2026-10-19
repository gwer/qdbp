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

1. Папка `src/tools/{category}/{tool-id}/` (URL будет `/{lang}/{category}/{tool-id}/`; id уникален на весь сайт).
2. `tool.ts` — `defineCalculator({ inputs, compute, outputs, Extra? })` или `defineTool({ component })`.
3. `tool.test.ts` — эталонные значения из независимого источника.
4. `i18n/{lang}.json` + `content/{lang}.md` на каждый язык. Исходник пишется на русском. Язык включён, если есть оба файла.
5. `pnpm check`, затем `pnpm urls:update`, если появились новые URL.

Примеры: `src/tools/math/percent-of` (только конфиг), `src/tools/finance/loan-calculator` (конфиг + свой блок результата), `src/tools/text/word-counter` (свой компонент).

Сборка падает, если: у языка есть только один из двух файлов, код языка неизвестен, не хватает ключей перевода или наборы ключей у языков различаются, URL пропал без редиректа в `public/_redirects`, внутренняя ссылка битая, превышен бюджет размера.
