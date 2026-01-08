import { z } from "zod";

export const signupSchemaValidation = z.object({
  firstName: z
    .string()
    .min(2, "First name is required")
    .transform((str) => str.trim()),
  lastName: z.string().max(55).optional(),
  email: z
    .string()
    .email("Invalid email")
    .transform((str) => str.toLowerCase().trim()),
  password: z.string().min(8, "Password should be at least 8 characters long"),
});

export const loginSchemaValidation = z.object({
  email: z
    .string()
    .email("Invalid email")
    .transform((str) => str.toLowerCase().trim()),
  password: z.string().min(1, "Invalid password"),
});
