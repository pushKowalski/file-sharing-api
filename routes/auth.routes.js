import express from "express";
import { AuthController } from "../controller/auth.controller.js";
import { requireLogin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.get("/profile", requireLogin, AuthController.getProfile);

export default router;
