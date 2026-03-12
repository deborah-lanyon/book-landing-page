import { BetaAnalyticsDataClient } from '@google-analytics/data'

const propertyId = '527629390'

let client: BetaAnalyticsDataClient | null = null

function getClient() {
  if (!client) {
    client = new BetaAnalyticsDataClient()
  }
  return client
}

export async function getGA4Report(days: number = 30) {
  try {
    const analyticsClient = getClient()
    const startDate = `${days}daysAgo`

    const [overviewResponse] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'sessions' },
        { name: 'eventCount' },
      ],
    })

    const row = overviewResponse.rows?.[0]
    const overview = {
      activeUsers: Number(row?.metricValues?.[0]?.value ?? 0),
      newUsers: Number(row?.metricValues?.[1]?.value ?? 0),
      pageViews: Number(row?.metricValues?.[2]?.value ?? 0),
      avgSessionDuration: Math.round(Number(row?.metricValues?.[3]?.value ?? 0)),
      bounceRate: Number(Number(row?.metricValues?.[4]?.value ?? 0) * 100).toFixed(1),
      sessions: Number(row?.metricValues?.[5]?.value ?? 0),
      eventCount: Number(row?.metricValues?.[6]?.value ?? 0),
    }

    const [dailyResponse] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
      orderBys: [{ dimension: { dimensionName: 'date', orderType: 'ALPHANUMERIC' } }],
    })

    const dailyVisits = (dailyResponse.rows ?? []).map((r) => ({
      date: r.dimensionValues?.[0]?.value ?? '',
      users: Number(r.metricValues?.[0]?.value ?? 0),
      pageViews: Number(r.metricValues?.[1]?.value ?? 0),
    }))

    const [countryResponse] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate: 'today' }],
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10,
    })

    const topCountries = (countryResponse.rows ?? []).map((r) => ({
      country: r.dimensionValues?.[0]?.value ?? 'Unknown',
      users: Number(r.metricValues?.[0]?.value ?? 0),
    }))

    const [sourceResponse] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate: 'today' }],
      dimensions: [{ name: 'sessionSource' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    })

    const topSources = (sourceResponse.rows ?? []).map((r) => ({
      source: r.dimensionValues?.[0]?.value ?? 'Unknown',
      sessions: Number(r.metricValues?.[0]?.value ?? 0),
    }))

    const [pageResponse] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate: 'today' }],
      dimensions: [{ name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    })

    const topPages = (pageResponse.rows ?? []).map((r) => ({
      page: r.dimensionValues?.[0]?.value ?? 'Unknown',
      views: Number(r.metricValues?.[0]?.value ?? 0),
      users: Number(r.metricValues?.[1]?.value ?? 0),
    }))

    return { overview, dailyVisits, topCountries, topSources, topPages, error: null }
  } catch (error) {
    console.error('GA4 API error:', error)
    return {
      overview: null,
      dailyVisits: [],
      topCountries: [],
      topSources: [],
      topPages: [],
      error: String(error),
    }
  }
}
