const seoulDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

type SeoulDateTimePartName = "month" | "day" | "hour" | "minute";

function getPartValue(value: Date, type: SeoulDateTimePartName) {
  const part = seoulDateTimeFormatter.formatToParts(value).find((item) => item.type === type);

  if (!part) {
    throw new Error(`Missing Seoul date-time part: ${type}`);
  }

  return part.value;
}

export function getSeoulDateTimeParts(value: Date) {
  return {
    month: getPartValue(value, "month"),
    day: getPartValue(value, "day"),
    hour24: Number(getPartValue(value, "hour")),
    minute: getPartValue(value, "minute"),
  };
}
