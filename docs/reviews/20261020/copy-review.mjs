// Read-only editorial proposals and coverage. Writes only to stdout.
import fs from 'node:fs';
import crypto from 'node:crypto';
const root = '/home/gwer/code/qdbp';
const base = 'src/pages/[lang]';
const langs = ['en', 'ru', 'es', 'de', 'pt'];
const inventory = JSON.parse(fs.readFileSync('evidence/inventory.json', 'utf8'));
const edits = [];
function add(route, lang, part, selector, after, reason, priority = 'P2') {
  const path = `${base}/${route}/_tool/${part}/${lang}.${part === 'i18n' ? 'json' : 'md'}`;
  const source = fs.readFileSync(`${root}/${path}`, 'utf8');
  const before = part === 'i18n'
    ? selector.split('.').reduce((o, k) => o?.[k], JSON.parse(source))
    : selector;
  if (typeof before !== 'string' || !source.includes(part === 'i18n' ? JSON.stringify(before).slice(1, -1) : before))
    throw Error(`Missing source: ${route} ${lang} ${selector}`);
  if (before === after) throw Error('Unchanged proposal');
  const parameters = s => [...s.matchAll(/\{([a-zA-Z]\w*)\}/g)].map(m => m[1]).sort().join(',');
  if (parameters(before) !== parameters(after)) throw Error(`Parameter mismatch: ${route} ${lang}`);
  edits.push({id: `L${String(edits.length + 1).padStart(3, '0')}`, priority, lang, route, path,
    field: part === 'i18n' ? selector : 'фрагмент статьи', before, after, reason});
}
const j = (r,l,k,a,why,p) => add(r,l,'i18n',k,a,why,p);
const c = (r,l,b,a,why,p) => add(r,l,'content',b,a,why,p);

