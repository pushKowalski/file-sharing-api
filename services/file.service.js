import path from "path";
import { desc, eq, sql, and, lte } from "drizzle-orm";
import { db } from "../db/index.js";
import { filesTable } from "../models/file.model.js";
import {
  deleteFileFromServer,
  generateUniqueShareCode,
  isFileOnServer,
} from "../utils/file.js";

export class FileService {
  static async uploadFile(fileData) {
    let expiresAt = null;

    if (fileData.expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + fileData.expiresInDays);
    }

    let shareCode;
    let isUnique = false;

    while (!isUnique) {
      shareCode = generateUniqueShareCode();

      const [existingFile] = await db
        .select({
          shareCode: filesTable.shareCode,
        })
        .from(filesTable)
        .where(eq(filesTable.shareCode, shareCode))
        .limit(1);

      if (!existingFile) {
        isUnique = true;
      }
    }

    const [file] = await db
      .insert(filesTable)
      .values({
        originalName: fileData.originalName,
        storedName: fileData.storedName,
        mimeType: fileData.mimeType,
        fileSize: fileData.fileSize,
        shareCode,
        userId: fileData.userId,
        expiresAt,
        downloadCount: 0,
      })
      .returning();

    const shareUrl = `${process.env.BASE_URL}/api/v1/download/${shareCode}`;

    return {
      ...file,
      shareUrl,
    };
  }

  static async downloadFile(shareCode) {
    const [file] = await db
      .select()
      .from(filesTable)
      .where(eq(filesTable.shareCode, shareCode))
      .limit(1);

    if (!file) {
      const error = new Error("File not found");
      error.statusCode = 404;
      throw error;
    }

    const filePath = path.join(process.env.UPLOAD_DIR, file.storedName);

    if (file.expiresAt && new Date(file.expiresAt) < new Date()) {
      this.deleteFile(file.id);
      const err = new Error("File has expired");
      err.statusCode = 404;
      throw err;
    }

    if (!isFileOnServer(filePath)) {
      const err = new Error("File not found on server");
      err.statusCode = 404;
      throw err;
    }

    return { file, filePath };
  }

  static async incrementDownloadCount(fileId) {
    await db
      .update(filesTable)
      .set({
        downloadCount: sql`${filesTable.downloadCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(filesTable.id, fileId));
  }

  static async getFileInfo(shareCode) {
    const [file] = await db
      .select()
      .from(filesTable)
      .where(eq(filesTable.shareCode, shareCode))
      .limit(1);

    if (file.expiresAt && new Date(file.expiresAt) < new Date()) {
      this.deleteFile(file.id);
    }

    return file;
  }

  static async getMyFiles(userId) {
    const files = await db
      .select()
      .from(filesTable)
      .where(eq(filesTable.userId, userId))
      .orderBy(desc(filesTable.createdAt));

    return files.map((file) => ({
      ...file,
      shareUrl: `${process.env.BASE_URL}/api/v1/download/${file.shareCode}`,
    }));
  }

  static async deleteFile(fileId, userId) {
    const [file] = await db
      .select()
      .from(filesTable)
      .where(and(eq(filesTable.id, fileId), eq(filesTable.userId, userId)))
      .limit(1);

    if (!file) {
      const err = new Error(
        "File not found or you don't have permission to delete this file"
      );
      err.statusCode = 401;
      throw err;
    }

    await db.delete(filesTable).where(eq(filesTable.id, file.id));
    await deleteFileFromServer(file.storedName);

    return file;
  }

  static async getAllFiles() {
    const files = await db
      .select()
      .from(filesTable)
      .orderBy(desc(filesTable.createdAt));

    return files.map((file) => ({
      ...file,
      shareUrl: `${process.env.BASE_URL}/api/v1/download/${file.shareCode}`,
    }));
  }

  static async deleteExpiredFiles() {
    const expiredFiles = await db
      .select()
      .from(filesTable)
      .where(lte(filesTable.expiresAt, new Date()));

    let deletedCount = 0;

    for (const file of expiredFiles) {
      try {
        await deleteFileFromServer(file.storedName);
        await db.delete(filesTable).where(eq(filesTable.id, file.id));
        deletedCount++;
      } catch (err) {
        console.error("Unable to delete file:", err);
      }
    }

    return { deletedCount, timestamp: new Date().toISOString() };
  }
}
