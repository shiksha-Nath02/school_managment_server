const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const REGION = process.env.AWS_REGION || 'ap-south-1';
// Falls back to the original S3_BUCKET_NAME var already set on the EC2 box.
const PRIVATE_BUCKET = process.env.S3_PRIVATE_BUCKET || process.env.S3_BUCKET_NAME;
const PUBLIC_BUCKET = process.env.S3_PUBLIC_BUCKET;
const CDN_BASE_URL = (process.env.CDN_BASE_URL || '').replace(/\/+$/, '');
const PREFIX = process.env.S3_PREFIX || 'sant_RLD';

// Single client. Credentials come from the SDK default chain:
// env vars (AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY) or an EC2 instance role.
const client = new S3Client({ region: REGION });

// Build a tenant-prefixed S3 key from path parts: key('student-docs', 'a.jpg')
// -> 'sant_RLD/student-docs/a.jpg'. Never store the result as a URL — store the key.
const key = (...parts) => [PREFIX, ...parts].filter(Boolean).join('/');

const uploadBuffer = ({ bucket, key: objectKey, body, contentType }) =>
  client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    Body: body,
    ContentType: contentType,
  }));

// Mint a short-lived signed GET URL for a PRIVATE object. Local crypto — no AWS call.
const getPresignedUrl = (objectKey, expiresIn = 3600) =>
  getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: PRIVATE_BUCKET, Key: objectKey }),
    { expiresIn }
  );

const deleteObject = ({ bucket, key: objectKey }) =>
  client.send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey }));

// Permanent CDN URL for a PUBLIC object (CloudFront in front of the public bucket).
const publicUrl = (objectKey) => (objectKey ? `${CDN_BASE_URL}/${objectKey}` : null);

module.exports = {
  client,
  key,
  uploadBuffer,
  getPresignedUrl,
  deleteObject,
  publicUrl,
  PRIVATE_BUCKET,
  PUBLIC_BUCKET,
};
