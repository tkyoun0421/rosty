import { GoogleSignInButton } from "#mutations/auth/components/GoogleSignInButton";

export function SignInPage() {
  return (
    <main>
      <h1>로그인</h1>
      <GoogleSignInButton label="Google로 계속" />
    </main>
  );
}
