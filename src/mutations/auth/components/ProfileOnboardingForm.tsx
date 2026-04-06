"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { submitProfileOnboarding } from "#mutations/auth/actions/submitProfileOnboarding";
import { ROOT_PATH, SIGN_IN_PATH } from "#shared/config/authConfig";
import type { ProfileGender } from "#shared/model/access";
import { Alert, AlertDescription, AlertTitle } from "#shared/ui/alert";
import { Button } from "#shared/ui/button";

interface ProfileOnboardingFormProps {
  avatarUrl: string | null;
  birthDate: string | null;
  fullName: string | null;
  gender: ProfileGender | null;
}

const fieldClassName =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return "Your session expired. Sign in again to continue.";
    }

    if (error.message === "PROFILE_IMAGE_REQUIRED") {
      return "Add a profile image to finish onboarding.";
    }

    if (error.message === "PROFILE_IMAGE_INVALID_TYPE") {
      return "Use a JPG, PNG, or WEBP image file.";
    }

    if (error.message === "PROFILE_IMAGE_TOO_LARGE") {
      return "Choose an image smaller than 5 MB.";
    }
  }

  return "We could not save your profile. Try again.";
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
      className="grid gap-6"
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
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Full name
          <input
            className={fieldClassName}
            name="fullName"
            type="text"
            defaultValue={fullName ?? ""}
            required
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Gender
          <select className={fieldClassName} name="gender" defaultValue={gender ?? ""} required>
            <option value="" disabled>
              Select a value
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground sm:col-span-2">
          Birth date
          <input
            className={fieldClassName}
            name="birthDate"
            type="date"
            defaultValue={birthDate ?? ""}
            required
          />
        </label>
      </div>

      <div className="grid gap-3">
        <div className="grid gap-2">
          <p className="m-0 text-sm font-medium text-foreground">Profile image</p>
          <p className="m-0 text-sm text-muted-foreground">
            Upload a clear photo so admins and coworkers can identify you quickly.
          </p>
        </div>
        <input
          className="block w-full rounded-lg border border-dashed border-border bg-background px-3 py-3 text-sm text-foreground file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-secondary-foreground hover:file:bg-secondary/80"
          name="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (!file) {
              if (localPreviewUrlRef.current) {
                URL.revokeObjectURL(localPreviewUrlRef.current);
                localPreviewUrlRef.current = null;
              }

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
      </div>

      {previewUrl ? (
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-secondary/20 p-4">
          <Image
            src={previewUrl}
            alt="Profile preview"
            width={96}
            height={96}
            unoptimized
            className="h-24 w-24 rounded-2xl object-cover"
          />
          <div className="grid gap-1">
            <p className="m-0 text-sm font-medium text-foreground">Preview</p>
            <p className="m-0 text-sm text-muted-foreground">
              This image will be used on your profile after onboarding completes.
            </p>
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>Profile setup failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isPending}>
          {isPending ? "Saving profile..." : "Complete profile"}
        </Button>
        <p className="m-0 text-sm text-muted-foreground">
          You will return to the workspace after your profile is saved successfully.
        </p>
      </div>
    </form>
  );
}
