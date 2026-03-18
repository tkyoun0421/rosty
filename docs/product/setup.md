# Rosty Setup Guide

## Prerequisites

- Node.js 22.x
- pnpm 10.x
- Expo-compatible Android emulator or device
- macOS + Xcode only when you need native iOS work

## Environment Variables

Copy `.env.example` to `.env` and fill the values below.

- `EXPO_PUBLIC_APP_ENV`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY`
- `EXPO_PUBLIC_NAVER_CLIENT_ID`

## Local Run

1. `pnpm install`
2. `pnpm start`
3. `pnpm android`

Use `pnpm ios` only on macOS with the required Apple tooling.

## Native Project Policy

- This repository starts managed-first.
- Generate native folders only when needed:
  - `pnpm prebuild:android`
  - `pnpm prebuild:ios`
- Do not commit local secrets into generated native files.

## Build and Release Baseline

- Local build check: `pnpm build`
- Cloud build baseline: EAS with `development`, `preview`, and `production` profiles from `eas.json`

## Detox Notes

- Android Detox requires a generated Android project, JDK, Android SDK, and an emulator.
- iOS Detox requires macOS, Xcode, and a generated iOS project.
