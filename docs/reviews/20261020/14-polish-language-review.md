# Вычитка новых текстов полировки

Дата: 21.10.2026. Снимок `ebab44a`. Это отдельный результат вычитки, а не обещание проверить тексты позднее.

## Покрытие и общий вывод

Прочитаны изменения всех пяти языков: **1 961 изменённая/новая строка словарей и изменения 240 контентных Markdown-файлов**, всего 595 файлов. Корпус выделен сравнением с `b3ba6c5`: [машинный реестр](evidence/polish-20261021/copy-delta.json), компактные тексты [RU](evidence/polish-20261021/compact-ru.txt), [EN](evidence/polish-20261021/compact-en.txt), [ES](evidence/polish-20261021/compact-es.txt), [DE](evidence/polish-20261021/compact-de.txt), [PT](evidence/polish-20261021/compact-pt.txt).

В целом тексты понятные, выдерживают локализацию: Price/SAC и R$ в PT, франко-германские системы погашения и евро в ES, Sondertilgung в DE, фунты/мили/PITI в EN. Массово перепереводить их не нужно. Ошибок вида «не тот язык» или выпадения новых ключей не обнаружено. **Предметные неточности и несколько неловких формулировок есть; конкретные замены ниже.**

Это ИИ-редакторская и предметная вычитка новых изменений, не новая полная вычитка всего старого корпуса и не корректорская проверка носителями. Старый отчёт 09 не заменяется. Пометки «P3 / редактура» ниже — предложения, а не функциональные блокеры.

Пути ниже относительно `src/pages/[lang]/`; `i18n/xx.json` и `content/xx.md` находятся в соответствующем `_tool/`.

## C01 · P2 · EN: 37 недель — не Full term

**Файлы:** `health/due-date/_tool/i18n/en.json → ui.milestones.term` и новый абзац `content/en.md`.

Сейчас: `Full term (37 weeks)` и `full term (37 weeks)` в тексте.

Предлагается: **`Early term begins (37 weeks)`**; в абзаце — `the start of early term (37 weeks)`.

По классификации ACOG ранний доношенный срок — 37+0…38+6, full term — 39+0…40+6. Событие на 259-м дне можно сохранить, исправив именно подпись и пояснение; не требуется механически переносить эту дату на 39 недель. Источник: [ACOG — Definition of Term Pregnancy](https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2013/11/definition-of-term-pregnancy).

Общие слова `доношенная`, `a término`, `a termo`, `termingerecht` не следует автоматически объявлять той же EN-ошибкой: они не обязаны означать конкретную категорию *full term*. Если нужна единая новая классификация всех языков, сначала согласовать терминологию и источник, затем переводить. Минимально обязательна правка английского.

## C02 · P2, вместе с P01 · Пять языков: честно описать недостижимый лимит файла

**Файлы:** `images/compress-image/_tool/content/{lang}.md`; потребуется новая UI-строка у файла.

Сейчас все языки без оговорок обещают подобрать качество, которое уложится в лимит. Это противоречит fallback в `fitToSize`, подтверждённому в P01. Одного изменения статьи недостаточно: превышение должно быть видно рядом с результатом.

Короткая строка предупреждения с параметрами `{limit}` и `{size}`, уже отформатированными с единицами:

| Язык | Предложение |
|---|---|
| RU | `Не удалось уложиться в {limit} без уменьшения разрешения. Минимальный полученный размер — {size}.` |
| EN | `Could not reach {limit} without reducing the image dimensions. The smallest result is {size}.` |
| ES | `No se ha podido llegar a {limit} sin reducir las dimensiones. El menor tamaño obtenido es {size}.` |
| DE | `Ohne kleinere Bildabmessungen lässt sich {limit} nicht erreichen. Das kleinste Ergebnis hat {size}.` |
| PT | `Não foi possível chegar a {limit} sem reduzir as dimensões. O menor tamanho obtido é {size}.` |

В статье добавить, что размер подбирается качеством без уменьшения разрешения, а невозможность достичь лимита будет показана явно. Не обещать новую автоматическую обрезку/уменьшение: этого функционала в режиме нет.

## C03 · P2 · DE: Fliesenhöhe обозначает не то измерение

**Файл:** `construction/tiles/_tool/i18n/de.json → inputs.wallHeight.label`; также новый абзац `content/de.md`.

Сейчас: `Fliesenhöhe`, в абзаце `Umfang × Fliesenhöhe`.

