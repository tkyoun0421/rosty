import { describe, expect, it } from "vitest";

import {
  parseProfileImageFile,
  parseProfileOnboardingForm,
} from "#mutations/auth/schemas/profileOnboarding";

describe("profileOnboarding schema", () => {
  it("parses required onboarding fields", () => {
    const formData = new FormData();
    formData.set("fullName", "Kim Admin");
    formData.set("gender", "female");
    formData.set("birthDate", "1990-01-01");

    expect(parseProfileOnboardingForm(formData)).toEqual({
      fullName: "Kim Admin",
      gender: "female",
      birthDate: "1990-01-01",
    });
  });

  it("accepts a valid image upload", () => {
    const formData = new FormData();
    formData.set("avatar", new File(["file"], "avatar.png", { type: "image/png" }));

    expect(parseProfileImageFile(formData)?.name).toBe("avatar.png");
  });
});
