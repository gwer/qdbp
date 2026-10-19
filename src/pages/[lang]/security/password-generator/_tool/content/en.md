## How to use

Pick a length and the character sets — a password appears right away. "Generate again" gives you a new one, "Copy" puts it on your clipboard.

The password is generated in your browser with a cryptographically secure random number generator (`crypto.getRandomValues`). It's never sent to a server or stored anywhere.

## How long should a password be?

Length matters most. For a random password, strength is measured as entropy — how many bits of randomness it contains:

- 8 characters, letters and numbers — about **48 bits**: fair;
- 12 characters, all sets — about **78 bits**: strong;
- 16 characters, all sets — about **104 bits**: very strong.

For important accounts, 14–16 characters or more is a sensible choice — and a password manager means you don't have to remember them.

## FAQ

**Why avoid look-alike characters?** If you ever have to type the password by hand, l and 1 or O and 0 are easy to mix up. It costs very little strength.

**Can I reuse a password on several sites?** It's best not to: if one site leaks, every account using that password is at risk.

**Why does every password include each selected type?** Many sites require at least one number, one uppercase letter and so on — the generator guarantees it.
