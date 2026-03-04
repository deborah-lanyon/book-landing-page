interface GeoResult {
  country: string | null
  city: string | null
}

const cache = new Map<string, GeoResult>()

export async function geolocateIp(ip: string): Promise<GeoResult> {
  if (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.')
  ) {
    return { country: null, city: null }
  }

  if (cache.has(ip)) {
    return cache.get(ip)!
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
      signal: AbortSignal.timeout(2000),
    })
    const data = (await response.json()) as { status: string; country?: string; city?: string }

    const result: GeoResult = {
      country: data.status === 'success' ? (data.country ?? null) : null,
      city: data.status === 'success' ? (data.city ?? null) : null,
    }

    cache.set(ip, result)
    return result
  } catch {
    return { country: null, city: null }
  }
}
