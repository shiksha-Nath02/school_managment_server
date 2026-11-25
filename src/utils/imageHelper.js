const { key, uploadBuffer, PUBLIC_BUCKET } = require('./s3');
const { compressImage } = require('./imageCompress');

// Decode a base64 image, compress it (shared compressImage → ~1280px JPEG, the
// SAME pipeline every image upload uses), upload to the PUBLIC bucket under
// `folder`/, and return the S3 KEY (not a URL). Callers store the key and build
// a CDN url via s3.publicUrl() on read. `folder` defaults to 'attendance' for
// backward compatibility with existing callers. Returns null for empty input.
async function saveBase64Image(base64Data, filename, folder = 'attendance') {
  if (!base64Data) return null;
  const data = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const { buffer, contentType } = await compressImage(Buffer.from(data, 'base64'));
  const objectKey = key(folder, filename);
  await uploadBuffer({ bucket: PUBLIC_BUCKET, key: objectKey, body: buffer, contentType });
  return objectKey;
}

module.exports = { saveBase64Image };
