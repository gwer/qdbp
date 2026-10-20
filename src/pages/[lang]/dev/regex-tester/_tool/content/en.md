## How to use it

Type a regular expression without the surrounding slashes and paste your text. The tester instantly:

- highlights every match in the text (adjacent matches in alternating colors, empty matches as a thin bar);
- shows the number of matches and a table with each match's index (zero-based, like `index` in JavaScript) and its capture groups — number, name for named groups, and `—` when a group didn't take part;
- with **Replace** turned on, shows the result of `text.replace(regex, replacement)`, ready to copy.

It runs your browser's own regex engine, so the results are exactly what your JavaScript or TypeScript code will get. Without the `g` flag only the first match is found — just like `match` and `replace`. Up to 1,000 matches are shown.

Your text is processed in the browser and never sent anywhere.

## Flags

| Flag | What it does |
|---|---|
| `g` | finds all matches, not just the first one |
| `i` | ignores the difference between upper and lower case |
| `m` | `^` and `$` match at the start and end of each line, not only of the whole text |
| `s` | the dot `.` also matches line breaks |
| `u` | Unicode mode: `\p{…}` classes, characters outside the BMP (emoji) treated as one character, stricter syntax |
| `y` | sticky: each match must start exactly where the previous one ended |

## Cheat sheet

| Pattern | Meaning |
|---|---|
| `.` | any character except a line break |
| `\d`, `\w`, `\s` | digit, Latin letter/digit/`_`, whitespace |
| `\D`, `\W`, `\S` | anything except the above |
| `[abc]`, `[^0-9]` | one of the characters; anything but a digit |
| `*`, `+`, `?` | 0 or more, 1 or more, 0 or 1 time |
| `{2,5}` | 2 to 5 times |
| `*?`, `+?` | lazy versions: as few characters as possible |
| `^`, `$`, `\b` | start, end, word boundary |
| `(…)`, `(?<name>…)`, `(?:…)` | group, named group, non-capturing group |
| `a\|b` | `a` or `b` |
| `(?=…)`, `(?!…)` | followed / not followed by … |
| `(?<=…)`, `(?<!…)` | preceded / not preceded by … |
| `\p{L}` | any letter of any alphabet (needs the `u` flag) |

## Examples

**Numbers in text.** `\d+` with the `g` flag on "Order 15 for $1,250" gives three matches: `15`, `1` and `250` — the thousands separator splits the number. To keep it whole, use `\d[\d,]*`.

**Repeated words.** `\b(\w+)\s+\1\b` with the `gi` flags finds "the the" in "Read the the manual": `\1` refers back to whatever the first group matched.

**Extra spaces.** Pattern `\s{2,}`, flag `g`, a single space as the replacement: "too   many    spaces" → "too many spaces".

**Swapping with named groups.** Pattern `(?<first>\w+) (?<last>\w+)` with the replacement `$<last>, $<first>` turns "John Smith" into "Smith, John".

## The replacement string

- `$1`, `$2` … — the text of a group by number;
- `$<name>` — the text of a named group;
- `$&` — the whole match;
- `` $` `` and `$'` — the text before and after the match;
- `$$` — a literal dollar sign.

For example, the pattern `(\d+)-(\d+)-(\d+)` with the replacement `$2/$3/$1` turns `2026-03-15` into `03/15/2026`.

## FAQ

**Why doesn't `\w` match accented letters like é or ü?** In JavaScript `\w` is only `[A-Za-z0-9_]`, and `\b` is the boundary between those characters. For letters of any language use `\p{L}` with the `u` flag.

**Why is only one match found without the `g` flag?** That's how JavaScript works: `str.match(re)` and `str.replace(re, …)` without `g` handle only the first match. The tester mirrors this so its results agree with your code.

**The page says the expression was stopped. What happened?** Some expressions, such as `(a+)+$`, take exponential time on a string that almost matches — this is called catastrophic backtracking (ReDoS). The tester runs in a separate thread and stops it after 2 seconds so the page doesn't freeze. In production code, rewrite such an expression to avoid nested quantifiers.

**Does this work for Python, PHP or Java regex?** The basic syntax is shared, but there are differences: JavaScript has no possessive quantifiers like `a++` or atomic groups, flags are set differently, and Python writes named groups as `(?P<name>…)`. Simple expressions behave the same everywhere.

To dedupe or sort lines, try the [line tools](/en/text/line-tools/); to compare two versions of a text, use the [text compare tool](/en/dev/text-diff/).
