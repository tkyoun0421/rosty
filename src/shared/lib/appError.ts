export type AppErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export type AppError = Error & {
  kind: "app-error";
  code: AppErrorCode;
  status?: number;
  cause?: unknown;
};

type CreateAppErrorInput = {
  code: AppErrorCode;
  message: string;
  status?: number;
  cause?: unknown;
};

export function createAppError({ code, message, status, cause }: CreateAppErrorInput): AppError {
  return Object.assign(new Error(message), {
    name: "AppError",
    kind: "app-error" as const,
    code,
    status,
    cause,
  });
}

export function isAppError(error: unknown): error is AppError {
  return (
    error instanceof Error &&
    "kind" in error &&
    error.kind === "app-error" &&
    "code" in error &&
    typeof error.code === "string"
  );
}
