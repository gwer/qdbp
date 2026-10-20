## What is EXIF?

Cameras and phones store hidden data in every photo: the device model, date and time, camera settings (shutter speed, aperture, ISO) and often the **GPS location where it was taken**. Post such a photo online or send it as a file, and it can reveal where you live or spend time.

## How to use

Add a photo to see what metadata it contains, with a separate warning about location data. "Download without metadata" saves a copy without EXIF, XMP, IPTC and comments. You can process several files at once and download them as a ZIP.

Everything happens in your browser: photos are never uploaded.

## No re-compression

For JPEG, metadata is removed **without re-saving the image**: only the metadata blocks are cut out, the picture itself stays byte-for-byte the same — no quality loss.

- **Keep photo rotation** keeps a single orientation tag; otherwise a photo shot in portrait may show up sideways.
- **Keep color profile** — without it, wide-gamut photos (for example from an iPhone) may look duller.

## FAQ

**Don't social networks and messengers remove metadata anyway?** Many do when you send a regular photo, but not always: send it "as a file" or "as a document" and metadata usually stays. It's safer to remove it yourself.

**Can I remove metadata from PNG and WebP?** Here, only from JPEG. Re-save PNG and WebP files with the [image converter](/en/images/convert-image/) — metadata isn't carried over.

**How do I turn off location tags on my phone?** On iPhone: Settings → Privacy & Security → Location Services → Camera → Never. On Android, turn off "Save location" in the Camera app settings.
