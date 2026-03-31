import { submitWorkerRate } from "#mutations/worker-rate/actions/submitWorkerRate";

export function WorkerRateForm({ userId }: { userId: string }) {
  return (
    <form action={submitWorkerRate}>
      <input type="hidden" name="userId" value={userId} />
      <input name="hourlyRateCents" type="number" min={1} step={1} />
      <button type="submit">시급 저장</button>
    </form>
  );
}
