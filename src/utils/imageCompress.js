const sharp = require('sharp');

// Compress + downscale an image buffer to a web-friendly JPEG.
// A 4MB phone photo typically shrinks to ~200KB. `.rotate()` honours EXIF
// orientation so portrait photos don't come out sideways.
async function compressImage(buffer, { maxWidth = 1280, quality = 80 } = {}) {
  const out = await sharp(buffer)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer();
  return { buffer: out, contentType: 'image/jpeg', ext: 'jpg' };
}

module.exports = { compressImage };
