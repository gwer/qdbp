## How to use

**Image → Base64.** Add an image and get it as a data URL, plain Base64, a ready CSS rule or an `<img>` tag. Copy the result into your code.

**Base64 → image.** Paste a data URL or a Base64 string — the image appears instantly and you can download it. The format is detected from the content, even if the header says otherwise.

Everything runs in your browser; the file is never uploaded.

## Example

A transparent 1 × 1 PNG is 70 bytes, and as a data URL it looks like this:

`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGBgAAAABQABpfZFQAAAAABJRU5ErkJggg==`

## When it's useful

- Small icons and images inline in CSS or HTML — no extra request to the server.
- Images inside JSON, emails and templates where you can't attach a file.
- Debugging: see what image is hidden in a Base64 string from an API or a database.

## FAQ

**Why is Base64 bigger than the file?** Every 3 bytes become 4 characters, so the size grows by about a third.

**Should I embed large photos this way?** No — the page gets heavier and the browser can't cache the image separately. Data URLs work best for files of a few kilobytes. [Compress](/en/images/compress-image/) large images and link to them normally.

**Is Base64 encryption?** No, it's just another way to write the same data — anyone can decode it. For text, use the [Base64 encoder](/en/security/base64/).
