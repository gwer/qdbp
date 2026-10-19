## What is a UUID?

A UUID (also called a GUID) is a 128-bit identifier like `550e8400-e29b-41d4-a716-446655440000`. It can be created anywhere without a central counter, and the chance of two UUIDs colliding is vanishingly small. UUIDs are used as database keys and as IDs for orders, files and events.

## v4 or v7?

- **v4** is fully random (122 random bits). It's the right choice almost always.
- **v7** puts the creation time in milliseconds in the first 48 bits and fills the rest randomly (RFC 9562, 2024). v7 UUIDs sort by creation time, so they make better primary keys: indexes grow in order.

## How to use

Pick a version and how many you need — the UUIDs appear right away. You can switch to uppercase or remove the hyphens. Everything is generated in your browser with `crypto.getRandomValues`.

## FAQ

**Can a UUID repeat?** In theory yes, in practice no: you'd need to generate about 2.7 quintillion (2.7 × 10¹⁸) v4 UUIDs for a 50% chance of a single duplicate.

**What's the difference between a UUID and a GUID?** None — GUID is Microsoft's name for the same format.

**Can I get the creation time from a v7 UUID?** Yes: the first 12 hex digits are the time in milliseconds since January 1, 1970. Convert it with the [Unix timestamp converter](/en/dates/unix-timestamp/) in milliseconds mode.