// Local errors: grammar, mistranslation, incorrect meaning and a few optional edits.
j('text/case-converter','ru','description','Измените регистр текста: все буквы заглавные или строчные, каждое слово с заглавной либо заглавная только в начале предложения. Есть режимы camelCase, snake_case и kebab-case.','Нарушен синтаксический параллелизм перечисления.');
c('dates/days-between','ru','Праздничные выходные в расчёт не входят.','Праздники не исключаются: любой день с понедельника по пятницу учитывается как будний.','Исходная фраза сообщает противоположное реализации.');
c('dates/timezone-converter','ru','Почему разница с Нью-Йорком то 7, то 8 часов?','Почему разница между Москвой и Нью-Йорком то 7, то 8 часов?','Не указана точка сравнения часовых поясов.');
j('dev/json-formatter','ru','title','JSON-форматтер: форматирование и проверка JSON онлайн','Сложение с аббревиатурой: дефис; остальная часть title — предлагаемая редакция.','P3');
j('dev/regex-tester','ru','ui.timeout','Выполнение выражения длится больше {seconds} с — возможно, возник катастрофический перебор (например, из-за вложенных квантификаторов вроде (a+)+). Выполнение остановлено.','«Выражение считается» неестественно в этом контексте; сохранён параметр.');
c('convert/energy-converter','ru','в BTU указывают мощность кондиционеров.','BTU — единица энергии; мощность кондиционеров указывают в BTU/ч.','Не смешивать энергию и мощность.');
c('images/convert-image','ru','Размер изображения не меняется.','Размеры изображения в пикселях не меняются.','Размер файла меняется; речь о ширине и высоте.');
j('images/exif','ru','ui.notJpeg','Чтение и удаление метаданных без пережатия работают для JPEG.','Согласование с двумя однородными подлежащими.');
c('health/running-pace','ru','Чем длиннее дистанция, тем сильнее падает темп.','При увеличении дистанции по этой модели растёт время на каждый километр.','Темп задан в мин/км: числовое значение растёт, скорость снижается.');
c('math/number-base','ru','В системе с основанием N каждая следующая цифра справа весит в N раз больше предыдущей.','В позиционной системе с основанием N вес разряда при переходе на одну позицию влево увеличивается в N раз.','Перепутано направление изменения разрядного веса.');
c('random/team-generator','ru','Если людей не делится поровну','Если число участников не делится на число команд без остатка','Грамматически неправильная конструкция.');
c('repair/tiles','ru','остатки пригодятся для подклейки.','остатки могут пригодиться для ремонта швов.','Затирка не служит плиточным клеем.');
j('repair/paint','ru','inputs.coverage.label','Площадь на 1 л за один слой','Понятнее, что вводится м²/л, а не расход л/м².','P3');
c('security/password-generator','ru','Длина при этом почти не теряет надёжности.','При той же длине надёжность пароля снижается незначительно.','Надёжность теряет не длина; меняется набор символов.');
c('security/morse-code','ru','Раньше использовали напевы: например, «Ти-хо-ход» для Ж (`...-`) и «Па-па-па-па» для Ш (`----`). Короткий слог — точка, длинный — тире.','Для запоминания используют напевы: короткие слоги соответствуют точкам, длинные — тире. Подбирайте напевы по таблице кодов.','«Ти-хо-ход» содержит три слога для четырёх элементов кода; пример не объясняет заявленный способ.');
c('convert/speed-converter','en','Multiply by 0.6 (or by 5 and divide by 8): 100 km/h → about 62 mph.','For a rough estimate, multiply by 5 and divide by 8: 100 km/h → 62.5 mph (about 62.14 mph using the exact conversion).','0.6 и 5/8 — разные множители; 0.6 × 100 = 60.');
j('kitchen/cake-pan','en','ui.less','Reduce ingredient quantities by {p}%','Fewer ingredients означает меньше видов ингредиентов, а не меньшие количества.');
j('kitchen/cake-pan','en','ui.more','Increase ingredient quantities by {p}%','Согласовать пару подписей: меняются количества ингредиентов.');
j('finance/loan-calculator','en','description','Calculate monthly payments, total interest and a repayment schedule for a fixed-payment or equal-principal loan.','Equal-principal тоже amortizing: исходное противопоставление неверно.');
j('finance/loan-calculator','en','inputs.kind.options.annuity','Fixed monthly payments','Оба варианта погашают основной долг; назвать отличительный признак.');
j('finance/inflation','en','description','Estimate future prices at a given inflation rate and the purchasing power of an unchanged amount of money.','Money will cost не выражает ни будущую цену товара, ни покупательную способность.');
c('text/lorem-ipsum','en','"Regenerate"','"Generate again"','Инструкция должна повторять действительную подпись общей кнопки.','P3');
c('convert/length-converter','de','Wie viel Zentimeter','Wie viele Zentimeter','Перед исчисляемым множественным Zentimeter — wie viele.');
c('text/word-counter','de','Nein, nur den Speicher Ihres Geräts.','Die maximale Textlänge hängt vom verfügbaren Arbeitsspeicher Ihres Geräts ab.','Неграмматичный винительный падеж в эллиптическом ответе.');
j('text/line-tools','de','ui.modes.dedupeIgnoreCase','Duplikate entfernen, Groß-/Kleinschreibung ignorieren','Groß/klein — слишком обрывочная подпись; редакторское уточнение.','P3');
c('images/compress-image','de','Ein Handyfoto mit 4000 Pixel Breite braucht keine Website.','Für viele Websites ist ein Handyfoto mit 4000 Pixeln Breite unnötig groß.','Двусмысленная инверсия: буквально можно прочитать «фото не нужен сайт».');
j('images/resize-image','de','title','Bildgröße ändern: Fotos online verkleinern','Естественнее отглагольного существительного в поисковом заголовке.','P3');
j('convert/pressure-converter','es','ui.units.at','Kilogramos-fuerza por cm² (kgf/cm²)','Единица силы, а не массы.');
j('images/exif','es','ui.notJpeg','La lectura y la eliminación sin pérdidas funcionan con JPEG.','Согласование двух действий; sin pérdidas — обычная техническая форма.');
j('finance/roi','es','description','Calcula el retorno de una inversión (ROI), el beneficio neto y la rentabilidad anualizada (CAGR).','TAE и CAGR не синонимы; не обещать вычисление TAE.');
c('finance/roi','es','TAC','CAGR','В тексте и интерфейсе должно совпадать обозначение годового роста.');
c('convert/energy-converter','es','se usa para la potencia de los aires acondicionados.','es una unidad de energía; la potencia de los aires acondicionados se expresa en BTU/h.','BTU и BTU/h обозначают разные величины.');
c('finance/vat','pt','Em 2026 é um ano de teste','O ano de 2026 é um ano de teste','Грамматическая ошибка: отсутствует подлежащее. Налоговые ставки этим не сертифицируются.');
c('math/number-base','pt','Maiúsculas e minúsculas tanto faz','Não há distinção entre letras maiúsculas e minúsculas','Устранить ненормативное согласование и разговорный обрыв.');
c('health/running-pace','pt','quanto mais longa a prova, mais o pace cai.','quanto maior a distância, maior o tempo por quilômetro previsto por esse modelo.','В мин/км числовое значение растёт, а не падает.');
c('kitchen/recipe-scaler','pt','para quantas porções ela rende','quantas porções a receita rende','Неестественное управление render para quantas porções.');
j('kitchen/recipe-scaler','pt','description','Ajuste uma receita para outro número de porções: cole a lista de ingredientes, informe quantas porções a receita rende e quantas você precisa — as quantidades são recalculadas.','Та же конструкция в description.');
c('convert/pressure-converter','pt','120 mmHg (pressão arterial "12 por 8")','120 mmHg','120 — одна величина, 12 por 8 — пара 120/80.');
c('convert/energy-converter','pt','Um ar-condicionado de 12.000 BTUs','Um ar-condicionado de 12.000 BTU/h','Не смешивать энергию и холодопроизводительность.');
c('security/caesar-cipher','pt','**Rná, pxqgr**','**Roá, pxqgr**','При сдвиге 3 латинская l становится o; буква á остаётся прежней.');

