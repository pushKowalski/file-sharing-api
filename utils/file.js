import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

export const generateUniqueFilename = (originalName) => {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  const uniqueId = nanoid(10);
  return `${uniqueId}-${baseName}${ext}`;
};

export const generateUniqueShareCode = () => {
  return nanoid(8);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round((bytes / Math.pow(k, index)) * 100) / 100} ${
    sizes[index]
  }`;
};

export const deleteFileFromServer = async (fileName) => {
  const filePath = path.join(process.env.UPLOAD_DIR, fileName);

  try {
    await fs.promises.unlink(filePath);
    return true;
  } catch (err) {
    console.error("Error deleting file:", err);
    return false;
  }
};

export const isFileOnServer = (filePath) => {
  return fs.existsSync(filePath);
};
