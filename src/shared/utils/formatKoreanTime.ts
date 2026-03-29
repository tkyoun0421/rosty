import { getSeoulDateTimeParts } from "#shared/utils/getSeoulDateTimeParts";

export function formatKoreanTime(value: Date) {
  const { hour24, minute } = getSeoulDateTimeParts(value);
  const meridiemLabel = hour24 < 12 ? "\uC624\uC804" : "\uC624\uD6C4";
  const hour12 = hour24 % 12 || 12;

  return `${meridiemLabel} ${String(hour12).padStart(2, "0")}:${minute}`;
}
