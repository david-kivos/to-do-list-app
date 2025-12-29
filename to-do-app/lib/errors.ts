export class AuthenticationError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isAuthError(error: any): boolean {
  return (
    error instanceof AuthenticationError ||
    error.message?.includes("authenticated") ||
    error.message?.includes("401") ||
    error.message?.includes("Unauthorized") ||
    error.message?.includes("session has expired")
  );
}