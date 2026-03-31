import {
  AUTH_CALLBACK_PATH,
  AUTH_ENV_KEYS,
  ROOT_PATH,
  SIGN_IN_PATH,
  UNAUTHORIZED_PATH,
} from "#shared/config/authConfig";

describe("auth-config", () => {
  it("exports the locked route contract", () => {
    expect(ROOT_PATH).toBe("/");
    expect(SIGN_IN_PATH).toBe("/sign-in");
    expect(AUTH_CALLBACK_PATH).toBe("/auth/callback");
    expect(UNAUTHORIZED_PATH).toBe("/unauthorized");
  });

  it("exports the phase-1 auth env keys", () => {
    expect(AUTH_ENV_KEYS).toEqual([
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
    ]);
  });
});

