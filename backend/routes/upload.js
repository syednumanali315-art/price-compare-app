const express = require("express");
const router = express.Router();
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3Client } = require("../config/s3");
const { v4: uuidv4 } = require("uuid");
const logger = require("../config/logger");

const BUCKET = process.env.S3_BUCKET_NAME || "pricecomparehub-images";

// ─── GET /api/upload/presigned-url ────────────────────────────
// Returns a pre-signed URL to upload image directly from browser to S3
router.post("/presigned-url", async (req, res) => {
  const { filename, contentType } = req.body;
  if (!filename || !contentType) {
    return res.status(400).json({ error: "filename and contentType are required" });
  }

  const key = `products/${uuidv4()}-${filename}`;

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const imageUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/${key}`;

    logger.info(`Presigned URL generated for: ${key}`);
    res.json({ success: true, uploadUrl: url, imageUrl, key });
  } catch (err) {
    logger.error("Presigned URL error", { error: err.message });
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

module.exports = router;
