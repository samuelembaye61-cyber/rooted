// Looks up an event's map position once, when it is saved, with OpenStreetMap's
// Nominatim service. Failures never block saving: the event simply has no map.
const endpoint = 'https://nominatim.openstreetmap.org/search'

export function parseGeocodeResult(results) {
  const first = Array.isArray(results) ? results[0] : null
  const latitude = Number(first?.lat)
  const longitude = Number(first?.lon)
  if (!first || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null
  return { latitude, longitude }
}

export async function geocodeAddress({ address, city }, { fetchImpl = fetch, environment = process.env, timeoutMs = 4000 } = {}) {
  if (environment.GEOCODING_DISABLED === '1') return null
  const query = [address, city].map((part) => part?.trim()).filter(Boolean).join(', ')
  if (!query) return null
  const url = new URL(endpoint)
  url.search = new URLSearchParams({ q: query, format: 'jsonv2', limit: '1' }).toString()
  try {
    const response = await fetchImpl(url, {
      headers: { 'User-Agent': 'Rooted-HackNC/1.0 (event map lookup)', Accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!response.ok) return null
    return parseGeocodeResult(await response.json())
  } catch {
    return null
  }
}
