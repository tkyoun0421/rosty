import { createAppError, type AppError, type AppErrorCode } from "#shared/lib/appError";

type ErrorResponsePayload = {
  message?: unknown;
} | null;

function toAppErrorCode(status: number): AppErrorCode {
  if (status === 400) {
    return "BAD_REQUEST";
  }

  if (status === 401) {
    return "UNAUTHORIZED";
  }

  if (status === 403) {
    return "FORBIDDEN";
  }

  if (status === 404) {
    return "NOT_FOUND";
  }

  if (status === 409) {
    return "CONFLICT";
  }

  return "UNKNOWN";
}

async function readErrorResponsePayload(response: Response): Promise<ErrorResponsePayload> {
  try {
    return (await response.json()) as ErrorResponsePayload;
  } catch {
    return null;
  }
}

function resolveErrorMessage(payload: ErrorResponsePayload, fallbackMessage: string): string {
  return typeof payload?.message === "string" && payload.message.trim().length > 0
    ? payload.message
    : fallbackMessage;
}

export async function createResponseAppError(
  response: Response,
  fallbackMessage: string,
): Promise<AppError> {
  const payload = await readErrorResponsePayload(response);

  return createAppError({
    code: toAppErrorCode(response.status),
    message: resolveErrorMessage(payload, fallbackMessage),
    status: response.status,
  });
}

export async function throwIfResponseError(
  response: Response,
  fallbackMessage: string,
): Promise<void> {
  if (response.ok) {
    return;
  }

  throw await createResponseAppError(response, fallbackMessage);
}

export function createNetworkAppError(cause: unknown, fallbackMessage: string): AppError {
  return createAppError({
    code: "NETWORK_ERROR",
    message: fallbackMessage,
    cause,
  });
}
