/** Процентное кодирование для параметров и фрагментов URL (как encodeURIComponent). */
export const encodeUrl = (s: string) => encodeURIComponent(s);

/** Декодирование; «+» считается пробелом — так кодируются формы и строки запроса. */
export const decodeUrl = (s: string) => decodeURIComponent(s.replace(/\+/g, ' '));
