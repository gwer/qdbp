## What is a Unix timestamp?

Unix time is the number of seconds since midnight UTC on January 1, 1970. Databases, logs, APIs and most programming languages store time this way. JavaScript and Java often use milliseconds instead — the number is three digits longer.

## How to use

Paste a timestamp and choose the units. You'll see the date and time in your time zone, in UTC and in ISO 8601 format. The current timestamp is shown below and updates every second.

## Examples

- `0` — January 1, 1970, 00:00:00 UTC.
- `1767225600` — **January 1, 2026, 00:00:00 UTC**.
- `1700000000` — November 14, 2023, 22:13:20 UTC.
- `2147483647` — January 19, 2038, 03:14:07 UTC: the largest value a signed 32-bit integer can hold (the "Year 2038 problem").

## FAQ

**Is it seconds or milliseconds?** Present-day timestamps in seconds have 10 digits; in milliseconds, 13.

**Is daylight saving time taken into account?** Yes, local time follows your time zone's rules for that date.

**Can I enter a negative number?** Yes, negative values are dates before 1970.
