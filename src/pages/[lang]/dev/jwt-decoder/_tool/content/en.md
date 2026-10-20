## How to use it

Paste the token into the box — on its own or with the `Authorization: Bearer …` prefix; line breaks are fine too. The decoder instantly shows:

- **the header** — the signing algorithm (`alg`), type (`typ`) and sometimes the key ID (`kid`);
- **the payload** — every claim in the token as formatted JSON;
- **the `iat`, `nbf` and `exp` times** — as a date and time in your device's time zone and relative to now: "in 3 days", "2 hours ago";
- **the status** — whether the token has expired;
- **the signature** — as is, a Base64URL string.

The token is decoded in your browser and is not uploaded. Treat real access tokens as secrets: a leaked, valid bearer token may grant access within its permissions until it expires or is revoked. Decoding does not verify that a token is valid.

## Verifying the signature

Tokens using HS256, HS384 or HS512 are signed with a shared secret. If you have it, enter it in the field below the token and the signature is checked right in your browser. RS and ES signatures (public-key) aren't verified here — they need the server's public key. The payload of a regular JWT is not encrypted, only Base64URL-encoded: anyone can read it, but nobody can forge it without the key. So:

- don't put passwords or personal data in a token;
- don't act on a token's claims until the server has verified the signature;
- a token with `"alg": "none"` and an empty third part has no protection at all.

## What a JWT is made of

A token is three parts separated by dots: `header.payload.signature`. The first two are JSON encoded as Base64URL (Base64 with `+` and `/` replaced by `-` and `_`, and the trailing `=` padding dropped). Here's the example from RFC 7519:

`eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk`

Its header is `{"typ":"JWT","alg":"HS256"}` and its payload is `{"iss":"joe","exp":1300819380,"http://example.com/is_root":true}`. The `exp` value 1300819380 is March 22, 2011, 18:43 UTC, so the token expired long ago.

## Registered claims

| Claim | Meaning |
|---|---|
| `iss` | issuer — who created the token |
| `sub` | subject — usually the user ID |
| `aud` | audience — which service it's meant for |
| `exp` | expiration time (the token is invalid from this moment on) |
| `nbf` | not before — when the token becomes valid |
| `iat` | issued at |
| `jti` | unique token ID, so the token can be revoked |

`exp`, `nbf` and `iat` are Unix timestamps in seconds. To turn any such number into a date, use the [Unix timestamp converter](/en/dates/unix-timestamp/).

## Common errors

- **"A JWT has three parts"** — the token was copied incompletely or with extra text. A typical cause is a truncated line copied from a log.
- **Five parts** — that's a JWE, an encrypted token. You can't read it without the key, and that's by design.
- **"Not valid Base64URL"** — quotes, an ellipsis or other stray characters got into the token.

## FAQ

**Why does it say "expired" when the server still accepts the token?** Servers often allow a few minutes of clock skew (leeway). Also check your device's clock: the status is based on it.

**Can I edit the payload and send the token back?** You can edit it, but the signature will no longer match, and any server that verifies signatures will reject the token.

**How do I decode an arbitrary Base64 string?** Use the [Base64 decoder](/en/security/base64/); large JSON is easier to read in the [JSON formatter](/en/dev/json-formatter/).
