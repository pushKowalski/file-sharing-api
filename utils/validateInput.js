import {
  loginSchemaValidation,
  signupSchemaValidation,
} from "../validations/auth.validation.js";

export const validateSignupInput = async (input) => {
  const validation = await signupSchemaValidation.safeParseAsync(input);

  if (!validation.success) {
    const error = new Error("Invalid signup input");
    error.validationErrors = validation.error.format();
    error.statusCode = 400;
    throw error;
  }

  return validation.data;
};
export const validateLoginInput = async (input) => {
  const validation = await loginSchemaValidation.safeParseAsync(input);

  if (!validation.success) {
    const error = new Error("Invalid login input");
    error.validationErrors = validation.error.format();
    error.statusCode = 400;
    throw error;
  }

  return validation.data;
};