const essential = ['Low body fat','Низкий процент жира','Porcentaje de grasa bajo','Niedriger Körperfettanteil','Baixo percentual de gordura'];
const tooLarge = ['the image exceeds the 100-megapixel limit','изображение превышает лимит 100 мегапикселей','la imagen supera el límite de 100 megapíxeles','das Bild überschreitet die Grenze von 100 Megapixeln','a imagem excede o limite de 100 megapixels'];
const jsonQ = [
  ['**Why aren\'t non-English characters escaped as `é`?** Escaping isn\'t required — JSON is UTF-8 by definition.', '**Why isn\'t `é` written as `\\u00e9`?** JSON allows this character to be written directly; the Unicode escape is optional.'],
  ['**Почему кириллица не превращается в `а…`?** Экранировать не-ASCII символы не обязательно: JSON по стандарту записывается в UTF-8.', '**Почему `а` не превращается в `\\u0430`?** Этот символ можно записывать в JSON непосредственно; Unicode-экранирование необязательно.'],
  ['**¿Por qué las tildes y la ñ no se convierten en `ñ`?** No hace falta escaparlas: JSON se escribe en UTF-8.', '**¿Por qué `ñ` no se convierte en `\\u00f1`?** JSON permite escribir este carácter directamente; la secuencia de escape Unicode es opcional.'],
  ['**Warum werden Umlaute nicht als `ü` maskiert?** Das ist nicht nötig: JSON ist per Definition UTF-8.', '**Warum wird `ü` nicht als `\\u00fc` geschrieben?** Dieses Zeichen darf in JSON direkt stehen; die Unicode-Escape-Sequenz ist optional.'],
  ['**Por que os acentos não viram `ç`?** Não é preciso escapar: JSON é UTF-8 por definição.', '**Por que `ç` não vira `\\u00e7`?** JSON permite escrever esse caractere diretamente; a sequência de escape Unicode é opcional.']
];
const thirds = [
  ['1 out of 3 is **33.33%** (exactly one third).','1 out of 3 is exactly one third: **33⅓%**, or approximately **33.33%**.'],
  ['1 от 3 — это **33,33%** (ровно одна треть).','1 от 3 — ровно одна треть: **33⅓%**, или примерно **33,33%**.'],
  ['1 de 3 es el **33,33 %** (exactamente un tercio).','1 de 3 es exactamente un tercio: **33⅓ %**, o aproximadamente **33,33 %**.'],
  ['1 von 3 sind **33,33 %** (genau ein Drittel).','1 von 3 ist genau ein Drittel: **33⅓ %**, gerundet **33,33 %**.'],
  ['1 de 3 é **33,33%** (exatamente um terço).','1 de 3 é exatamente um terço: **33⅓%**, ou aproximadamente **33,33%**.']
];
const base64 = [
  ['the length of Base64 is always a multiple of 4.','with padding, the length is a multiple of 4. Unpadded Base64 is also accepted here.'],
  ['длина Base64 всегда кратна 4.','при использовании выравнивания длина кратна 4. Этот инструмент принимает и строки без завершающих знаков `=`.'],
  ['la longitud de Base64 siempre es múltiplo de 4.','con relleno, la longitud es múltiplo de 4. Esta herramienta también acepta cadenas sin los signos `=` finales.'],
  ['Die Länge von Base64 ist immer ein Vielfaches von 4.','Mit Auffüllung ist die Länge ein Vielfaches von 4. Dieses Tool akzeptiert auch Zeichenketten ohne abschließende `=`.'],
  ['o tamanho de um Base64 é sempre múltiplo de 4.','com preenchimento, o tamanho é múltiplo de 4. Esta ferramenta também aceita textos sem os sinais `=` finais.']
];
for (const [i,l] of langs.entries()) {
  j('health/body-fat',l,'ui.categories.essential',essential[i],'Код относит сюда значения <6% / <14%, включая essential range своей таблицы, а подпись объявляет их ниже минимума. Нейтральная метка не вводит новую клиническую норму.');
  j('images/heic-to-jpg',l,'ui.errors.tooLarge',tooLarge[i],'Это заданный лимит 100 MP, а не измеренный дефицит памяти конкретного устройства.');
  c('dev/json-formatter',l,...jsonQ[i],'В вопросе потерян Unicode escape; ответ смешивает синтаксис символов и кодировку передачи.');
  c('math/what-percent',l,...thirds[i],'Отличить точную треть от округлённого десятичного результата.');
  c('security/base64',l,...base64[i],'Всегда кратна четырём неверно для поддерживаемой строки без padding.');
}
// Health FAQs: rewrite whole paragraphs so the new text is ready to hand off.
const bmi = [
  ['**Can I use BMI during pregnancy?** No, BMI isn\'t used to assess weight during pregnancy.', '**Can I use this calculator during pregnancy?** Its adult weight categories are not intended to assess your current weight during pregnancy. Healthcare professionals may use your pre-pregnancy BMI when planning care.'],
  ['**Подходит ли ИМТ во время беременности?** Нет, во время беременности его не используют.', '**Подходит ли этот калькулятор во время беременности?** Его категории для взрослых не предназначены для оценки текущего веса во время беременности. Врач может учитывать ИМТ до беременности при планировании наблюдения.'],
  ['**¿Se usa el IMC en el embarazo?** No, durante el embarazo no se utiliza.', '**¿Puedo usar esta calculadora durante el embarazo?** Sus categorías de peso para adultos no están pensadas para evaluar el peso actual durante el embarazo. El personal sanitario puede tener en cuenta el IMC anterior al embarazo al planificar la atención.'],
  ['**Kann ich den BMI in der Schwangerschaft verwenden?** Nein, in der Schwangerschaft wird er nicht angewendet.', '**Kann ich diesen Rechner in der Schwangerschaft verwenden?** Seine Gewichtskategorien für Erwachsene sind nicht zur Beurteilung des aktuellen Gewichts in der Schwangerschaft gedacht. Für die Betreuung kann der BMI vor der Schwangerschaft relevant sein.'],
  ['**Posso usar o IMC na gravidez?** Não, ele não é usado durante a gestação.', '**Posso usar esta calculadora na gravidez?** As categorias de peso para adultos não se destinam a avaliar o peso atual durante a gestação. A equipe de saúde pode considerar o IMC anterior à gravidez no planejamento do acompanhamento.']
];
const ovulation = [
  ['**What if my cycle is irregular?** Run the calculation with your shortest and your longest cycle from the past six months — your fertile window is likely somewhere in between.', '**What if my cycle is irregular?** Calendar estimates are especially uncertain with irregular cycles. Calculating your shortest and longest cycles does not establish reliable boundaries for your fertile window. Do not use this calculator for contraception.'],
  ['**Что, если цикл нерегулярный?** Посчитайте с самым коротким и самым длинным циклом за последние полгода — фертильное окно окажется где-то между ними.', '**Что, если цикл нерегулярный?** При нерегулярном цикле календарная оценка особенно неточна. Расчёты по самому короткому и самому длинному циклу не определяют надёжные границы фертильного окна. Не используйте этот калькулятор для контрацепции.'],
  ['**¿Y si mi ciclo es irregular?** Haz el cálculo con tu ciclo más corto y con el más largo de los últimos seis meses: la ventana fértil estará probablemente entre ambos.', '**¿Y si mi ciclo es irregular?** La estimación por calendario es especialmente incierta. Los cálculos con el ciclo más corto y el más largo no delimitan de forma fiable la ventana fértil. No uses esta calculadora como método anticonceptivo.'],
  ['**Und bei unregelmäßigem Zyklus?** Rechnen Sie mit Ihrem kürzesten und längsten Zyklus der letzten sechs Monate – die fruchtbaren Tage liegen vermutlich dazwischen.', '**Und bei unregelmäßigem Zyklus?** Kalenderschätzungen sind dann besonders unsicher. Berechnungen mit dem kürzesten und längsten Zyklus grenzen die fruchtbaren Tage nicht zuverlässig ein. Verwenden Sie diesen Rechner nicht zur Verhütung.'],
  ['**E se meu ciclo for irregular?** Faça o cálculo com o ciclo mais curto e com o mais longo dos últimos seis meses: o período fértil provavelmente está entre os dois.', '**E se meu ciclo for irregular?** A estimativa pelo calendário é especialmente incerta. Calcular com o ciclo mais curto e o mais longo não define limites confiáveis para o período fértil. Não use esta calculadora como método anticoncepcional.']
];
for(const [i,l] of langs.entries()) {
  c('health/bmi',l,...bmi[i],'Уточнить область применения этого калькулятора, не отрицая медицинское использование добеременного ИМТ.');
  c('health/ovulation',l,...ovulation[i],'Не обещать достоверное фертильное окно между двумя календарными оценками.');
}

