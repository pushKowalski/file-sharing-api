import fs from "fs";
import multer from "multer";
import { generateUniqueFilename } from "../utils/file.js";

const uploadDir = process.env.UPLOAD_DIR || "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = generateUniqueFilename(file.originalname);
    cb(null, uniqueName);
  },
});

const fileFilter = (res, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES.split(",");

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type. Supported files include: ${allowedTypes.join(
          ", "
        )}`
      ),
      false
    );
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE),
  },
});

export const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      const MAX_FILE_SIZE_MB =
        Number(process.env.MAX_FILE_SIZE) / (1024 * 1024);

      const error = new Error(
        `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB`
      );
      error.statusCode = 400;
      return next(error);
    }

    const error = new Error(err.message);
    error.statusCode = 400;
    return next(error);
  }
  err.statusCode = err.statusCode || 400;
  return next(err);
};
