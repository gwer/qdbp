## How to use

Add your HEIC photos — drag them in, choose them or paste from the clipboard. With the first file, the browser loads the HEIC decoder once (about 0.5 MB); after that, files are converted one after another. Download the JPGs one by one or as a single ZIP.

Pixel dimensions stay the same and the photo's rotation is applied. The default quality is 90%, which is hard to tell from the original. If you need PNG (lossless) or WebP, pick it from the list.

Photos are processed right in your browser and are never uploaded.

## Why does my iPhone take photos in HEIC?

Since iOS 11, the iPhone camera saves photos as HEIC by default — the HEIF format with HEVC (H.265) compression. At the same quality the file is noticeably smaller than a JPG, so more photos fit on the phone. But Windows without extra extensions, many websites, email services and older apps can't open HEIC — hence the need to convert.

## How to make your iPhone shoot JPG

- **Settings → Camera → Formats → Most Compatible.** New photos are saved as JPG (and videos as H.264). Photos you've already taken stay HEIC.
- **Settings → Photos → Transfer to Mac or PC → Automatic.** When you copy photos to a computer over a cable, the iPhone converts them to JPG, while keeping HEIC on the phone.

## FAQ

**Are the date taken and location kept?** No. EXIF metadata — phone model, date, GPS coordinates — isn't copied to the new file. That's handy if the photo is going online. To see what a photo contains, use the [EXIF viewer](/en/images/exif/).

**Will the photo end up sideways?** No. The iPhone stores rotation separately from the image; the converter applies it, so the JPG comes out the right way up.

**What about Live Photos and bursts?** The main still image is converted. The Live Photo video is a separate .MOV file and isn't involved. If a HEIC contains several images, the one marked as primary is used.

**Why can the JPG be larger than the original HEIC?** HEIC compresses more efficiently, so at high quality the JPG often comes out bigger. To reduce the size, lower the quality to 80–85% or run the JPGs through the [image compressor](/en/images/compress-image/).

**Are there any limits?** Up to 50 MB per file and 100 megapixels per image — 48 MP shots from an iPhone Pro are fine. If a file isn't HEIC, is damaged or the browser runs out of memory, that file shows a message and the rest are converted as usual.

**How do I open HEIC on Windows without converting?** On Windows 10 and 11, install "HEIF Image Extensions" and "HEVC Video Extensions" from the Microsoft Store. If you just need to send or post a photo, converting it to JPG here is quicker.

For JPG, PNG and WebP, use the [image converter](/en/images/convert-image/).

The HEIC decoder is built on the free libraries libheif and libde265, licensed under LGPL-3.0: [license and source code](/licenses/libheif.txt).
