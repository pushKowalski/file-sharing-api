import { AuthServices } from "../services/auth.service.js";
import {
  validateLoginInput,
  validateSignupInput,
} from "../utils/validateInput.js";

export class AuthController {
  static async signup(req, res, next) {
    try {
      const userData = await validateSignupInput(req.body);

      const { newUser, token } = await AuthServices.signupUser(userData);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        data: newUser,
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const userData = await validateLoginInput(req.body);

      const { payload: user, token } = await AuthServices.loginUser(userData);

      res.status(200).json({
        success: true,
        message: "User login successful",
        token,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await AuthServices.getUserProfile(req.user.id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }
}
