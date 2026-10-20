// Названия популярных городов для часовых поясов: Intl не даёт локализованных названий городов.
// Для остальных поясов показывается английское название из идентификатора IANA.
import type { Lang } from '@/i18n/config';
import { cityOf } from '@/lib/timezone';

const NAMES: Record<string, [ru: string, es: string, de: string, pt: string]> = {
  'Europe/Moscow': ['Москва', 'Moscú', 'Moskau', 'Moscou'],
  'Europe/London': ['Лондон', 'Londres', 'London', 'Londres'],
  'America/New_York': ['Нью-Йорк', 'Nueva York', 'New York', 'Nova York'],
  'America/Los_Angeles': ['Лос-Анджелес', 'Los Ángeles', 'Los Angeles', 'Los Angeles'],
  'America/Chicago': ['Чикаго', 'Chicago', 'Chicago', 'Chicago'],
  'America/Denver': ['Денвер', 'Denver', 'Denver', 'Denver'],
  'America/Toronto': ['Торонто', 'Toronto', 'Toronto', 'Toronto'],
  'Asia/Tokyo': ['Токио', 'Tokio', 'Tokio', 'Tóquio'],
  'Australia/Sydney': ['Сидней', 'Sídney', 'Sydney', 'Sydney'],
  'Europe/Kaliningrad': ['Калининград', 'Kaliningrado', 'Kaliningrad', 'Kaliningrado'],
  'Europe/Samara': ['Самара', 'Samara', 'Samara', 'Samara'],
  'Asia/Yekaterinburg': ['Екатеринбург', 'Ekaterimburgo', 'Jekaterinburg', 'Ecaterimburgo'],
  'Asia/Omsk': ['Омск', 'Omsk', 'Omsk', 'Omsk'],
  'Asia/Novosibirsk': ['Новосибирск', 'Novosibirsk', 'Nowosibirsk', 'Novosibirsk'],
  'Asia/Krasnoyarsk': ['Красноярск', 'Krasnoyarsk', 'Krasnojarsk', 'Krasnoyarsk'],
  'Asia/Irkutsk': ['Иркутск', 'Irkutsk', 'Irkutsk', 'Irkutsk'],
  'Asia/Yakutsk': ['Якутск', 'Yakutsk', 'Jakutsk', 'Yakutsk'],
  'Asia/Vladivostok': ['Владивосток', 'Vladivostok', 'Wladiwostok', 'Vladivostok'],
  'Asia/Magadan': ['Магадан', 'Magadán', 'Magadan', 'Magadan'],
  'Asia/Kamchatka': ['Петропавловск-Камчатский', 'Petropávlovsk-Kamchatski', 'Petropawlowsk-Kamtschatski', 'Petropavlovsk-Kamchatsky'],
  'Europe/Berlin': ['Берлин', 'Berlín', 'Berlin', 'Berlim'],
  'Europe/Paris': ['Париж', 'París', 'Paris', 'Paris'],
  'Europe/Madrid': ['Мадрид', 'Madrid', 'Madrid', 'Madri'],
  'Europe/Rome': ['Рим', 'Roma', 'Rom', 'Roma'],
  'Europe/Lisbon': ['Лиссабон', 'Lisboa', 'Lissabon', 'Lisboa'],
  'Europe/Istanbul': ['Стамбул', 'Estambul', 'Istanbul', 'Istambul'],
  'Europe/Kyiv': ['Киев', 'Kiev', 'Kyjiw', 'Kiev'],
  'Europe/Minsk': ['Минск', 'Minsk', 'Minsk', 'Minsk'],
  'Europe/Warsaw': ['Варшава', 'Varsovia', 'Warschau', 'Varsóvia'],
  'Europe/Vienna': ['Вена', 'Viena', 'Wien', 'Viena'],
  'Europe/Zurich': ['Цюрих', 'Zúrich', 'Zürich', 'Zurique'],
  'Atlantic/Canary': ['Канарские острова', 'Canarias', 'Kanaren', 'Canárias'],
  'Asia/Dubai': ['Дубай', 'Dubái', 'Dubai', 'Dubai'],
  'Asia/Almaty': ['Алматы', 'Almaty', 'Almaty', 'Almaty'],
  'Asia/Tashkent': ['Ташкент', 'Taskent', 'Taschkent', 'Tashkent'],
  'Asia/Tbilisi': ['Тбилиси', 'Tiflis', 'Tiflis', 'Tbilisi'],
  'Asia/Yerevan': ['Ереван', 'Ereván', 'Jerewan', 'Erevan'],
  'Asia/Baku': ['Баку', 'Bakú', 'Baku', 'Baku'],
  'Asia/Shanghai': ['Шанхай', 'Shanghái', 'Shanghai', 'Xangai'],
  'Asia/Hong_Kong': ['Гонконг', 'Hong Kong', 'Hongkong', 'Hong Kong'],
  'Asia/Singapore': ['Сингапур', 'Singapur', 'Singapur', 'Singapura'],
  'Asia/Bangkok': ['Бангкок', 'Bangkok', 'Bangkok', 'Bangkok'],
  'Asia/Kolkata': ['Индия (Калькутта)', 'India (Calcuta)', 'Indien (Kalkutta)', 'Índia (Calcutá)'],
  'America/Mexico_City': ['Мехико', 'Ciudad de México', 'Mexiko-Stadt', 'Cidade do México'],
  'America/Bogota': ['Богота', 'Bogotá', 'Bogotá', 'Bogotá'],
  'America/Lima': ['Лима', 'Lima', 'Lima', 'Lima'],
  'America/Santiago': ['Сантьяго', 'Santiago de Chile', 'Santiago de Chile', 'Santiago'],
  'America/Argentina/Buenos_Aires': ['Буэнос-Айрес', 'Buenos Aires', 'Buenos Aires', 'Buenos Aires'],
  'America/Sao_Paulo': ['Сан-Паулу', 'São Paulo', 'São Paulo', 'São Paulo (Brasília)'],
  'America/Manaus': ['Манаус', 'Manaos', 'Manaus', 'Manaus'],
  'America/Noronha': ['Фернанду-ди-Норонья', 'Fernando de Noronha', 'Fernando de Noronha', 'Fernando de Noronha'],
  'UTC': ['UTC', 'UTC', 'UTC', 'UTC'],
};

const IDX: Partial<Record<Lang, number>> = { ru: 0, es: 1, de: 2, pt: 3 };

export function cityName(zone: string, lang: Lang): string {
  const i = IDX[lang];
  return i !== undefined && NAMES[zone] ? NAMES[zone][i] : cityOf(zone);
}
