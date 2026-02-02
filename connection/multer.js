import multer from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/i.test(path.extname(file.originalname).slice(1));
  if (allowed) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed."), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const randomImageName = (bytes = 16) => crypto.randomBytes(bytes).toString("hex");
