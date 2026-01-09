import express from "express";
import { requireLogin, requireRole } from "../middlewares/auth.middleware.js";
import {
  multerErrorHandler,
  upload,
} from "../middlewares/upload.middleware.js";
import { FileController } from "../controller/file.controller.js";

const router = express.Router();

router.post(
  "/upload",
  requireLogin,
  upload.single("file"),
  multerErrorHandler,
  FileController.upload
);

router.get(
  "/all",
  requireLogin,
  requireRole(["admin", "moderator"]),
  FileController.allFiles
);
router.delete(
  "/admin/cleanup",
  requireLogin,
  requireRole(["admin"]),
  FileController.cleanupExpiredFiles
);
router.get("/my-files", requireLogin, FileController.myFiles);
router.delete("/:fileId", requireLogin, FileController.deleteFile);
router.get("/download/:shareCode", FileController.download);
router.get("/info/:shareCode", FileController.fileInfo);

export default router;
