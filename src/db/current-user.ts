let cachedUserId: number | null = null;

export function setCurrentUserId(userId: number | null): void {
  cachedUserId = userId;
}

export function peekCurrentUserId(): number | null {
  return cachedUserId;
}

export function requireUserId(): number {
  if (cachedUserId === null) {
    throw new Error("not_logged_in");
  }
  return cachedUserId;
}
