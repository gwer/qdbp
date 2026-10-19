## How to use

Set the range "from" and "to" (both numbers are included), how many numbers you need and whether repeats are allowed. Click "Generate" — you get a new set every time.

## Fair randomness

Numbers are generated in your browser with a cryptographic random generator (`crypto.getRandomValues`). Every number in the range has exactly the same chance: the calculator discards the few raw values that would otherwise slightly favor lower numbers.

## Examples

- Roll a die: from 1 to 6, one number.
- Pick a giveaway winner among 250 entries: from 1 to 250, one number.
- Three winners without repeats: from 1 to 250, three numbers, "No repeats".
- A 6/49 lottery ticket: from 1 to 49, six numbers, no repeats, sorted ascending.

## FAQ

**Can the result be predicted or influenced?** No. The generator doesn't use the clock or any other predictable input, and results aren't stored anywhere.

**How many numbers can I generate at once?** Up to 1,000. Without repeats, no more than there are numbers in the range.

**Do negative numbers work?** Yes, for example from −10 to 10.
