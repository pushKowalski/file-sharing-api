import express from "express";
import { AuthController } from "../controller/auth.controller.js";
import { requireLogin } from "../middlewares/auth.middleware.js";
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

router.get("/download/:shareCode", FileController.download);
router.get("/info/:shareCode", FileController.fileInfo);
router.get("/my-files", requireLogin, FileController.myFiles);
router.delete("/:fileId", requireLogin, FileController.deleteFile);

export default router;
