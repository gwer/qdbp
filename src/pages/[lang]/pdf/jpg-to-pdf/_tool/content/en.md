## How to use

Add images — drag them into the box, choose them on your device or paste from the clipboard (Ctrl+V). Each one becomes a separate PDF page, in order from left to right. Change the order by dragging or with the arrows under a thumbnail; the rotate and remove buttons are there too.

Settings:

- **Page size** — Letter is the US standard, A4 is used in most of the rest of the world. “Fit to image” makes each page exactly the size of the photo, with no white margins.
- **Orientation** — “Same as image” puts landscape photos on landscape pages and portrait photos on portrait pages. You can also set one orientation for all pages.
- **Margins** — a white border around the image. Document scans usually go without margins, photos for printing with 10 mm margins.

Click “Create PDF” and download the file.

## How it works

JPG and PNG are embedded in the PDF as they are, without re-compression, so no quality is lost. Phone photos with a rotation stored in their metadata come out the right way up. This is done by setting the page's rotation property; the pixels themselves aren't touched. The exception is the rare mirrored photo: it has to be re-saved as JPG at 92% quality.

WebP, GIF, BMP and other formats that PDF doesn't support are converted to JPG at 92% quality. Transparent areas become white.

Each image is fitted into the page whole, keeping its proportions, and centered. Nothing is cropped.

Files are processed in your browser and never uploaded.

## FAQ

**The PDF came out large. How do I make it smaller?** Phone photos are 3–5 MB each, and since they're embedded without re-compression, each page weighs about the same. Before creating the PDF you can [compress the photos](/en/images/compress-image/) or [resize them](/en/images/resize-image/). Or do it afterwards: the [PDF compressor](/en/pdf/compress-pdf/) re-saves the images inside the file.

**An iPhone photo won't add. What can I do?** It's most likely in HEIC format. When you pick photos from the gallery on the iPhone itself, they're usually passed on as JPG already. HEIC files copied to a computer need to be [converted to JPG](/en/images/heic-to-jpg/) first.

**How do I add images to an existing PDF?** Create a PDF from the images here, then combine it with your document in the [PDF merger](/en/pdf/merge-pdf/).