Предлагается: **`Höhe der gefliesten Wandfläche`**; в абзаце **`Raumumfang × Höhe der gefliesten Wandfläche`**.

Поле имеет в виду высоту облицовки стены в метрах, а не высоту одной плитки. Это не просто стилистика: неверное понимание даёт другую площадь. Размеры отдельной плитки уже вводятся другими полями.

## C04 · P3 · RU: шесть циклов — не обязательно полгода

**Файл:** `health/ovulation/_tool/i18n/ru.json → ui.cycles`.

`Календарь на полгода` → **`Следующие шесть циклов`**.

Форма допускает разную длину цикла; шесть циклов не равны фиксированным шести месяцам. Остальные четыре языка уже называют именно шесть циклов. Абзац RU про «шесть циклов вперёд» корректен, менять его не нужно.

## C05 · P3 · Пять языков: 1 ГБ — лимит инструмента, не браузеров вообще

**Файлы:** `security/hash/_tool/i18n/{lang}.json → ui.tooLarge`.

Текущие формулировки говорят, что больший файл в браузере посчитать нельзя. На самом деле это установленный `MAX_FILE`, а не универсальная техническая граница.

| Язык | Замена |
|---|---|
| RU | `Этот инструмент поддерживает файлы до 1 ГБ. Выберите файл меньшего размера.` |
| EN | `This tool supports files up to 1 GB. Choose a smaller file.` |
| ES | `Esta herramienta admite archivos de hasta 1 GB. Elige uno más pequeño.` |
| DE | `Dieses Tool unterstützt Dateien bis 1 GB. Wählen Sie eine kleinere Datei.` |
| PT | `Esta ferramenta aceita arquivos de até 1 GB. Escolha um arquivo menor.` |

Это редактура ограничения, не рекомендация повысить лимит. Реальную работу около 1 ГБ на телефоне этот аудит не подтверждает.

## C06 · P3 · Пять языков: не называть порог калорий гарантией безопасности

**Файлы:** `health/calorie-calculator/_tool/i18n/{lang}.json → ui.tooLow`, при необходимости заключение `ui.goalsNote`.

Сейчас: «ниже безопасного минимума» / `below the safe minimum` и аналоги. Порог 1200/1500 — ориентир выбранной модели, а не доказательство безопасности любого значения выше него для любого человека. В статье уже есть ограничения применимости и направление к специалисту; их сохранить.

Нейтральные подписи вместо «безопасного минимума»:

| RU | EN | ES | DE | PT |
|---|---|---|---|---|
| `обсудите такой рацион с врачом` | `discuss this intake with a clinician` | `consulta esta ingesta con un profesional sanitario` | `diese Kalorienzufuhr ärztlich abklären` | `converse com um profissional de saúde sobre essa ingestão` |

