import fs from "fs";

import { FileService } from "../services/file.service.js";
import { formatFileSize } from "../utils/file.js";

export class FileController {
  static async upload(req, res, next) {
    try {
      const { expiresInDays } = req.body;
      const expiresInDaysNumber = expiresInDays ? Number(expiresInDays) : null;

      if (expiresInDays && Number.isNaN(expiresInDaysNumber)) {
        const error = new Error("Invalid expiresInDays value");
        error.statusCode = 400;
        throw error;
      }

      const fileData = {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        userId: req.user.id,
        expiresInDays: expiresInDaysNumber,
      };

      const file = await FileService.uploadFile(fileData);

      res.status(201).json({
        success: true,
        message: "File upload successful",
        data: {
          id: file.id,
          originalName: file.originalName,
          fileSize: formatFileSize(file.fileSize),
          shareCode: file.shareCode,
          shareUrl: file.shareUrl,
          expiresAt: file.expiresAt,
          createdAt: file.createdAt,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async download(req, res, next) {
    try {
      const { shareCode } = req.params;

      const { file, filePath } = await FileService.downloadFile(shareCode);

      await FileService.incrementDownloadCount(file.id);

      res.setHeader("content-type", file.mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.originalName}"`
      );

      const fileStream = fs.createReadStream(filePath);
      fileStream.on("error", next);
      fileStream.pipe(res);
    } catch (err) {
      next(err);
    }
  }

  static async fileInfo(req, res, next) {
    try {
      const { shareCode } = req.params;

      const file = await FileService.getFileInfo(shareCode);

      res.status(200).json({
        success: true,
        data: {
          originalName: file.originalName,
          mimeType: file.mimeType,
          fileSize: formatFileSize(file.fileSize),
          expiresAt: file.expiresAt,
          downloadCount: file.downloadCount,
          createdAt: file.createdAt,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async myFiles(req, res, next) {
    try {
      const userId = req.user?.id;

      const files = await FileService.getMyFiles(userId);

      const formattedFiles = files.map((file) => ({
        ...file,
        fileSize: formatFileSize(file.fileSize),
      }));

      res.status(200).json({
        success: true,
        count: formattedFiles.length,
        data: formattedFiles,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteFile(req, res, next) {
    try {
      const { fileId } = req.params;
      const userId = req.user.id;

      await FileService.deleteFile(fileId, userId);

      res.status(200).json({
        success: true,
        message: "File successfully deleted",
      });
    } catch (err) {
      next(err);
    }
  }

  static async allFiles(req, res, next) {
    try {
      const allFiles = await FileService.getAllFiles();

      res.status(200).json({
        success: true,
        count: allFiles.length,
        data: allFiles,
      });
    } catch (err) {
      next(err);
    }
  }

  static async cleanupExpiredFiles(req, res, next) {
    try {
      const { deletedCount, timestamp } =
        await FileService.deleteExpiredFiles();

      res.status(200).json({
        success: true,
        message: `Cleaned up ${deletedCount} expired file(s)`,
        timestamp,
      });
    } catch (err) {
      next(err);
    }
  }
}
