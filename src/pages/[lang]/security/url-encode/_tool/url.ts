/** Процентное кодирование для параметров и фрагментов URL (как encodeURIComponent). */
export const encodeUrl = (s: string) => encodeURIComponent(s);

/** Ссылка целиком (как encodeURI): «:/?#&=» и другие служебные символы URL остаются, кодируются пробелы, кириллица и т. п. */
export const encodeFullUrl = (s: string) => encodeURI(s);

/** Декодирование; «+» считается пробелом — так кодируются формы и строки запроса. */
export const decodeUrl = (s: string) => decodeURIComponent(s.replace(/\+/g, ' '));
