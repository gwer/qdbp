## What is a hash?

A hash is a fixed-length "fingerprint" of data. The same text always gives the same hash, and changing even one character changes it completely. You can't recover the original text from a hash.

Hashes are used for file checksums, digital signatures, Git and blockchains.

## How to use

Type or paste text — hashes for every algorithm are computed instantly. Text is encoded as UTF-8 and everything runs in your browser.

## Examples

- `hello` → MD5 `5d41402abc4b2a76b9719d911017c592`
- `hello` → SHA-256 `2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824`

## Which algorithm should I use?

- **SHA-256** is the modern standard for checksums, signatures and integrity checks.
- **SHA-384 and SHA-512** are longer members of the same family.
- **MD5 and SHA-1** are obsolete: practical collision attacks exist. Use them only for compatibility or quick checks, never for security.

## FAQ

**Can I store passwords as SHA-256?** No. Passwords need slow, salted functions designed for the job — bcrypt, scrypt or Argon2.

**Why doesn't my hash match another tool?** Check for trailing spaces or line breaks and the text encoding — here text is always UTF-8.
