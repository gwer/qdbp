# Аудит: dates, math, random, convert

Субагент открывал timeanddate (duration, meeting planner), calculator.net (age, fraction, dice), random.org; epochconverter, rapidtables, wheelofnames, unitconverters — по памяти.

## Общее
- **Баг:** поля «Сколько выбрать» (random-picker) и «Сколько команд» (team-generator) не дают стереть значение: `Number(v) || 1` (В).
- Нет «Копировать» у самописных результатов: random-number, number-base, random-picker, team-generator, unix (С).

## Даты
- **days-between** — разбивка «X лет Y мес. Z дн.» (`diffYMD` уже есть); «4 нед. 2 дн.» вместо «4,3» (В).
- **age-calculator** — дата следующего ДР с днём недели и сколько исполнится, день недели рождения, итоги в неделях/месяцах (С).
- **add-to-date** — единица «рабочие дни» пн–пт (С); мини-календарь (Н).
- **countdown** — название события в URL (Н).
- **time-between** — поле «Перерыв, мин» (С).
- **time-calculator** — ок.
- **timezone-converter** — поиск по поясам вместо select на 400 пунктов (В); полоса 24 ч с рабочими часами (В, M); кнопка «Сейчас» (Н).
- **unix-timestamp** — обратное направление дата → timestamp (В); с/мс по числу цифр, «3 дня назад» (С).
- **week-number** — таблица недель года, 52/53 (С).

## Математика
- **percent-of / what-percent / proportion** — формула на подставленных числах (Н).
- **percent-change** — ок.
- **add-percent** — обратная задача «убрать добавленные 20 %» (С).
- **average** — стандартное отклонение и дисперсия (В); гистограмма (Н).
- **fractions** — смешанные числа (С); ход решения (С).
- **number-base** — группировка битов, дополнительный код (Н).
- **roman-numerals** — разбор записи (Н).
- **random-number** — копирование, столбцы (Н).

## Случайное
- **random-picker** — баг поля (В); колесо фортуны (В, M); «убрать выбранного» (С).
- **team-generator** — баг поля (В); «по N человек» (С).
- **dice-roller** — история бросков (С); произвольные грани, 2d6+3 (Н).

## Конвертеры
- Общий Converter: таблица «1, 2, 5, 10… [from] = … [to]» (С).
- **data-size-converter** — нет кбит/Мбит/Гбит (В).
- **speed-converter** — темп мин/км, мин/миля (С).
- **shoe-size** — российская система для ru (В); таблица свёрнута, а это основной контент (С).
- weight: центнер (Н).
