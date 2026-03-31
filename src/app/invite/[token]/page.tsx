import { GoogleSignInButton } from "#mutations/auth/components/GoogleSignInButton";

export default async function InviteTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <main>
      <h1>초대 수락</h1>
      <p>토큰이 유효하면 Google 로그인 후 온보딩이 완료됩니다.</p>
      <GoogleSignInButton inviteToken={token} label="Google로 초대 수락" />
    </main>
  );
}
