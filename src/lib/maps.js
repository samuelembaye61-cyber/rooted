const base = 'https://www.google.com/maps';

function destination(event) {
  const point = mapPoint(event);
  if (point) return point.join(',');
  return [event.address, event.city].filter(Boolean).join(', ');
}

// Key-free universal links; phones open them in the installed maps app.
export function openInMapsUrl(event) {
  return `${base}/search/?api=1&query=${encodeURIComponent(destination(event))}`;
}

export function directionsUrl(event) {
  return `${base}/dir/?api=1&destination=${encodeURIComponent(destination(event))}`;
}

export function hasCoordinates(event) {
  return Number.isFinite(event.latitude) && Number.isFinite(event.longitude);
}

// Sample addresses are fictional, so samples are pinned to their town's center.
const sampleCityCenters = {
  'Chapel Hill': [35.9132, -79.0558],
  Durham: [35.994, -78.8986],
  Carrboro: [35.9101, -79.0753],
};

export function mapPoint(event) {
  if (hasCoordinates(event)) return [event.latitude, event.longitude];
  return event.isSample ? sampleCityCenters[event.city] ?? null : null;
}
