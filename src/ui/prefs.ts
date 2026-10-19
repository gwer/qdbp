// Настройки пользователя, общие для всего сайта (формат времени, позже — система единиц).
// localStorage может быть недоступен (приватный режим, запрет cookies) — тогда просто не запоминаем.

const PREFIX = 'qdbp:';

export function readPref(name: string): string | null {
  try {
    return localStorage.getItem(PREFIX + name);
  } catch {
    return null;
  }
}

export function writePref(name: string, value: string): void {
  try {
    localStorage.setItem(PREFIX + name, value);
  } catch {
    // ничего: настройка просто не сохранится
  }
}
