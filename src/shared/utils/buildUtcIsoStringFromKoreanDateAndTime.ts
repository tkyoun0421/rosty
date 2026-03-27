export function buildUtcIsoStringFromKoreanDateAndTime(workDate: string, time: string) {
  const [year, month, day] = workDate.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  return new Date(Date.UTC(year, month - 1, day, hour - 9, minute)).toISOString();
}
