# Матрица всех 96 инструментов

Все доступные языковые страницы каждого инструмента открыты в Chrome при 1440/375 px. Все RU-страницы проверены при 320 px. Ниже — дополнительные сценарии с изменённым вводом, а не только факт открытия.

«Базовый сценарий прошёл» означает перечисленную проверку; это не отсутствие дефектов во всём инструменте. В каждом калькуляторе дополнительно актуальны общие F09 (ошибки формулы), F10 (парсер), F16 (JS); у файловых инструментов — общий F03 (ZIP). Состояние калькулятора в URL принято как штатное поведение, F01 снят с дефектов; уточнение текста приватности — C01. Медицинские формулы проверялись арифметически, без клинической валидации.

Подробные входы/выходы: [compute-checks.json](evidence/compute-checks.json), [browser-checks.json](evidence/browser-checks.json), [image-checks.json](evidence/image-checks.json). Редакторские замечания — [03](03-content-and-localization.md).

## convert

| Инструмент / языки | Проверенный сценарий | Результат | Текст / следующая проверка |
|---|---|---|---|
| [Конвертер площади](http://localhost:4321/ru/convert/area-converter/)<br>`convert/area-converter`<br>en, ru, es, de, pt | 1 ha → 10 000 m² | Базовый сценарий прошёл | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Конвертер единиц информации](http://localhost:4321/ru/convert/data-converter/)<br>`convert/data-converter`<br>en, ru, es, de, pt | 1 GiB → 1 073 741 824 B | Базовый сценарий прошёл | Разделение SI/IEC корректно обозначено; добавить сценарии копирования больших чисел без округления. |
| [Конвертер энергии](http://localhost:4321/ru/convert/energy-converter/)<br>`convert/energy-converter`<br>en, ru, es, de, pt | 1 kWh → 3 600 000 J | Базовый сценарий прошёл | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Конвертер расхода топлива](http://localhost:4321/ru/convert/fuel-consumption/)<br>`convert/fuel-consumption`<br>en, ru, es, de, pt | 10 km/L → 10 L/100 km | Базовый сценарий прошёл | US/UK явно различать во всех коротких подписях; ноль недопустим. |
| [Конвертер длины](http://localhost:4321/ru/convert/length-converter/)<br>`convert/length-converter`<br>en, ru, es, de, pt | 1 in → 2,54 cm | Базовый сценарий прошёл | Сохранить точные определения; явно подсказать, где вводятся feet+inches, а где только числовое значение. |
| [Конвертер давления](http://localhost:4321/ru/convert/pressure-converter/)<br>`convert/pressure-converter`<br>en, ru, es, de, pt | 1 atm → 101 325 Pa | Базовый сценарий прошёл | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Размер обуви](http://localhost:4321/ru/convert/shoe-size/)<br>`convert/shoe-size`<br>en, ru, es, de, pt | size=26, system=cm → eu=41, uk=7.5, usM=8.5 | Базовый сценарий прошёл | Таблица сервиса проверена, универсальность для брендов не подтверждалась. Подписать диапазон и источник; ошибки диапазона объяснять (F09). |
| [Конвертер скорости](http://localhost:4321/ru/convert/speed-converter/)<br>`convert/speed-converter`<br>en, ru, es, de, pt | 36 km/h → 10 m/s | Базовый сценарий прошёл | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Конвертер температуры](http://localhost:4321/ru/convert/temperature-converter/)<br>`convert/temperature-converter`<br>en, ru, es, de, pt | 32 °F → 0 °C | Базовый сценарий прошёл | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Конвертер объёма](http://localhost:4321/ru/convert/volume-converter/)<br>`convert/volume-converter`<br>en, ru, es, de, pt | 1 UK gal → 4,54609 L | Базовый сценарий прошёл | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Конвертер массы](http://localhost:4321/ru/convert/weight-converter/)<br>`convert/weight-converter`<br>en, ru, es, de, pt | 1 lb → 0,45359237 kg | Базовый сценарий прошёл | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |

## dates

| Инструмент / языки | Проверенный сценарий | Результат | Текст / следующая проверка |
|---|---|---|---|
| [Калькулятор дат](http://localhost:4321/ru/dates/add-to-date/)<br>`dates/add-to-date`<br>en, ru, es, de, pt | date=2024-01-31, op=add, amount=1, unit=months → result=2024-02-29, days=29 | Базовый сценарий прошёл | Согласовать справку про календарные месяцы с текстом возраста; проверять переходы границ года. |
| [Калькулятор возраста](http://localhost:4321/ru/dates/age-calculator/)<br>`dates/age-calculator`<br>en, ru, es, de, pt | birth=2000-02-29, on=2025-02-28 → years=25, months=0, days=0 | Базовый сценарий работает; F06: 29.02.2000 → 28.02.2025 даёт 24 г. 11 мес. 30 д. | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Обратный отсчёт](http://localhost:4321/ru/dates/countdown/)<br>`dates/countdown`<br>en, ru, es, de, pt | date=2030-01-01, time=0 → date=2030-01-01 | Базовый сценарий прошёл | Даты/время меняют цель; timer присутствует. Нужны отдельные проверки сна вкладки и системных изменений часов. |
| [Калькулятор дней](http://localhost:4321/ru/dates/days-between/)<br>`dates/days-between`<br>en, ru, es, de, pt | from=2024-02-28, to=2024-03-01, includeEnd=no → days=2, weekdays=2 | Базовый сценарий работает; F08: исторические выходные ошибочно считаются будними | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Калькулятор интервала времени](http://localhost:4321/ru/dates/time-between/)<br>`dates/time-between`<br>en, ru, es, de, pt | start=1380, end=60 → duration=120, minutes=120, hours=2 | Базовый сценарий прошёл | Ночная смена рассчитана правильно; показывать правило «раньше старта = следующий день». |
| [Калькулятор времени](http://localhost:4321/ru/dates/time-calculator/)<br>`dates/time-calculator`<br>en, ru, es, de, pt | date=2024-02-28, time=1410, op=add, days=0, hours=1, minutes=0 → time=30, date=2024-02-29, shift=1 | Базовый сценарий прошёл | Переход через полночь/29 февраля правильный; отсутствие DST уже описано. |
| [Конвертер часовых поясов](http://localhost:4321/ru/dates/timezone-converter/)<br>`dates/timezone-converter`<br>en, ru, es, de, pt | UTC 12:00 → Нью-Йорк 07:00, Новосибирск 19:00; весенний gap Нью-Йорка | Базовый сценарий работает; F07: весенний gap Нью-Йорка нормализуется в прошлое | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Конвертер Unix timestamp](http://localhost:4321/ru/dates/unix-timestamp/)<br>`dates/unix-timestamp`<br>en, ru, es, de, pt | ts=0, unit=s → iso=1970-01-01T00:00:00.000Z | Базовый сценарий прошёл | Epoch и единицы s/ms проверены; добавить обратное направление дата → timestamp. |
| [Номер недели](http://localhost:4321/ru/dates/week-number/)<br>`dates/week-number`<br>en, ru, es, de, pt | date=2021-01-01, system=iso → week=53, year=2020, start=2020-12-28 | Базовый сценарий работает; F08: 28.12.1969 ошибочно отнесено к 1970-W01 | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |

## dev

| Инструмент / языки | Проверенный сценарий | Результат | Текст / следующая проверка |
|---|---|---|---|
| [Калькулятор подсетей IPv4](http://localhost:4321/ru/dev/cidr/)<br>`dev/cidr`<br>en, ru, es, de, pt | 192.0.2.0/31; оба адреса доступны; дефолт /24 | Базовый сценарий прошёл | IPv4-only указано; IPv6 — осмысленное дальнейшее развитие. |
| [Конвертер цветов](http://localhost:4321/ru/dev/color-converter/)<br>`dev/color-converter`<br>en, ru, es, de, pt | #ff0000 → rgb(255 0 0); контраст и другие форматы при открытии | Базовый сценарий прошёл | CMYK без профиля честно оговорён; отдельно проверить alpha и выход из sRGB. |
| [JSON форматтер](http://localhost:4321/ru/dev/json-formatter/)<br>`dev/json-formatter`<br>en, ru, es, de, pt | {"b":2,"a":1} → форматированный JSON; ID 9007199254740993 | Базовый сценарий работает; F04 (P2): ограничение точности Number без предупреждения; пустая форма сразу показывает ошибку | Сначала предупредить об ограничении точности; сохранение числовых литералов — дальнейшее улучшение. |
| [Декодер JWT](http://localhost:4321/ru/dev/jwt-decoder/)<br>`dev/jwt-decoder`<br>en, ru, es, de, pt | alg:none, exp:0; предупреждение о неподтверждённой подписи и истечении | Базовый сценарий прошёл | Не проверяет подпись — явно показано. RU-заголовок «расшифровка» заменить. |
| [Тестер регулярных выражений](http://localhost:4321/ru/dev/regex-tester/)<br>`dev/regex-tester`<br>en, ru, es, de, pt | (a+)+$ остановлен через 2 с; затем a+ снова находит 2 совпадения | Базовый сценарий прошёл | Worker и таймаут реально работают; хорошие основания для дальнейшего роста dev-кластера. |
| [Сравнение текстов](http://localhost:4321/ru/dev/text-diff/)<br>`dev/text-diff`<br>en, ru, es, de, pt | a/b → a/c: добавлена 1 строка, удалена 1 | Базовый сценарий прошёл | Один изменённый ряд проверен; сложные несхожие большие тексты требуют worker/лимита времени. |

## finance

| Инструмент / языки | Проверенный сценарий | Результат | Текст / следующая проверка |
|---|---|---|---|
| [Калькулятор автокредита](http://localhost:4321/ru/finance/auto-loan/)<br>`finance/auto-loan`<br>en, ru, es, de, pt | price=10000, down=2000, tradeIn=1000, tax=0, fees=0, rate=0, months=10 → financed=7000, payment=700, totalCost=9000 | Базовый сценарий прошёл | C02: неверный совет EN про trade-in; полную стоимость отделить от cash outflow. |
| [Калькулятор точки безубыточности](http://localhost:4321/ru/finance/break-even/)<br>`finance/break-even`<br>en, ru, es, de, pt | fixed=1000, price=30, variable=20 → units=100, revenue=3000, contribution=10 | Базовый сценарий работает; F09: price ≤ variable — прочерки без объяснения | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Калькулятор сложных процентов](http://localhost:4321/ru/finance/compound-interest/)<br>`finance/compound-interest`<br>en, ru, es, de, pt | initial=1000, monthly=0, rate=12, years=1, cap=yearly → total=1120, contributed=1000, interest=120 | Базовый сценарий прошёл | Номинальная ставка и конец месяца описаны; добавить независимые примеры для каждой частоты капитализации. |
| [Калькулятор скидок](http://localhost:4321/ru/finance/discount/)<br>`finance/discount`<br>en, ru, es, de, pt | price=200, percent=25 → final=150, saving=50 | Базовый сценарий прошёл | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Калькулятор досрочного погашения](http://localhost:4321/ru/finance/early-repayment/)<br>`finance/early-repayment`<br>en, ru, es, de, pt | amount=1200, rate=0, months=12, after=2, extra=300, mode=term → savings=0, newPayment=100, newMonths=7 | Базовый сценарий прошёл | 0% и сокращение срока проверены; F09 для after ≥ months. Регулярные дополнительные платежи — отдельное развитие. |
| [Калькулятор расхода электроэнергии](http://localhost:4321/ru/finance/electricity-cost/)<br>`finance/electricity-cost`<br>en, ru, es, de, pt | power=1000, hours=2, tariff=5 → costDay=10, costMonth=300, costYear=3650 | Базовый сценарий прошёл | 30 дней в месяце и 365 в году обозначать явно; мощность по шильдику отличается от среднего потребления. |
| [Калькулятор стоимости поездки](http://localhost:4321/ru/finance/fuel-cost/)<br>`finance/fuel-cost`<br>en, ru, es, de, pt | distance=100, unit=l100km, economy=8, price=2, people=4 → cost=16, perPerson=4, fuel=8 | Базовый сценарий прошёл | Нужны динамические подписи цены за литр/галлон; zero economy объяснять, а не показывать прочерки. |
| [Калькулятор инфляции](http://localhost:4321/ru/finance/inflation/)<br>`finance/inflation`<br>en, ru, es, de, pt | amount=1000, rate=10, years=2 → future=1210, power=826.4462809917355 | Базовый сценарий прошёл | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Кредитный калькулятор](http://localhost:4321/ru/finance/loan-calculator/)<br>`finance/loan-calculator`<br>en, ru, es, de, pt | amount=1200, rate=0, months=12, kind=annuity → payment=100, overpay=0, total=1200 | Базовый сценарий прошёл | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Калькулятор маржи](http://localhost:4321/ru/finance/margin/)<br>`finance/margin`<br>en, ru, es, de, pt | cost=80, price=100 → margin=20, profit=20, markup=25 | Базовый сценарий прошёл | При cost=0 наценка не определена; при price=0 нужен предметный текст F09. |
| [Калькулятор наценки](http://localhost:4321/ru/finance/markup/)<br>`finance/markup`<br>en, ru, es, de, pt | cost=80, percent=25 → price=100, profit=20, margin=20 | Базовый сценарий прошёл | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Ипотечный калькулятор](http://localhost:4321/ru/finance/mortgage/)<br>`finance/mortgage`<br>en, ru, es, de, pt | price=10000, down=20, rate=0, years=1, kind=annuity → principal=8000, downPayment=2000, total=8000 | Базовый сценарий прошёл | Указать валюту/рынок у сумм; модель фиксированной ставки и исключённые расходы держать рядом с результатом. |
| [Калькулятор зарплаты на руки](http://localhost:4321/ru/finance/net-salary/)<br>`finance/net-salary`<br>ru | mode=gross, amount=300000 → yearTax=492000, yearNet=3108000, net=259000 | Базовый сценарий прошёл | Только RU — обоснованно. Дата применимости, источники ФНС; отдельно объяснять среднюю месячную сумму. |
| [Калькулятор рефинансирования](http://localhost:4321/ru/finance/refinance/)<br>`finance/refinance`<br>en, ru, es, de, pt | balance=1200, rate=0, months=12, newRate=0, newMonths=24, fees=100 → netSavings=-100, monthlySaving=50, newPayment=50 | Базовый сценарий прошёл | C03: cash-out не моделируется; срок покрытия расходов платежами не равен общей выгоде. |
| [Калькулятор ROI](http://localhost:4321/ru/finance/roi/)<br>`finance/roi`<br>en, ru, es, de, pt | invested=100, returned=121, years=2 → roi=21, cagr=10, profit=21 | Базовый сценарий прошёл | Один начальный денежный поток; пояснить, что CAGR в формуле — доля, на экране проценты. |
| [Калькулятор чаевых](http://localhost:4321/ru/finance/tip/)<br>`finance/tip`<br>en, ru, es, de, pt | bill=100, percent=10, people=2 → perPerson=55, tip=10, total=110 | Базовый сценарий прошёл | Опционально распределять остаток центов, чтобы доли точно складывались в итог. |
| [Калькулятор НДС](http://localhost:4321/ru/finance/vat/)<br>`finance/vat`<br>en, ru, es, de, pt | amount=120, rate=20, mode=remove → vat=20, net=100, gross=120 | Базовый сценарий прошёл | Стандартные ставки сверены с официальными источниками; показывать страну и дату проверки. |

## health

| Инструмент / языки | Проверенный сценарий | Результат | Текст / следующая проверка |
|---|---|---|---|
| [Калькулятор ИМТ](http://localhost:4321/ru/health/bmi/)<br>`health/bmi`<br>en, ru, es, de, pt | weight=80, height=200 → bmi=20, healthyMin=74, healthyMax=99.6 | Базовый сценарий работает; F11: переключение единиц на дефолтах меняет ИМТ | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Калькулятор процента жира](http://localhost:4321/ru/health/body-fat/)<br>`health/body-fat`<br>en, ru, es, de, pt | sex=male, weight=80, height=178, neck=38, waist=86, hip=98 → percent=17.2039245685479 | Базовый сценарий прошёл | C04: EN описывает иную формулу. Метод не является диагностикой. |
| [Калькулятор калорий](http://localhost:4321/ru/health/calorie-calculator/)<br>`health/calorie-calculator`<br>en, ru, es, de, pt | sex=male, age=30, weight=80, height=180, activity=sedentary → bmr=1780, tdee=2136, loss=1815.6 | Базовый сценарий работает; F14: взрослый дефицит калорий рассчитывается для 15 лет | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Калькулятор срока беременности](http://localhost:4321/ru/health/due-date/)<br>`health/due-date`<br>en, ru, es, de, pt | lmp=2026-01-01, cycle=28, on=2026-03-12 → due=2026-10-08, age=70, left=210 | Базовый сценарий прошёл | C05: убрать нормализацию диапазона 37–42 недель; расчёт даты не клиническая проверка. |
| [Калькулятор идеального веса](http://localhost:4321/ru/health/ideal-weight/)<br>`health/ideal-weight`<br>en, ru, es, de, pt | sex=male, height=152.4 → devine=50, robinson=52, miller=56.2 | Базовый сценарий прошёл | Формулы исторические; «идеальный» вес не персональная рекомендация. Показать применимость. |
| [Калькулятор овуляции](http://localhost:4321/ru/health/ovulation/)<br>`health/ovulation`<br>en, ru, es, de, pt | lmp=2026-01-01, cycle=28 → ovulation=2026-01-15, fertileStart=2026-01-10, fertileEnd=2026-01-16 | Базовый сценарий прошёл | Ограничение про контрацепцию полезно; перенести предупреждение ближе к форме. |
| [Калькулятор темпа бега](http://localhost:4321/ru/health/running-pace/)<br>`health/running-pace`<br>en, ru, es, de, pt | distance=5, time=1500 → pace=300, speed=12 | Базовый сценарий прошёл | 5 км / 25:00 проверено; прогноз дистанций ориентировочный, не обещание результата. |
| [Калькулятор сна](http://localhost:4321/ru/health/sleep-calculator/)<br>`health/sleep-calculator`<br>en, ru, es, de, pt | mode=wake, time=420, fallAsleep=15 → c5=1395, c6=1305, c4=45 | Базовый сценарий прошёл | C07: условные циклы не определяют фазу сна; короткие варианты не делать равнозначной рекомендацией. |
| [Калькулятор нормы воды](http://localhost:4321/ru/health/water-intake/)<br>`health/water-intake`<br>en, ru, es, de, pt | weight=80, exercise=60, climate=hot → total=3.6, glasses=3.6 | Базовый сценарий прошёл | C08: отличать воду из напитков от общей воды и национальных норм. |

## images

| Инструмент / языки | Проверенный сценарий | Результат | Текст / следующая проверка |
|---|---|---|---|
| [Сжатие изображений](http://localhost:4321/ru/images/compress-image/)<br>`images/compress-image`<br>en, ru, es, de, pt | JPEG: размер уменьшается, 800×600 сохраняется; возврат исходника с COM | Базовый сценарий работает; F02: сохраняется исходник с метаданными; F03 общий ZIP | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Конвертер изображений](http://localhost:4321/ru/images/convert-image/)<br>`images/convert-image`<br>en, ru, es, de, pt | PNG → JPEG с белым фоном; PNG → WebP с прозрачностью; коллизии ZIP | Базовый сценарий работает; F03: 3 результата превращаются в 2 файла ZIP | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Просмотр и удаление EXIF](http://localhost:4321/ru/images/exif/)<br>`images/exif`<br>en, ru, es, de, pt | валидный JPEG с COM → удалён COM, изображение открывается | Базовый сценарий прошёл | COM удаляется без потери декодируемости. GPS/ориентация/ICC дополнительно покрыты существующими unit-тестами. |
| [Конвертер HEIC в JPG](http://localhost:4321/ru/images/heic-to-jpg/)<br>`images/heic-to-jpg`<br>en, ru, es, de, pt | реальный example.heic → JPEG 1280×854; повреждённый файл — сообщение | Базовый сценарий прошёл | Реальное декодирование проходит; iPhone orientation/HDR на реальном Safari в этом ревью не проверялись. |
| [Конвертер изображений в Base64](http://localhost:4321/ru/images/image-to-base64/)<br>`images/image-to-base64`<br>en, ru, es, de, pt | PNG → data URL → PNG; совпадение входных байтов | Базовый сценарий прошёл | Байтовый roundtrip проходит; предупреждать о росте размера и больших вставках. |
| [Генератор QR-кодов](http://localhost:4321/ru/images/qr-generator/)<br>`images/qr-generator`<br>en, ru, es, de, pt | Unicode и Wi-Fi с ;/: в полях → PNG, декодирование независимым jsQR | Базовый сценарий работает; F12: можно скачать белый код на белом фоне | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Изменение размера изображения](http://localhost:4321/ru/images/resize-image/)<br>`images/resize-image`<br>en, ru, es, de, pt | 800×600 → 400×300; пакетный ZIP; повреждённый JPEG | Базовый сценарий прошёл | Положительный resize проверен; проверить no-upscale, проценты и пакеты 48-MP на мобильных устройствах. |

## kitchen

| Инструмент / языки | Проверенный сценарий | Результат | Текст / следующая проверка |
|---|---|---|---|
| [Калькулятор формы для выпечки](http://localhost:4321/ru/kitchen/cake-pan/)<br>`kitchen/cake-pan`<br>en, ru, es, de, pt | fromShape=round, fromA=20, fromB=1, toShape=round, toA=30, toB=1 → factor=2.25 | Базовый сценарий прошёл | Соотношение площадей проверено; добавить высоту как отдельное, явно необязательное измерение. |
| [Граммы в стаканы и ложки](http://localhost:4321/ru/kitchen/cups-to-grams/)<br>`kitchen/cups-to-grams`<br>en, ru, es, de, pt | ingredient=water, amount=2, measure=ml → grams=2 | Базовый сценарий прошёл | Справочные плотности/метод набора муки обозначены; добавить прямую ссылку на источник таблицы. |
| [Температура духовки](http://localhost:4321/ru/kitchen/oven-temperature/)<br>`kitchen/oven-temperature`<br>en, ru, es, de, pt | value=180, scale=c → c=180, f=356, fanC=160 | Базовый сценарий прошёл | 20 °C и 25 °F — разные бытовые приближения; не представлять их эквивалентными точными конверсиями. |
| [Калькулятор рецептов](http://localhost:4321/ru/kitchen/recipe-scaler/)<br>`kitchen/recipe-scaler`<br>en, ru, es, de, pt | 2 → 4 порции: 1/2 л → 1 л; 2 яйца → 4 | Базовый сценарий прошёл | Дроби проверены; показать строки, которые не распознаны, и возможность ручной корректировки. |
| [Калькулятор дрожжей](http://localhost:4321/ru/kitchen/yeast/)<br>`kitchen/yeast`<br>en, ru, es, de, pt | amount=30, from=fresh → fresh=30, active=12, instant=10 | Базовый сценарий прошёл | Коэффициенты приблизительные; в PT H1 уточнить fermento biológico. |

## math

| Инструмент / языки | Проверенный сценарий | Результат | Текст / следующая проверка |
|---|---|---|---|
| [Прибавление и вычитание процента](http://localhost:4321/ru/math/add-percent/)<br>`math/add-percent`<br>en, ru, es, de, pt | value=200, op=subtract, percent=25 → result=150, part=50 | Базовый сценарий прошёл | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Калькулятор среднего значения](http://localhost:4321/ru/math/average/)<br>`math/average`<br>en, ru, es, de, pt | 1 2 3 3 → среднее 2,25, медиана 2,5, мода 3; 150k значений | Базовый сценарий работает; F13: 150k уникальных чисел оставляют старый ответ | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Калькулятор дробей](http://localhost:4321/ru/math/fractions/)<br>`math/fractions`<br>en, ru, es, de, pt | n1=3, d1=4, op=divide, n2=1, d2=8 → fraction=6, mixed=6, decimal=6 | Базовый сценарий работает; F05: ошибочный точный ответ; F09: деление на ноль без сообщения | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Конвертер систем счисления](http://localhost:4321/ru/math/number-base/)<br>`math/number-base`<br>en, ru, es, de, pt | 9007199254740993 сохраняется точно; дефолт 255 → FF / 11111111 | Базовый сценарий прошёл | BigInt сохраняет длинное целое, в отличие от JSON. Удобно добавить Copy по каждой системе. |
| [Изменение в процентах](http://localhost:4321/ru/math/percent-change/)<br>`math/percent-change`<br>en, ru, es, de, pt | from=100, to=80 → change=-20, direction=-1, difference=-20 | Базовый сценарий прошёл | Начальное 0 должно давать понятное объяснение F09; отрицательные значения сейчас ограничены формой. |
| [Калькулятор процентов](http://localhost:4321/ru/math/percent-of/)<br>`math/percent-of`<br>en, ru, es, de, pt | percent=12.5, value=80 → result=10 | Базовый сценарий работает; F10: 1.2.3 принимается за 123 | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Калькулятор пропорций](http://localhost:4321/ru/math/proportion/)<br>`math/proportion`<br>en, ru, es, de, pt | a=3, b=12, c=6, kind=inverse → x=6 | Базовый сценарий прошёл | Обратная пропорция проверена; нулевой делитель объяснять F09. |
| [Генератор случайных чисел](http://localhost:4321/ru/math/random-number/)<br>`math/random-number`<br>en, ru, es, de, pt | диапазон 7…7 → 7; стандартный диапазон при открытии | Базовый сценарий прошёл | Равномерность и режим без повторов покрыты исходными unit-тестами; статистический аудит RNG не проводился. |
| [Конвертер римских цифр](http://localhost:4321/ru/math/roman-numerals/)<br>`math/roman-numerals`<br>en, ru, es, de, pt | MCMXCIV → 1994; дефолт 2026 → MMXXVI | Базовый сценарий прошёл | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Процентное отношение](http://localhost:4321/ru/math/what-percent/)<br>`math/what-percent`<br>en, ru, es, de, pt | part=12.5, whole=50 → percent=25 | Базовый сценарий прошёл | Нулевой whole — F09, а не просто прочерк. |

## random

| Инструмент / языки | Проверенный сценарий | Результат | Текст / следующая проверка |
|---|---|---|---|
| [Бросить кубик онлайн](http://localhost:4321/ru/random/dice-roller/)<br>`random/dice-roller`<br>en, ru, es, de, pt | один d6 — бросок и сумма; начальные настройки 2×d6 | Базовый сценарий прошёл | CSPRNG в коде; в браузере проверен d6. Монету и все типы костей добавить в регулярный E2E. |
| [Жребий онлайн](http://localhost:4321/ru/random/random-picker/)<br>`random/random-picker`<br>en, ru, es, de, pt | из Alice/Bob выбран один; единственный вариант блокируется | Базовый сценарий работает; F15: нет объяснения минимума списка | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Генератор команд](http://localhost:4321/ru/random/team-generator/)<br>`random/team-generator`<br>en, ru, es, de, pt | 4 участника → 2 команды; все участники присутствуют | Базовый сценарий прошёл | Разбиение не балансирует силу участников — уже описано; показать итоговые размеры команд. |

## repair

| Инструмент / языки | Проверенный сценарий | Результат | Текст / следующая проверка |
|---|---|---|---|
| [Калькулятор газоблоков](http://localhost:4321/ru/repair/aerated-blocks/)<br>`repair/aerated-blocks`<br>ru, es, de, pt | length=6, height=2, openings=0, blockLength=600, blockHeight=250, blockThickness=300, reserve=0 → blocks=80, volume=3.6, area=12 | Базовый сценарий прошёл | Объём и округление проверены; EN намеренно отсутствует. Не выдавать типовую толщину за расчёт несущей стены. |
| [Калькулятор кирпича](http://localhost:4321/ru/repair/bricks/)<br>`repair/bricks`<br>en, ru, es, de, pt | length=2.6, height=3, openings=0, format=250x120x65, thickness=half, joint=10, reserve=0 → bricks=400, area=7.8 | Базовый сценарий прошёл | Сценарий шва проверен; толщина кладки моделируется кратно полукирпичам, ограничение оставить явным. |
| [Калькулятор бетона](http://localhost:4321/ru/repair/concrete/)<br>`repair/concrete`<br>en, ru, es, de, pt | length=5, width=4, thickness=0.1, reserve=0, premixBag=40, mix=1-2-4, bag=50 → volume=2 | Базовый сценарий прошёл | Объём проверен; рецептура не гарантирует марку/прочность. Расход premix брать у производителя. |
| [Калькулятор ламината](http://localhost:4321/ru/repair/laminate/)<br>`repair/laminate`<br>en, ru, es, de, pt | length=5, width=4, reserve=10, pack=2 → packs=11, area=20, needed=22 | Базовый сценарий прошёл | Округление упаковок верное; добавить ввод общей площади для непрямоугольного помещения. |
| [Калькулятор краски](http://localhost:4321/ru/repair/paint/)<br>`repair/paint`<br>en, ru, es, de, pt | length=5, width=4, height=3, openings=4, surface=walls, coats=2, coverage=10, can=2.5 → area=50, liters=10, cans=4 | Базовый сценарий прошёл | Площадь/слои/банки проверены; покрытия брать с этикетки, единицы сохранять при переключении F11. |
| [Калькулятор плитки](http://localhost:4321/ru/repair/tiles/)<br>`repair/tiles`<br>en, ru, es, de, pt | area=10, length=50, width=20, thickness=10, joint=0, reserve=10, perBox=10, adhesive=4 → pieces=110, boxes=11, grout=0 | Базовый сценарий прошёл | Шов/упаковки/клей проверены на простом эталоне; оценка по площади не заменяет раскладку. |
| [Калькулятор обоев](http://localhost:4321/ru/repair/wallpaper/)<br>`repair/wallpaper`<br>en, ru, es, de, pt | length=5, width=4, height=2.4, openings=0, rollWidth=0.5, rollLength=10, repeat=0 → rolls=9, strips=36, perRoll=4 | Базовый сценарий прошёл | Полосы и рулоны проверены; вычитание окон и тип стыковки требуют консервативного режима. |

## security

| Инструмент / языки | Проверенный сценарий | Результат | Текст / следующая проверка |
|---|---|---|---|
| [Base64](http://localhost:4321/ru/security/base64/)<br>`security/base64`<br>en, ru, es, de, pt | Привет 🌍 → UTF-8 Base64; %%% при decode — ошибка; копирование hello | Базовый сценарий прошёл | UTF-8, недопустимый ввод и clipboard проверены; отделять текстовую и файловую задачу. |
| [Шифр Цезаря](http://localhost:4321/ru/security/caesar-cipher/)<br>`security/caesar-cipher`<br>en, ru, es, de, pt | ABC xyz, сдвиг 3 → DEF abc | Базовый сценарий прошёл | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Генератор хешей](http://localhost:4321/ru/security/hash/)<br>`security/hash`<br>en, ru, es, de, pt | abc → эталоны MD5 и SHA-256 | Базовый сценарий прошёл | MD5/SHA-1 не рекомендуются для безопасности — полезная оговорка уже есть. |
| [Азбука Морзе](http://localhost:4321/ru/security/morse-code/)<br>`security/morse-code`<br>en, ru, es, de, pt | SOS → ... --- ... | Базовый сценарий прошёл | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |
| [Генератор паролей](http://localhost:4321/ru/security/password-generator/)<br>`security/password-generator`<br>en, ru, es, de, pt | 16 символов; новый пароль отличается; все наборы выключены — подсказка | Базовый сценарий прошёл | CSPRNG и восстановление при пустом наборе работают; энтропию называть оценкой. |
| [URL-кодирование](http://localhost:4321/ru/security/url-encode/)<br>`security/url-encode`<br>en, ru, es, de, pt | a b&=é → a%20b%26%3D%C3%A9 | Базовый сценарий прошёл | Справка верно отделяет параметр от целого URL; добавить явный режим form-urlencoded при необходимости. |
| [Генератор UUID](http://localhost:4321/ru/security/uuid/)<br>`security/uuid`<br>en, ru, es, de, pt | v4/v7: формат, версия и variant; генерация в браузере | Базовый сценарий прошёл | Форматы v4/v7 проверены; UUID v7 раскрывает время создания, об этом стоит сказать. |

## text

| Инструмент / языки | Проверенный сценарий | Результат | Текст / следующая проверка |
|---|---|---|---|
| [Конвертер регистра](http://localhost:4321/ru/text/case-converter/)<br>`text/case-converter`<br>en, ru, es, de, pt | Hello Мир → HELLO МИР | Базовый сценарий прошёл | Все-слова-с-заглавной не AP/Chicago — корректно оговорено. Добавить явный пример camelCase с уже смешанным регистром. |
| [Обработка списка строк](http://localhost:4321/ru/text/line-tools/)<br>`text/line-tools`<br>en, ru, es, de, pt | a/b/a → a/b при удалении дублей | Базовый сценарий прошёл | Дубли и порядок проверены; полезна опция нормализации Unicode и пробелов. |
| [Генератор Lorem ipsum](http://localhost:4321/ru/text/lorem-ipsum/)<br>`text/lorem-ipsum`<br>en, ru, es, de, pt | 5 слов — ровно 5 слов | Базовый сценарий прошёл | Количество слов проверено; на мобильном нужен ввод ≥16 px и удобная кнопка Copy. |
| [Транслитерация](http://localhost:4321/ru/text/transliteration/)<br>`text/transliteration`<br>ru | Юрий Щукин → Iurii Shchukin, режим загранпаспорта | Базовый сценарий прошёл | Сверять версии ГОСТ/ICAO с первоисточником; для билета правильнее существующее написание паспорта. |
| [Счётчик слов и символов](http://localhost:4321/ru/text/word-counter/)<br>`text/word-counter`<br>en, ru, es, de, pt | Hello world! / Привет мир. → 4 слова, 2 предложения; из-за → 2 слова | Базовый сценарий работает; C06: дефисные слова не соответствуют обещанию статьи | Формула и пример согласованы в проверенном сценарии; применимы общие замечания к категории в отчёте 03. |

## Что обязательно добавить в регулярную проверку

В каждом релизе: один независимый эталон, ошибка ввода и восстановление, другой язык/локаль, мобильный сценарий. Для файлов — проверить байты/размер/метаданные скачанного результата, число записей ZIP и коллизии имён. Для дат — граничные дни, negative epoch и DST в разных полушариях. Для чисел — точность и инвариантность при смене единиц.
