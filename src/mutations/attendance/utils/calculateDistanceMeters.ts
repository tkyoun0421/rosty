const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function calculateDistanceMeters(input: {
  originLatitude: number;
  originLongitude: number;
  targetLatitude: number;
  targetLongitude: number;
}) {
  if (
    input.originLatitude === input.targetLatitude &&
    input.originLongitude === input.targetLongitude
  ) {
    return 0;
  }

  const latitudeDelta = toRadians(input.targetLatitude - input.originLatitude);
  const longitudeDelta = toRadians(input.targetLongitude - input.originLongitude);
  const originLatitude = toRadians(input.originLatitude);
  const targetLatitude = toRadians(input.targetLatitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) * Math.cos(targetLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}