import crypto from "crypto";

const TEACHER_KEY = process.env.TEACHER_KEY || "";
const SECRET_KEY = process.env.SECRET_KEY || "default-secret-key";

export function hashPassword(password: string): string {
  return crypto.createHmac("sha256", SECRET_KEY).update(password).digest("hex");
}

export function verifyTeacherPassword(inputPassword: string): boolean {
  if (!TEACHER_KEY) {
    console.error("TEACHER_KEY environment variable not set");
    return false;
  }
  
  const hashedInput = hashPassword(inputPassword);
  const hashedTeacherKey = hashPassword(TEACHER_KEY);
  
  return hashedInput === hashedTeacherKey;
}

export function generateAuthToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function verifyAuthToken(token: string): boolean {
  return token.length === 64 && /^[a-f0-9]+$/.test(token);
} 