Не предлагается заново открывать отложенную клиническую сертификацию всех инструментов или менять здесь формулу. Причина точечной редакторской правки — новая категоричная подпись. [NIDDK описывает планировщик как оценку для взрослых и отдельно исключает беременных/кормящих и несовершеннолетних](https://www.niddk.nih.gov/health-information/weight-management/body-weight-planner); это полезная модель границ применимости, а не независимое подтверждение именно порогов этого калькулятора.

## C07 · P3 · RU: объяснение изменения НДФЛ

**Файл:** `finance/net-salary/_tool/i18n/ru.json → ui.varies`, условие показа — `MonthTable.tsx`.

При 75 018 ₽ в месяц и одном ребёнке интерфейс утверждает, что доход за год больше 2,4 млн ₽ и применяется повышенная ставка. После добавления детских вычетов это неверно: различие месяцев может объясняться окончанием вычета. Связано с P05, но требует и текста.

Минимальная общая замена:

> НДФЛ и сумма на руки могут меняться по месяцам из-за годовых порогов налога и прекращения детского вычета. Суммы в месяц выше — средние за год; подробности — в таблице.

Лучше показывать конкретную причину, если она уже доступна из расчёта. Не нужно добавлять сложную систему объяснений ради этого абзаца.

Правило отмены детского вычета с месяца превышения 450 000 ₽ подтверждено [ФНС](https://www.nalog.gov.ru/rn77/fl/interest/tax_deduction/fl_deti/); сомнение в журнале исполнителя не требует изменения этого правила.

## C08 · P3 · ES: единое обращение на tú

**Файлы:** `finance/{early-repayment,loan-calculator,mortgage}/_tool/i18n/es.json`, где есть соответствующие ключи.

В новых инструкциях используется `Introduce / elige / puedes`, а новые ошибки внезапно переходят на usted:

- `errors.noPrepayments`: `Añada al menos una amortización anticipada.` → **`Añade al menos una amortización anticipada.`**
- `errors.prepayments`: `La lista de amortizaciones del enlace está dañada: revísela.` → **`La lista de amortizaciones del enlace está dañada: revísala.`**

Это не непонятный испанский, а локальная стилистическая несогласованность.

## C09 · P3 · PT: явная сумма обхватов и естественная ошибка замеров

**Файл:** `health/body-fat/_tool/i18n/pt.json`.

- `errors.girthNeck`: `Cintura mais quadril precisa ser maior que o pescoço — confira as medidas.` → **`A soma das circunferências da cintura e do quadril precisa ser maior que a circunferência do pescoço — confira as medidas.`**
- `errors.outOfRange`: `Com essas medidas a fórmula dá um resultado impossível — confira se estão na mesma unidade e medidas como indicado.` → **`Com essas medidas, a fórmula dá um resultado impossível. Confira se todas estão na mesma unidade e foram tomadas conforme as instruções.`**

Первая замена явно называет сумму и измеряемые окружности; вторая убирает повтор `medidas` как существительного и причастия.

## C10 · P3 · DE: законченная фраза о бетоне

**Файл:** `construction/concrete/_tool/content/de.md`, новый абзац.

Сейчас: `Für Säulen oder Pfähle Durchmesser, Höhe und Anzahl: jede hat π × d² / 4 × Höhe.`

Предлагается:

> Für Säulen oder Pfähle geben Sie Durchmesser, Höhe und Anzahl ein. Das Volumen pro Säule oder Pfahl beträgt π × d² / 4 × Höhe.

Это устраняет телеграфное предложение и неоднозначное `jede hat`, явно называя объём.

## C11 · P3 · EN: две небольшие идиоматические правки

- `images/qr-generator/_tool/content/en.md`: `an email with a ready subject` → **`an email with a prefilled subject`**.
- `random/random-picker/_tool/i18n/en.json → ui.remove`: `Remove picked from the list` → **`Remove selected items from the list`**.

Остальные новые EN-инструкции достаточно естественны. Нет необходимости переписывать их ради другой манеры изложения.

## C12 · P3 · Пять языков: условие «не увеличивать» в точном resize

**Файлы:** `images/resize-image/_tool/content/{lang}.md`.

В статье «точно W×H» звучит безусловно, но по умолчанию включено «Не увеличивать маленькие изображения». Это осмысленный приоритет настройки, а не обязательно ошибка реализации. Добавить одну фразу рядом с новым режимом:

| Язык | Предложение |
|---|---|
| RU | `Если включено «Не увеличивать маленькие изображения», результат может быть меньше заданных размеров.` |
| EN | `With “Do not enlarge small images” enabled, the result may be smaller than the requested dimensions.` |
| ES | `Con «No ampliar imágenes pequeñas» activado, el resultado puede ser menor que las dimensiones indicadas.` |
| DE | `Wenn „Kleine Bilder nicht vergrößern“ aktiviert ist, kann das Ergebnis kleiner als die angegebenen Maße sein.` |
| PT | `Com «Não ampliar imagens pequenas» ativado, o resultado pode ficar menor que as dimensões pedidas.` |

Кавычки и название переключателя при применении сверить с существующим `ui.noUpscale`, не создавать второе название той же настройки.

## Что не требуется переписывать

- Пояснения процентов/маржи/наценки, рабочих дней без праздников, битов и байтов, нескольких досрочных погашений и способы расчёта ЭКО согласованы с заявленной математикой; исключения в работе описаны в отчёте 13.
- Разница между аннуитетом, SAC/равным основным долгом и локальные названия адаптированы, а не просто калькированы.
- Использование технических слов JWT, Base64URL, Secret/segredo и имён кодовых форматов естественно для аудитории этих инструментов.
- «Без отправки файла» в проверенных локальных сценариях соответствует наблюдению. Не предлагается новая отдельная privacy-страница.
- Старые предложения C07/C08 про сон/воду из первоначального ревью не возобновляются: идентификаторы C01–C12 здесь относятся только к этому документу полировки.

## Порядок применения

Сначала C01–C03 и связанные с расчётом C07; C02 обязательно вместе с предупреждением P01. Затем остальные точечные редакторские правки. После правок словарей — `pnpm check`; после предупреждений/подписей полей — короткий проход соответствующих режимов на пяти языках и 375 px. Массовый новый перевод корпуса не нужен.
