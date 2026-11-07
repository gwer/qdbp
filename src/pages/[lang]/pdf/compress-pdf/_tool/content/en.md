## How to use

Choose a PDF, pick a method and compression level, and click “Compress PDF”. Next to the result you'll see the file size before and after. If the file couldn't be made smaller, you get the original back: the tool never gives you a larger file.

**Compress images** is the main method. Most of a PDF's size usually comes from photos and scans. They're downsized to the chosen resolution and re-saved as JPG. Text, fonts, links, bookmarks and form fields don't change.

**As a scan** turns every page into a single JPG image. It's a fallback for when compressing images barely helped. It works when the size comes from images in formats the main method doesn't touch (JPEG 2000, CMYK, palette), from complex drawings, diagrams and maps, or from large embedded fonts. A regular scan made of page photos is shrunk by the main method too, and any recognized text in it is kept. “As a scan” removes text: you can't select it, copy it or search for it. A document that's mostly text weighs more as images than it does now — in that case you'll get the original file.

The compression level sets the image resolution:

- **200 dpi** — quality close to the original, fine for printing.
- **150 dpi** — a good balance. Text on scans stays readable, photos look fine on screen and in print.
- **100 dpi** — the smallest file. Small print on scans may become harder to read.

## How it works

The resolution limit is based on the page size. For example, on a Letter page at 150 dpi an image is downsized to 1,650 pixels on its long side (1,754 pixels for A4). Images that are already smaller are only re-saved as JPG. The new version replaces the old one only if it's at least 10% lighter.

On top of that, objects left in the file from earlier edits and no longer used anywhere are removed losslessly, and uncompressed internal data is compressed.

Re-saved images are JPG photos and regular color and grayscale images. Images in JPEG 2000, JBIG2, CMYK or with a palette are left as they are. Black-and-white scans in JBIG2 and CCITT weigh almost nothing anyway.

Everything happens in your browser; the file is never uploaded. A password-protected PDF opens after you enter the password, and the compressed file is saved without a password.

## FAQ

**Why did the file barely shrink?** It most likely has few images: text and vector graphics take little space and are already compressed. Sometimes the size comes from embedded fonts, which can't be reduced without loss.

**How do I fit a limit such as 2 MB?** Start with the medium level. If the file is still over the limit, choose high. If that doesn't help either, try the “As a scan” method: it redraws the pages as images. Another option is to [split the PDF](/en/pdf/split-pdf/) into several parts.

**Which is better: compressing the PDF or the photos before making it?** If the PDF is made from photos, it's easier to [compress the photos](/en/images/compress-image/) first. The [JPG to PDF converter](/en/pdf/jpg-to-pdf/) then embeds them without compressing them again.
