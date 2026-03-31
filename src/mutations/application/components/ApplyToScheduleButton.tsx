import { submitScheduleApplication } from "#mutations/application/actions/submitScheduleApplication";

interface ApplyToScheduleButtonProps {
  scheduleId: string;
  applied: boolean;
}

export function ApplyToScheduleButton({ scheduleId, applied }: ApplyToScheduleButtonProps) {
  if (applied) {
    return <span>신청 완료</span>;
  }

  return (
    <form action={submitScheduleApplication}>
      <input type="hidden" name="scheduleId" value={scheduleId} />
      <button type="submit">신청하기</button>
    </form>
  );
}
