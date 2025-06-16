import { verifyAuthToken } from "@/lib/auth";

export function isUniqueConstraintError(error: unknown): boolean {
  const err = error as { code?: string };
  return err.code === "P2002";
}

export function isForeignKeyConstraintError(error: unknown): boolean {
  const err = error as { code?: string };
  return err.code === "P2003";
}

export function checkExistingAuth(): { token: string | null; isValid: boolean } {
  try {
    if (typeof window === 'undefined') {
      // Server-side rendering
      return { token: null, isValid: false };
    }
    
    const token = sessionStorage.getItem("teacher_token");
    
    if (!token) {
      return { token: null, isValid: false };
    }
    
    const isValid = verifyAuthToken(token);
    
    if (!isValid) {
      // Clean up invalid token
      sessionStorage.removeItem("teacher_token");
      return { token: null, isValid: false };
    }
    
    return { token, isValid: true };
  } catch (error) {
    // If there's any error, clean up potentially corrupted token
    try {
      sessionStorage.removeItem("teacher_token");
    } catch {
      // Ignore cleanup errors
    }
    return { token: null, isValid: false };
  }
} 