const paragraph = (route,l,needle,after,why,p='P2') => {
  const path = `${root}/${base}/${route}/_tool/content/${l}.md`;
  const before = fs.readFileSync(path,'utf8').split('\n\n').find(s=>s.includes(needle));
  if(!before) throw Error(`Paragraph missing: ${route} ${l} ${needle}`);
  c(route,l,before,after,why,p);
};
const jwt = [
  'The token is decoded in your browser and is not uploaded. Treat real access tokens as secrets: a leaked, valid bearer token may grant access within its permissions until it expires or is revoked. Decoding does not verify that a token is valid.',
  'Токен декодируется в браузере и не загружается на сервер. Храните настоящие токены доступа в секрете: утёкший действующий bearer-токен может дать доступ в пределах своих прав до истечения срока или отзыва. Декодирование не подтверждает действительность токена.',
  'El token se decodifica en tu navegador y no se sube a un servidor. Trata los tokens de acceso reales como secretos: un token bearer válido que se filtre puede dar acceso dentro de sus permisos hasta que caduque o se revoque. Decodificarlo no confirma su validez.',
  'Das Token wird im Browser dekodiert und nicht hochgeladen. Behandeln Sie echte Zugangstokens vertraulich: Ein offengelegtes, gültiges Bearer-Token kann im Rahmen seiner Berechtigungen bis zum Ablauf oder Widerruf Zugriff ermöglichen. Das Dekodieren bestätigt nicht die Gültigkeit.',
  'O token é decodificado no navegador e não é enviado a um servidor. Mantenha os tokens de acesso reais em segredo: um token bearer válido que vaze pode permitir acesso dentro de suas permissões até expirar ou ser revogado. A decodificação não confirma a validade do token.'
];
const ideal = [
  '**Why do the formulas ignore age and build?** These simple formulas use height and sex, but do not account for age, muscle mass or body composition. Their results are approximate reference values, not a personal target or an assessment of health.',
  '**Почему формулы не учитывают возраст и телосложение?** Эти простые формулы используют рост и пол, но не учитывают возраст, мышечную массу и состав тела. Результаты — приблизительные ориентиры, а не персональная цель или оценка здоровья.',
  '**¿Por qué las fórmulas no tienen en cuenta la edad ni la complexión?** Estas fórmulas simples usan la estatura y el sexo, pero no la edad, la masa muscular ni la composición corporal. Sus resultados son referencias aproximadas, no un objetivo personal ni una evaluación de la salud.',
  '**Warum berücksichtigen die Formeln weder Alter noch Körperbau?** Diese einfachen Formeln verwenden Größe und Geschlecht, aber weder Alter noch Muskelmasse oder Körperzusammensetzung. Die Ergebnisse sind ungefähre Orientierungswerte, kein persönliches Zielgewicht und keine Gesundheitsbewertung.',
  '**Por que as fórmulas não consideram idade nem biotipo?** Essas fórmulas simples usam altura e sexo, mas não consideram idade, massa muscular ou composição corporal. Os resultados são referências aproximadas, não uma meta pessoal nem uma avaliação da saúde.'
];
const idealIntro = [
  'Do not use any one formula as a personal target. The formulas use different coefficients and provide approximate estimates. The calculator also shows the weight range corresponding to an adult BMI of 18.5–24.9; this is not a personal medical recommendation.',
  'Не принимайте результат одной формулы за персональную цель. Формулы используют разные коэффициенты и дают приблизительные оценки. Калькулятор также показывает диапазон веса для взрослого ИМТ 18,5–24,9; это не индивидуальная медицинская рекомендация.',
  'No tomes el resultado de una sola fórmula como objetivo personal. Las fórmulas usan distintos coeficientes y dan estimaciones aproximadas. La calculadora también muestra el rango de peso correspondiente a un IMC adulto de 18,5–24,9; no es una recomendación médica individual.',
  'Verwenden Sie das Ergebnis einer einzelnen Formel nicht als persönliches Ziel. Die Formeln nutzen unterschiedliche Koeffizienten und liefern ungefähre Schätzungen. Der Rechner zeigt außerdem den Gewichtsbereich für einen Erwachsenen-BMI von 18,5–24,9; das ist keine individuelle medizinische Empfehlung.',
  'Não use o resultado de uma única fórmula como meta pessoal. As fórmulas usam coeficientes diferentes e fornecem estimativas aproximadas. A calculadora também mostra a faixa de peso correspondente ao IMC adulto de 18,5–24,9; isso não é uma recomendação médica individual.'
];
const qrArea = [
  ['up to 7% of the area','recovery of about 7% of total codewords'],
  ['до 7% площади','восстановление примерно 7% от общего числа кодовых слов'],
  ['hasta el 7 % de la superficie','recuperación de aproximadamente el 7 % del total de palabras de código'],
  ['bis 7 % der Fläche','Wiederherstellung von etwa 7 % aller Codewörter'],
  ['até 7% da área','recuperação de cerca de 7% do total de palavras de código']
];
const qrCapacity = [
  '**How much data fits?** In byte mode, the theoretical maximum is 2,953 bytes for version 40 at error correction level L. Capacity is lower at higher correction levels. The number of characters also depends on their UTF-8 byte length.',
  '**Сколько данных помещается в QR-код?** В байтовом режиме теоретический максимум — 2953 байта для версии 40 с уровнем коррекции L. При более высоких уровнях коррекции вместимость меньше. Количество символов также зависит от их длины в байтах UTF-8.',
  '**¿Cuántos datos caben?** En modo byte, el máximo teórico es de 2953 bytes para la versión 40 con corrección de errores L. Los niveles de corrección superiores admiten menos datos. El número de caracteres también depende de su longitud en bytes UTF-8.',
  '**Wie viele Daten passen hinein?** Im Byte-Modus beträgt das theoretische Maximum 2953 Byte bei Version 40 mit Fehlerkorrekturstufe L. Höhere Korrekturstufen bieten weniger Platz. Die Zeichenzahl hängt auch von der jeweiligen UTF-8-Bytelänge ab.',
  '**Quantos dados cabem?** No modo byte, o máximo teórico é de 2.953 bytes na versão 40 com correção de erros L. Níveis de correção mais altos comportam menos dados. A quantidade de caracteres também depende do tamanho de cada um em bytes UTF-8.'
];
for(const [i,l] of langs.entries()) {
  paragraph('dev/jwt-decoder',l,['The token is decoded','Токен разбирается','El token se decodifica','Das Token wird direkt','O token é decodificado'][i],jwt[i],'Не любой JWT является действующим токеном доступа; снять абсолютное обещание, сохранив предупреждение.');
  paragraph('health/ideal-weight',l,['**Why don','**Почему формулы','**¿Por qué no tienen','**Warum berücksichtigen','**Por que as fórmulas'][i],ideal[i],'Формулы учитывают не только рост, но и пол; убрать гарантию отсутствия риска для здоровья.');
  paragraph('health/ideal-weight',l,['None of them on','Ни одной в отдельности.','Ninguna por sí sola.','Keiner allein.','Em nenhuma sozinha.'][i],idealIntro[i],'Hamwi (1964) в собственной таблице старше Devine (1974); все остальные формулы не могут быть её уточнениями.');
  c('images/qr-generator',l,...qrArea[i],'Проценты относятся к кодовым словам, не к произвольной площади; пояснение относится и к последующим уровням M/Q/H.');
  paragraph('images/qr-generator',l,['**How much data','**Сколько данных','**¿Cuántos datos','**Wie viele Daten','**Quantos dados'][i],qrCapacity[i],'Указать версию, режим и уровень коррекции для максимальной вместимости.');
}
paragraph('images/qr-generator','ru','**Как сделать QR-код на сайт','**Как сделать QR-код на сайт с русскими буквами в адресе?** Вставьте существующую ссылку без изменений. Произвольная транслитерация адреса может привести на другую страницу или к ошибке 404.','Нельзя сокращать существующую ссылку произвольной заменой её пути.');
for(const [l,needle,text] of [
  ['en','**Will it match my lender', '**Will it match my lender’s numbers?** It can match only when the rate, payment schedule, interest calculation and rounding rules are the same. Fees and insurance are not included here; compare the assumptions in your loan agreement.'],
  ['ru','**Совпадёт ли расчёт', '**Совпадёт ли расчёт с банковским?** Совпадение возможно при одинаковых ставке, графике, порядке начисления процентов и округления. Комиссии и страховки здесь не учитываются; сравните условия с кредитным договором.'],
  ['es','**¿Coincidirá con el cálculo', '**¿Coincidirá con el cálculo del banco?** Puede coincidir si son iguales el tipo de interés, el calendario de pagos y las reglas de cálculo y redondeo. Aquí no se incluyen comisiones ni seguros; compara estos supuestos con los del contrato.'],
  ['de','**Stimmt das Ergebnis', '**Stimmt das Ergebnis mit dem Angebot der Bank überein?** Es kann übereinstimmen, wenn Zinssatz, Zahlungsplan, Zinsberechnung und Rundungsregeln gleich sind. Gebühren und Versicherungen sind hier nicht enthalten; vergleichen Sie die Annahmen mit Ihrem Kreditvertrag.']
]) paragraph('finance/loan-calculator',l,needle,text,'Не обещать совпадение с любым банковским расчётом до минимальной денежной единицы.');

