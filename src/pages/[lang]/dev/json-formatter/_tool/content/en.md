## How to use

Paste JSON and it's formatted with indentation right away. If there's an error, you'll see the exact line and column. Modes:

- **2- or 4-space indent, tabs** — for reading and pasting into code;
- **Sort keys** — object keys in alphabetical order at every level, handy for comparing two JSON documents;
- **Minify** — everything on one line without extra whitespace, for APIs and config files.

Your data is processed in the browser and never sent anywhere, so it's safe to check JSON with tokens or personal data.

## Common JSON errors

- **Single quotes:** `{'a': 1}` — JSON strings and keys need double quotes.
- **Trailing commas:** `[1, 2,]` — not allowed in JSON (fine in JavaScript).
- **Unquoted keys:** `{a: 1}` — that's JavaScript, not JSON.
- **Comments** `//` and `/* */` — standard JSON doesn't have them.
- **Leading zeros** like `01`, plus `NaN` and `undefined` — invalid values.

## FAQ

**Why isn't `é` written as `\u00e9`?** JSON allows this character to be written directly; the Unicode escape is optional.

**Is there a size limit?** Processing depends on your device’s available memory and performance. Large documents can take longer.

**Can numbers change?** Very large integers and decimals with many digits can: the browser stores JSON numbers with about 15–17 significant digits. For example, `9007199254740993` becomes `9007199254740992`. If your data has IDs or amounts like that, keep them as strings.

To encode JSON for a URL or as Base64, use the [URL encoder](/en/security/url-encode/) or [Base64](/en/security/base64/).
