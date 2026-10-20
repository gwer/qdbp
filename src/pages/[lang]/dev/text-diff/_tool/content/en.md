## How to use it

Paste the original text into "Original" and the new version into "Changed". The differences appear right away:

- **red** — lines missing from the second text (removed);
- **green** — lines that weren't in the first text (added);
- a changed line is shown as a removed + added pair, with the words and characters that differ highlighted more strongly.

Above the result is a count of added and removed lines. **Side by side** puts the texts in two columns; **Unified** lists the changes one after another, like `git diff`. On a phone the result is always unified, since two columns don't fit. Long unchanged stretches collapse to three lines around each change — untick "Hide unchanged lines" to see everything.

The texts are compared in your browser and never sent anywhere, so it's safe to compare contracts, configs and code.

## Example

| Original | Changed |
|---|---|
| Shopping list: | Shopping list: |
| milk — 1 gallon | milk — half a gallon |
| bread | bread |
| eggs — 12 | eggs — 12 |
| cheese | coffee |
| coffee | sugar |

Result: 2 lines added, 2 removed. The milk line has changed, with "1" and "half a" highlighted inside it. "cheese" was removed, "sugar" was added, and the remaining lines match. This example is preloaded in the tool.

## How it works

Both texts are split into lines, and the tool looks for the **shortest edit script** — the fewest removed and added lines that turn the first text into the second. This is the Myers algorithm, the same one `git diff` uses by default. Within each pair of changed lines, words, spaces and punctuation are compared the same way.

If two lines share no words at all, highlighting inside them wouldn't help, so they're simply shown as removed and added.

## FAQ

**Why is a paragraph I moved shown as removed and added?** The comparison looks for a common sequence of lines in their original order. A moved block can't stay in place in that sequence, so it shows up as removed from the old position and added at the new one.

**I can't see any difference, but the lines are marked as changed.** It's most likely an invisible character: a trailing space, a tab instead of spaces, a non-breaking space. Different line endings (Windows `\r\n` vs Unix `\n`) don't count as a difference. You can strip spaces at the ends of lines with the [line tools](/en/text/line-tools/).

**Does it handle large texts?** Yes: texts tens of thousands of lines long are compared in a fraction of a second as long as there aren't too many differences. Large texts that are completely different take longer.

**Can I compare two JSON files?** Yes, but first normalize both in the [JSON formatter](/en/dev/json-formatter/) with sorted keys — then only real differences remain, not indentation or field order.
