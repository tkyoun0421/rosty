import { getSeoulDateTimeParts } from "#shared/utils/getSeoulDateTimeParts";
import { formatKoreanTime } from "#shared/utils/formatKoreanTime";

export function formatKoreanDateTime(value: Date) {
  const { month, day } = getSeoulDateTimeParts(value);

  return `${month}. ${day}. ${formatKoreanTime(value)}`;
}
