import { describe, expect, it } from "vitest";

import { createAppError, isAppError } from "#shared/lib/appError";

describe("appError", () => {
  it("creates a discriminated app error object", () => {
    const error = createAppError({
      code: "CONFLICT",
      message: "Duplicate request",
      status: 409,
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("AppError");
    expect(error.kind).toBe("app-error");
    expect(error.code).toBe("CONFLICT");
    expect(error.message).toBe("Duplicate request");
    expect(error.status).toBe(409);
    expect(error.cause).toBeUndefined();
    expect(isAppError(error)).toBe(true);
  });

  it("rejects non app error values", () => {
    expect(isAppError(new Error("nope"))).toBe(false);
    expect(isAppError({ code: "CONFLICT", message: "Duplicate request" })).toBe(false);
    expect(isAppError(null)).toBe(false);
  });
});
