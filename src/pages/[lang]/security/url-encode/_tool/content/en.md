## Why encode URLs?

Only Latin letters, digits and a few special characters are allowed in a URL. Spaces, non-English letters and `&`, `=`, `?`, `#` inside a parameter must be written as `%XX` — that's percent-encoding. Browsers do it for you, but when you build links by hand, in code or in tracking tags (UTM), you have to encode values yourself.

## How to use

Choose "Encode" to make text safe for a URL, or "Decode" to turn a link full of `%XX` back into readable text.

## Examples

- `price & size` → `price%20%26%20size`
- `caf%C3%A9%20%26%20cr%C3%A8me` → `café & crème`

## FAQ

**Why is a space sometimes `%20` and sometimes `+`?** In form query strings a space is traditionally `+`; elsewhere in a URL it's `%20`. When decoding, `+` is treated as a space; when encoding, `%20` is always used — it works everywhere.

**Is `/` encoded?** In “Encode” mode, yes: it encodes a parameter value (`encodeURIComponent`), so `/`, `?`, `&` and `=` become `%XX` too. To encode a whole link, choose “Encode full URL” (`encodeURI`): the URL's own characters stay, while spaces and non-ASCII letters are encoded.

For arbitrary data, use [Base64](/en/security/base64/).
