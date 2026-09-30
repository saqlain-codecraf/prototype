// Location services: device GPS, place search and reverse geocoding.
// Uses Google (Places API (New) + Geocoding API) when the key allows it, otherwise OpenStreetMap Nominatim.

import { GOOGLE_KEY, loadGoogleMaps, type LatLng } from '../components/ui'
import type { Place } from '../screens/hirer/types'

export class GeoError extends Error {
  constructor(public code: 'denied' | 'unavailable' | 'timeout' | 'unsupported', message: string) {
    super(message)
  }
}

/** Ask the device for its position (shows the real browser/OS permission prompt the first time). */
export function getCurrentPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new GeoError('unsupported', 'Location is not supported on this device.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      e => reject(
        e.code === e.PERMISSION_DENIED
          ? new GeoError('denied', 'Location permission is blocked. Allow it in your browser or phone settings.')
          : e.code === e.TIMEOUT
            ? new GeoError('timeout', 'Finding your location took too long. Try again.')
            : new GeoError('unavailable', "Couldn't get your location. Check that GPS is on."),
      ),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    )
  })
}

// ------------------------------------------------------------------
// Google (optional)
// ------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

let googleOk: boolean | null = GOOGLE_KEY ? null : false

async function google(): Promise<Any | null> {
  if (googleOk === false) return null
  try {
    const g: Any = await loadGoogleMaps()
    googleOk = true
    return g
  } catch {
    googleOk = false
    return null
  }
}

function areaFromComponents(comps: Any[]): string {
  const get = (t: string) => comps.find((c: Any) => c.types?.includes(t))?.long_name ?? comps.find((c: Any) => c.types?.includes(t))?.longText
  const local = get('sublocality_level_1') || get('sublocality') || get('neighborhood')
  const city = get('locality') || get('administrative_area_level_2')
  return [local, city].filter(Boolean).join(', ')
}

async function googleReverse(c: LatLng): Promise<Place | null> {
  const g = await google()
  if (!g?.maps?.Geocoder) return null
  try {
    const { results } = await new g.maps.Geocoder().geocode({ location: c })
    const r = results?.[0]
    if (!r) return null
    const parts: string[] = r.formatted_address.split(',').map((x: string) => x.trim())
    return {
      id: r.place_id ?? `pin-${c.lat},${c.lng}`,
      label: 'Pinned location',
      icon: '📍',
      line: parts.slice(0, 2).join(', ') || r.formatted_address,
      area: areaFromComponents(r.address_components ?? []) || parts.slice(2, 4).join(', '),
      lat: c.lat,
      lng: c.lng,
    }
  } catch {
    return null
  }
}

let sessionToken: Any = null

async function googleSearch(q: string, near: LatLng): Promise<Place[] | null> {
  const g = await google()
  const AS = g?.maps?.places?.AutocompleteSuggestion
  if (!AS) return null
  try {
    sessionToken ??= new g.maps.places.AutocompleteSessionToken()
    const { suggestions } = await AS.fetchAutocompleteSuggestions({
      input: q,
      sessionToken,
      includedRegionCodes: ['pk'],
      locationBias: { center: near, radius: 30000 },
    })
    return (suggestions ?? []).filter((s: Any) => s.placePrediction).slice(0, 7).map((s: Any) => {
      const p = s.placePrediction
      return {
        id: `g:${p.placeId}`,
        label: p.mainText?.text ?? p.text?.text ?? '',
        icon: '📍',
        line: p.mainText?.text ?? p.text?.text ?? '',
        area: p.secondaryText?.text ?? '',
      } as Place
    })
  } catch {
    return null
  }
}

/** Google search results carry no coordinates until selected; fetch them here. */
export async function resolvePlace(p: Place): Promise<Place> {
  if (p.lat && p.lng) return p
  if (!p.id.startsWith('g:')) return p
  const g = await google()
  if (!g?.maps?.places?.Place) return p
  try {
    const place = new g.maps.places.Place({ id: p.id.slice(2) })
    await place.fetchFields({ fields: ['location', 'formattedAddress', 'displayName'] })
    sessionToken = null
    return { ...p, lat: place.location.lat(), lng: place.location.lng() }
  } catch {
    return p
  }
}

// ------------------------------------------------------------------
// OpenStreetMap Nominatim (free fallback, ~1 request/second)
// ------------------------------------------------------------------

const NOMINATIM = 'https://nominatim.openstreetmap.org'

async function osmSearch(q: string, near: LatLng): Promise<Place[]> {
  const d = 0.5
  const viewbox = [near.lng - d, near.lat + d, near.lng + d, near.lat - d].join(',')
  const url = `${NOMINATIM}/search?format=jsonv2&addressdetails=1&limit=7&countrycodes=pk&viewbox=${viewbox}&q=${encodeURIComponent(q)}`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) throw new Error('search failed')
  const items: Any[] = await res.json()
  return items.map(it => {
    const parts: string[] = it.display_name.split(',').map((x: string) => x.trim())
    const a = it.address ?? {}
    return {
      id: `osm:${it.place_id}`,
      label: it.name || parts[0],
      icon: '📍',
      line: it.name || parts[0],
      area: [a.suburb || a.neighbourhood || a.quarter, a.city || a.town || a.state].filter(Boolean).join(', ') || parts.slice(1, 3).join(', '),
      lat: parseFloat(it.lat),
      lng: parseFloat(it.lon),
    }
  })
}

async function osmReverse(c: LatLng): Promise<Place | null> {
  try {
    const res = await fetch(`${NOMINATIM}/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${c.lat}&lon=${c.lng}`, { headers: { 'Accept-Language': 'en' } })
    if (!res.ok) return null
    const it: Any = await res.json()
    const a = it.address ?? {}
    const street = [a.house_number, a.road].filter(Boolean).join(' ')
    const local = a.suburb || a.neighbourhood || a.quarter || a.residential
    const city = a.city || a.town || a.village || a.state
    return {
      id: `pin-${c.lat.toFixed(5)},${c.lng.toFixed(5)}`,
      label: 'Pinned location',
      icon: '📍',
      line: street || local || it.name || it.display_name?.split(',')[0] || 'Pinned location',
      area: [local && street ? local : null, city].filter(Boolean).join(', '),
      lat: c.lat,
      lng: c.lng,
    }
  } catch {
    return null
  }
}

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

export async function searchPlaces(q: string, near: LatLng): Promise<Place[]> {
  const g = await googleSearch(q, near)
  if (g) return g
  return osmSearch(q, near)
}

/** Returns null only if every provider fails; callers keep a local fallback. */
export async function reverseGeocode(c: LatLng): Promise<Place | null> {
  return (await googleReverse(c)) ?? (await osmReverse(c))
}
