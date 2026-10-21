## How to use

Add photos — drag them in, choose them or paste from the clipboard — and set the quality with the slider. Each file shows its size before and after compression. Download the results one by one or as a ZIP.

If a site or form needs a file “no larger than N KB”, choose “Target file size” and enter the limit: the tool finds the highest quality that fits. The image dimensions stay the same, so a very small limit may be out of reach — you’ll then see a warning with the size achieved. The “Compare” button on each file shows the original and the result with a slider; turn on “Actual size” to inspect compression artifacts.

Compression runs in your browser: files are never uploaded.

## How it works

Each image is re-saved as JPG or WebP at the chosen quality. Lower quality means a smaller file, but more visible artifacts.

- **80–85%** is a good balance for photos on websites, in email and messengers — the difference is hard to see.
- **60–75%** when size matters most, such as thumbnails and large galleries.
- Below 50% you usually start to see blocky areas and blurry edges.

How much smaller the file gets depends on the photo — you see the result right away and can compare settings.

## FAQ

**Why does PNG become WebP?** PNG is lossless, and a browser almost never saves it smaller than the original. Lossy WebP is much lighter and keeps transparency. If you need JPG, pick it — transparent areas become white.

**What if the compressed file is bigger?** That happens when a photo was already heavily compressed. In that case the original image is kept without re-compressing, so the file doesn't grow. Metadata is still removed from a JPEG, so it may get slightly smaller.

**How else can I reduce file size?** Most often the photo is simply too large in pixels: a 4000-pixel-wide phone photo isn't needed on a website. [Resize it](/en/images/resize-image/) first, then compress.

**Is metadata removed?** Yes — EXIF, GPS and comments aren't carried over when re-saving, and they're stripped when the original JPEG is kept. The exception is a WebP that couldn't be made smaller: it's returned unchanged. To remove them without re-compressing, use the [EXIF remover](/en/images/exif/).
