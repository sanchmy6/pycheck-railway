export function isValidAuthToken(authToken: string): boolean {
  return !!authToken && authToken.length === 64;
}

export function isUniqueConstraintError(error: unknown): boolean {
  const err = error as { code?: string };
  return err.code === "P2002";
}

export function isForeignKeyConstraintError(error: unknown): boolean {
  const err = error as { code?: string };
  return err.code === "P2003";
} 