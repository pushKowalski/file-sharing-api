import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { usersTable } from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/passwordHashing.js";

export class AuthServices {
  static async signupUser(userData) {
    const normalisedEmail = userData.email.toLowerCase().trim();

    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalisedEmail))
      .limit(1);

    if (existingUser) {
      const error = new Error("user already exists");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await hashPassword(userData.password);

    const [newUser] = await db
      .insert(usersTable)
      .values({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: normalisedEmail,
        password: hashedPassword,
        role: "user",
      })
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        role: usersTable.role,
      });

    const token = generateToken(newUser);

    return { newUser, token };
  }

  static async loginUser(userData) {
    const normalisedEmail = userData.email.toLowerCase().trim();

    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        password: usersTable.password,
        role: usersTable.role,
      })
      .from(usersTable)
      .where(eq(usersTable.email, normalisedEmail))
      .limit(1);

    if (!user) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    const isValidPassword = await verifyPassword(
      userData.password,
      user.password
    );

    if (!isValidPassword) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }
    const { password, ...payload } = user;

    const token = generateToken(payload);

    return { payload, token };
  }

  static async getUserProfile(userId) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    const { password, ...cleanUser } = user;

    return cleanUser;
  }
}
