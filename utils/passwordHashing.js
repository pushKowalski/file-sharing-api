import bcrypt from "bcrypt";

export const hashPassword = async (passwordStr) => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

  return await bcrypt.hash(passwordStr, saltRounds);
};

export const verifyPassword = async (passwordStr, encryptedPassword) => {
  return await bcrypt.compare(passwordStr, encryptedPassword);
};
