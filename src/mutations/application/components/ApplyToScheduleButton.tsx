import { submitScheduleApplication } from "#mutations/application/actions/submitScheduleApplication";
import { Button } from "#shared/ui/button";

interface ApplyToScheduleButtonProps {
  scheduleId: string;
  applied: boolean;
}

export function ApplyToScheduleButton({ scheduleId, applied }: ApplyToScheduleButtonProps) {
  if (applied) {
    return (
      <Button type="button" variant="secondary" disabled>
        Application submitted
      </Button>
    );
  }

  return (
    <form action={submitScheduleApplication as unknown as (formData: FormData) => Promise<void>}>
      <input type="hidden" name="scheduleId" value={scheduleId} />
      <Button type="submit">Apply now</Button>
    </form>
  );
}
