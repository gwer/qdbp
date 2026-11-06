## How to use it

Pick an algorithm, enter the token data (payload) as JSON and a secret — the finished token appears below, ready to copy. The header is built for you: `{"alg":"HS256","typ":"JWT"}` with the algorithm you chose.

The token is created in your browser; the secret and data are never sent anywhere. The sample that opens by default is the same token as in the [JWT decoder](/en/dev/jwt-decoder/), where you can also verify the signature of the token you create.

Only shared-secret signatures (HS256, HS384, HS512) are supported. RS and ES signatures with a private key aren't created here.

## The secret

The secret is used as UTF-8 text — that's how most libraries treat a secret given as a string. If your service stores the secret in Base64 or hex, signing with that string won't match: the service signs with the decoded bytes.

RFC 7518 requires a key at least as long as the hash output: 32 bytes for HS256, 48 for HS384, 64 for HS512. You'll get a warning if the secret is shorter. A Latin letter is 1 byte; accented and non-Latin letters take 2 or more. For a long random secret, use the [password generator](/en/security/password-generator/).

## How the token is built

1. The header and payload are written as JSON without spaces and encoded in Base64URL (Base64 with `+` and `/` replaced by `-` and `_`, and trailing `=` dropped).
2. The two parts are joined with a dot, and an HMAC of that string is computed with the chosen hash (SHA-256, SHA-384 or SHA-512) and the secret.
3. The signature, in Base64URL, becomes the third part: `header.payload.signature`.

The jwt.io example: algorithm HS256, payload `{"sub":"1234567890","name":"John Doe","iat":1516239022}`, secret `your-256-bit-secret`. The result is

`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`

The secret in this example is 19 bytes, so you'll see a warning that it's short for HS256.

## FAQ

**How do I set an expiry?** With `exp` (expires), `nbf` (not before) and `iat` (issued at), in Unix seconds — not milliseconds. To turn a date into seconds, use the [Unix timestamp converter](/en/dev/unix-timestamp/).

**Is the payload encrypted?** No, only encoded: anyone with the token can read it. Don't put passwords or personal data in a token — the signature protects against forgery, not against reading.

**Why is my token different from my server's token with the same data?** The signature depends on every byte: field order, spaces in the JSON, extra header fields such as `kid`. This tool writes JSON without spaces and keeps fields in the order you typed them. A server verifies the signature over the token itself, so it will still accept this token if the secret and algorithm match.

**Large numbers change.** Browsers can't store integers above 9,007,199,254,740,991 exactly, so put such values in the payload as strings.
