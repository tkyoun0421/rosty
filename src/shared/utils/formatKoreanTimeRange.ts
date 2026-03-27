import { formatKoreanTime } from "#shared/utils/formatKoreanTime";

export function formatKoreanTimeRange(startAt: Date, endAt: Date) {
  return `${formatKoreanTime(startAt)} - ${formatKoreanTime(endAt)}`;
}
