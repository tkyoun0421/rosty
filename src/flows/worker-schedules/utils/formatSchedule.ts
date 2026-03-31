export function formatScheduleDate(value: string) {
  return value.slice(0, 10);
}

export function formatScheduleTime(value: string) {
  return value.slice(11, 16);
}