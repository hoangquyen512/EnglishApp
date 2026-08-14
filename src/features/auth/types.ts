export interface SessionDto {
  userId: number;
  username: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface AuthError {
  code: string;
  message: string;
}
