import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { geocodeAddress, parseGeocodeResult } from '../server/geocode.js'
import { directionsUrl, hasCoordinates, mapPoint, openInMapsUrl } from '../src/lib/maps.js'

describe('event geocoding', () => {
  it('parses the first Nominatim result and rejects invalid ones', () => {
    assert.deepEqual(parseGeocodeResult([{ lat: '35.9132', lon: '-79.0558' }]), { latitude: 35.9132, longitude: -79.0558 })
    assert.equal(parseGeocodeResult([]), null)
    assert.equal(parseGeocodeResult([{ lat: '95', lon: '0' }]), null)
    assert.equal(parseGeocodeResult([{ lat: 'x', lon: '0' }]), null)
  })

  it('queries once with a User-Agent and never throws', async () => {
    let request
    const ok = await geocodeAddress({ address: '100 Main St', city: 'Durham' }, {
      environment: {},
      fetchImpl: async (url, init) => { request = { url: String(url), init }; return { ok: true, json: async () => [{ lat: '36', lon: '-78.9' }] } },
    })
    assert.deepEqual(ok, { latitude: 36, longitude: -78.9 })
    assert.match(request.url, /q=100\+Main\+St%2C\+Durham/)
    assert.ok(request.init.headers['User-Agent'])
    assert.equal(await geocodeAddress({ address: 'x', city: 'y' }, { environment: {}, fetchImpl: async () => { throw new Error('offline') } }), null)
    assert.equal(await geocodeAddress({ address: 'x', city: 'y' }, { environment: {}, fetchImpl: async () => ({ ok: false }) }), null)
    assert.equal(await geocodeAddress({ address: 'x' }, { environment: { GEOCODING_DISABLED: '1' }, fetchImpl: async () => { throw new Error('must not call') } }), null)
  })
})

describe('map links', () => {
  it('uses coordinates when known and the address otherwise', () => {
    const located = { latitude: 36, longitude: -78.9, address: '1 A St', city: 'Durham' }
    assert.equal(hasCoordinates(located), true)
    assert.deepEqual(mapPoint({ isSample: true, city: 'Durham', latitude: null }), [35.994, -78.8986])
    assert.equal(mapPoint({ isSample: false, city: 'Durham', latitude: null }), null)
    assert.match(openInMapsUrl(located), /query=36%2C-78\.9$/)
    assert.match(directionsUrl(located), /destination=36%2C-78\.9$/)
    const unlocated = { latitude: null, longitude: null, address: '1 A St', city: 'Durham' }
    assert.equal(hasCoordinates(unlocated), false)
    assert.match(openInMapsUrl(unlocated), /query=1%20A%20St%2C%20Durham$/)
  })
})
