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

**Why aren't non-English characters escaped as `é`?** Escaping isn't required — JSON is UTF-8 by definition.

**Is there a size limit?** Only your device's memory; files of several megabytes are processed in a fraction of a second.

To encode JSON for a URL or as Base64, use the [URL encoder](/en/security/url-encode/) or [Base64](/en/security/base64/).
