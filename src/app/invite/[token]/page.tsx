import { GoogleSignInButton } from "#mutations/auth/components/GoogleSignInButton";

export default async function InviteTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <main>
      <h1>초대 수락</h1>
      <p>Google 로그인 후 회원 정보를 입력하면 초대 수락이 완료됩니다.</p>
      <GoogleSignInButton inviteToken={token} label="Google로 초대 수락" />
    </main>
  );
}