const electricity = [
  '**How do I enter power for a fridge?** If you use a 24-hour average power, enter 24 hours per day: the off periods are already included in that average. If you use the power while the compressor is running, enter only its actual running time. Do not apply both adjustments.',
  '**Как указать мощность холодильника?** Для средней мощности за сутки укажите 24 часа в день: паузы уже учтены в среднем значении. Для мощности при работающем компрессоре укажите только фактическое время его работы. Не применяйте обе поправки одновременно.',
  '**¿Cómo indico la potencia del frigorífico?** Si usas la potencia media de todo el día, indica 24 horas: las pausas ya están incluidas en esa media. Si usas la potencia con el compresor en marcha, indica solo el tiempo real de funcionamiento. No apliques ambos ajustes a la vez.',
  '**Wie gebe ich die Leistung des Kühlschranks ein?** Bei einer über den ganzen Tag gemittelten Leistung geben Sie 24 Stunden an: Die Pausen sind darin bereits berücksichtigt. Bei der Leistung während des Kompressorbetriebs geben Sie nur dessen tatsächliche Laufzeit an. Wenden Sie nicht beide Korrekturen zugleich an.',
  '**Como informo a potência da geladeira?** Se usar a potência média das 24 horas, informe 24 horas por dia: as pausas já estão incluídas nessa média. Se usar a potência com o compressor ligado, informe apenas o tempo real de funcionamento. Não aplique os dois ajustes ao mesmo tempo.'
];
for(const [i,l] of langs.entries()) paragraph('finance/electricity-cost',l,['**Why is a fridge','**Почему у холодильника','**¿Por qué el frigorífico','**Warum ist der Wert','**Por que a geladeira'][i],electricity[i],'Таблица уже усредняет мощность за сутки, а FAQ предлагает второй раз исключить периоды простоя.');
j('health/sleep-calculator','ru','inputs.fallAsleep.label','Время засыпания, мин','Исправить неестественное «Засыпаю за, минут».');
j('health/sleep-calculator','de','inputs.fallAsleep.label','Einschlafdauer (Minuten)','Естественная короткая подпись поля.');
for(const [l,value] of [['ru','Дней до предполагаемой даты родов'],['es','Días hasta la fecha probable de parto'],['pt','Dias até a data provável do parto']])j('health/due-date',l,'outputs.left.label',value,'Калькулятор оценивает дату, но не знает фактический день родов.');
for(const key of ['one','few','many','other']) {
  const path=`${root}/${base}/health/water-intake/_tool/i18n/ru.json`;
  const data=JSON.parse(fs.readFileSync(path,'utf8'));
  const find=(o,p='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='string'?[[p+k,v]]:find(v,p+k+'.'));
  const field=find(data).find(([k,v])=>k.endsWith('.'+key)&&v.includes('8 унций'));
  if(!field)throw Error(`Cups plural ${key}`);
  j('health/water-intake','ru',field[0],field[1].replace('8 унций','8 жидких унций'),'Объёмная жидкая унция, а не единица массы.');
}
for(const [l,b,a] of [['en','of any length','between 4 and 64 characters long'],['es','de la longitud que quieras','de entre 4 y 64 caracteres'],['de','in beliebiger Länge','mit 4 bis 64 Zeichen'],['pt','do tamanho que quiser','com 4 a 64 caracteres']]) {
  const current=JSON.parse(fs.readFileSync(`${root}/${base}/security/password-generator/_tool/i18n/${l}.json`,'utf8')).description;
  if(!current.includes(b))throw Error('Password description');
  j('security/password-generator',l,'description',current.replace(b,a),'Ползунок поддерживает 4–64, а не произвольную длину.');
}
paragraph('dev/json-formatter','de','**Gibt es eine Größenbeschränkung?**','**Gibt es eine Größenbeschränkung?** Die verarbeitbare Größe hängt vom verfügbaren Arbeitsspeicher und der Leistung Ihres Geräts ab. Große Dokumente können länger dauern.','Неграмматичное Nur den Speicher; нет оснований гарантировать доли секунды.');
for(const [l,needle,text] of [
  ['en','**Is there a size limit?', '**Is there a size limit?** Processing depends on your device’s available memory and performance. Large documents can take longer.'],
  ['ru','**Есть ли ограничение на размер?', '**Есть ли ограничение на размер?** Возможность обработки зависит от доступной памяти и производительности устройства. Большие документы могут обрабатываться дольше.'],
  ['es','**¿Hay límite de tamaño?', '**¿Hay límite de tamaño?** La capacidad de procesamiento depende de la memoria disponible y del rendimiento de tu dispositivo. Los documentos grandes pueden tardar más.'],
  ['pt','**Existe limite de tamanho?', '**Existe limite de tamanho?** O processamento depende da memória disponível e do desempenho do seu dispositivo. Documentos grandes podem demorar mais.']
]) paragraph('dev/json-formatter',l,needle,text,'Нет оснований гарантировать обработку любого документа за доли секунды.');
for(const l of ['es','pt'])for(const key of ['one','other']) {
  const source=JSON.parse(fs.readFileSync(`${root}/${base}/health/water-intake/_tool/i18n/${l}.json`,'utf8'));
  j('health/water-intake',l,`ui.cups.${key}`,source.ui.cups[key].replace('8 oz','8 fl oz'),'Уточнить, что это жидкие унции — единицы объёма.');
}
c('dates/time-calculator','pt','Quando programar o início da máquina de lavar com início programado?','Quando a máquina de lavar deve começar para terminar no horário desejado?','Устранить повтор início / início programado.','P3');
c('dates/timezone-converter','es','México dejó de aplicar el horario de verano en 2022','la mayor parte de México dejó de aplicar el horario de verano en 2022, con excepciones en la frontera norte','Уточнить географическую область утверждения.');
j('dates/days-between','de','outputs.weekdays.label','Tage von Montag bis Freitag','Снять неоднозначность Werktage: калькулятор считает только понедельник–пятницу, праздники не исключаются.','P3');
j('finance/net-salary','ru','description','Сколько вы получите на руки после НДФЛ — или какой оклад обеспечит желаемую сумму. Прогрессивная шкала 13–22%, удержание по месяцам.','Устранить повтор «нужен для нужной суммы»; налоговые параметры не меняются.','P3');
paragraph('repair/wallpaper','ru','**Нужно ли вычитать окна целиком?**','**Нужно ли вычитать окна целиком?** Калькулятор вычитает только ширину проёмов. Для участков над окнами и дверями могут понадобиться дополнительные полосы: хватит ли обрезков, зависит от размеров и совмещения рисунка. Проверьте раскрой перед покупкой.','Убрать необоснованную гарантию, что обоев не хватит только при широких окнах.');
paragraph('images/qr-generator','pt','**O QR code de Pix funciona aqui?**','**Esta ferramenta gera QR codes de pagamento Pix?** Ela não monta os dados de pagamento do Pix (BR Code). Para obter esses dados, use o aplicativo do seu banco.','Отличить создание платёжных данных от кодирования уже готового текста.','P3');

const files = [];
const track = (relative, lang, kind, route = null) => {
  const content = fs.readFileSync(`${root}/${relative}`, 'utf8');
  files.push({path:relative,lang,kind,route,sha256:crypto.createHash('sha256').update(content).digest('hex')});
};
for(const t of inventory)for(const l of t.langs) {
  for(const [part,ext] of [['i18n','json'],['content','md']]) track(`${base}/${t.route}/_tool/${part}/${l}.${ext}`,l,part,t.route);
}
for(const category of [...new Set(inventory.map(t=>t.cat))])for(const l of langs)track(`${base}/${category}/_category/i18n/${l}.json`,l,'category',category);
for(const l of langs)track(`src/i18n/ui/${l}.json`,l,'global');
const totals = Object.fromEntries(langs.map(l=>[l,{articles:files.filter(f=>f.lang===l&&f.kind==='content').length, toolDictionaries:files.filter(f=>f.lang===l&&f.kind==='i18n').length, categoryDictionaries:12,globalDictionaries:1, proposals:edits.filter(e=>e.lang===l).length}]));
const mode = process.argv[2];
if(mode==='--json')console.log(JSON.stringify({date:'2026-10-20',sourceRoot:root,scope:'Full reading of available tool articles/dictionaries, category dictionaries and shared UI; AI editorial review, not native-speaker or subject certification.',totals,edits},null,2));
else if(mode==='--coverage')console.log(JSON.stringify({date:'2026-10-20',sourceRoot:root,language:process.argv[3],files:files.filter(f=>f.lang===process.argv[3])},null,2));
else if(mode==='--tables') {
  const esc = s => s.replaceAll('|','\\|').replaceAll('[','\\[').replaceAll(']','\\]').replaceAll('\n','<br>');
  for(const l of langs.filter(l=>!process.argv[3]||l===process.argv[3])) {
    console.log(`\n## ${l.toUpperCase()}: конкретные замены\n\n| ID / приоритет | Где | Сейчас | Предлагается | Почему |\n|---|---|---|---|---|`);
    for(const e of edits.filter(e=>e.lang===l)) console.log(`| ${e.id} / ${e.priority} | \`${e.route}\` · \`${e.field}\` | ${esc(e.before)} | ${esc(e.after)} | ${esc(e.reason)} |`);
  }
} else console.log(JSON.stringify({checkedFiles:files.length,proposals:edits.length,totals},null,2));
