#!/usr/bin/env python3
"""Правки языковой вычитки (отчёт 09) по реестру evidence/language-proofreading.json.

  python3 proofreading.py status            — какие исходные фразы ещё есть в файлах
  python3 proofreading.py show [lang]       — все правки: before → after, причина
  python3 proofreading.py apply L001 L002…  — применить выбранные (точная замена, ровно одно вхождение)

Решения по правкам — в proofreading-decisions.md.
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[3]
EDITS = json.loads((HERE.parent / 'evidence/language-proofreading.json').read_text())['edits']

# Слаги, переименованные после аудита (этап 0 плана)
MOVED = {'/repair/': '/construction/', '/dev/cidr/': '/dev/subnet-calculator/', '/convert/data-converter/': '/convert/data-size-converter/'}


def path(e):
    p = e['path']
    for a, b in MOVED.items():
        p = p.replace(a, b)
    return ROOT / p


def variants(s):
    """В JSON-файлах строка хранится экранированной: кавычки, обратный слеш."""
    yield s
    yield json.dumps(s, ensure_ascii=False)[1:-1]


def find(e):
    text = path(e).read_text()
    for v in variants(e['before']):
        if text.count(v) == 1:
            return text, v
    return text, None


def status():
    missing = [e for e in EDITS if find(e)[1] is None]
    print(f'всего {len(EDITS)}, не найдено {len(missing)}')
    for e in missing:
        print(f"  {e['id']} {e['lang']} {e['route']} {e['field']}: {e['before'][:80]}")


def show(lang=None):
    for e in EDITS:
        if lang and e['lang'] != lang:
            continue
        mark = '' if find(e)[1] else '  [НЕТ В ФАЙЛЕ]'
        print(f"{e['id']} {e['priority']} {e['lang']} {e['route']} {e['field']}{mark}\n  - {e['before']}\n  + {e['after']}\n  # {e['reason']}\n")


def apply(ids):
    by_id = {e['id']: e for e in EDITS}
    for i in ids:
        e = by_id[i]
        text, v = find(e)
        if v is None:
            print(f'{i}: исходная фраза не найдена — пропущено')
            continue
        after = e['after'] if v == e['before'] else json.dumps(e['after'], ensure_ascii=False)[1:-1]
        path(e).write_text(text.replace(v, after))
        print(f'{i}: применено')


if __name__ == '__main__':
    cmd, *args = sys.argv[1:] or ['status']
    {'status': lambda: status(), 'show': lambda: show(*args), 'apply': lambda: apply(args)}[cmd]()
