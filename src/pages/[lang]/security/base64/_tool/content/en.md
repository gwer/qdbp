## What is Base64?

Base64 is a way to write any data — text, an image, a file — using only Latin letters, digits and `+`, `/`, `=`. It's used wherever only text is allowed: email, JSON, data URLs and HTTP headers such as `Authorization: Basic`.

Base64 is **encoding, not encryption**: anyone can decode it, no password needed.

## How to use

Choose "Encode" or "Decode" and paste your text — the result appears instantly. Text is encoded as UTF-8, so accented letters and emoji work correctly. When decoding, the URL-safe variant (`-` and `_` instead of `+` and `/`) and strings without trailing `=` are accepted too. For URLs, JWTs and file names there's “Encode (URL-safe)”: `-` and `_` instead of `+` and `/`, with no trailing `=`.

## Examples

- `Hello, world!` → `SGVsbG8sIHdvcmxkIQ==`
- `aGVsbG8=` → `hello`

## FAQ

**Why is the encoded string longer?** Every 3 bytes become 4 characters, so the size grows by about a third.

**What do the `=` signs at the end mean?** They're padding: with padding, the length is a multiple of 4. Unpadded Base64 is also accepted here.

**Why do I get an error when decoding?** The string contains invalid characters, or the decoded data isn't text (an image, for example).

For links, use the [URL encoder](/en/security/url-encode/).
