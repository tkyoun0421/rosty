import { GoogleSignInButton } from "#mutations/auth/components/GoogleSignInButton";

export function SignInPage() {
  return (
    <main>
      <h1>로그인</h1>
      <p>Google 계정으로 로그인한 뒤 필요한 회원 정보를 입력해 주세요.</p>
      <GoogleSignInButton label="Google로 계속" />
    </main>
  );
}
