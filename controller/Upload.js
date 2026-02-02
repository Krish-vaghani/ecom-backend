import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, AWS_BUCKET_NAME, AWS_REGION } from "../connection/awsConfig.js";
import { randomImageName } from "../connection/multer.js";
import path from "path";

export const UploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded. Use field name 'image'." });
    }

    const fileName = randomImageName();
    const ext = path.extname(req.file.originalname) || ".jpg";
    const key = `test/${fileName}${ext}`;

    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await s3Client.send(command);

    const imageUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;

    return res.status(200).json({
      message: "Image uploaded successfully.",
      imageUrl,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Failed to upload image.", error: err.message });
  }
};
