"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { submitProfileOnboarding } from "#mutations/auth/actions/submitProfileOnboarding";
import { ROOT_PATH, SIGN_IN_PATH } from "#shared/config/authConfig";
import type { ProfileGender } from "#shared/model/access";

interface ProfileOnboardingFormProps {
  avatarUrl: string | null;
  birthDate: string | null;
  fullName: string | null;
  gender: ProfileGender | null;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return "로그인이 만료되었습니다. 다시 로그인해 주세요.";
    }

    if (error.message === "PROFILE_IMAGE_REQUIRED") {
      return "프로필 사진을 등록해야 합니다.";
    }

    if (error.message === "PROFILE_IMAGE_INVALID_TYPE") {
      return "프로필 사진은 JPG, PNG, WEBP만 사용할 수 있습니다.";
    }

    if (error.message === "PROFILE_IMAGE_TOO_LARGE") {
      return "프로필 사진은 5MB 이하여야 합니다.";
    }
  }

  return "프로필 저장에 실패했습니다. 다시 시도해 주세요.";
}

export function ProfileOnboardingForm({
  avatarUrl,
  birthDate,
  fullName,
  gender,
}: ProfileOnboardingFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);
  const [isPending, startTransition] = useTransition();
  const localPreviewUrlRef = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (localPreviewUrlRef.current) {
        URL.revokeObjectURL(localPreviewUrlRef.current);
      }
    };
  }, []);

  return (
    <form
      encType="multipart/form-data"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
          setErrorMessage(null);

          try {
            await submitProfileOnboarding(formData);
            router.replace(ROOT_PATH);
            router.refresh();
          } catch (error) {
            if (error instanceof Error && error.message === "UNAUTHORIZED") {
              router.replace(SIGN_IN_PATH);
              return;
            }

            setErrorMessage(getErrorMessage(error));
          }
        });
      }}
    >
      <label>
        이름
        <input name="fullName" type="text" defaultValue={fullName ?? ""} required />
      </label>

      <label>
        성별
        <select name="gender" defaultValue={gender ?? ""} required>
          <option value="" disabled>
            선택해 주세요.
          </option>
          <option value="male">남성</option>
          <option value="female">여성</option>
          <option value="other">기타</option>
        </select>
      </label>

      <label>
        생년월일
        <input name="birthDate" type="date" defaultValue={birthDate ?? ""} required />
      </label>

      <label>
        프로필 사진
        <input
          name="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (!file) {
              setPreviewUrl(avatarUrl);
              return;
            }

            if (localPreviewUrlRef.current) {
              URL.revokeObjectURL(localPreviewUrlRef.current);
            }

            const nextPreviewUrl = URL.createObjectURL(file);
            localPreviewUrlRef.current = nextPreviewUrl;
            setPreviewUrl(nextPreviewUrl);
          }}
        />
      </label>

      {previewUrl ? <img src={previewUrl} alt="프로필 사진 미리보기" width={96} height={96} /> : null}
      {errorMessage ? <p>{errorMessage}</p> : null}

      <button type="submit" disabled={isPending}>
        {isPending ? "저장 중..." : "프로필 저장"}
      </button>
    </form>
  );
}
