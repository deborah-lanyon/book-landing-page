import type { HttpContext } from '@adonisjs/core/http'
import PageView from '#models/page_view'
import AnalyticsEvent from '#models/analytics_event'
import db from '@adonisjs/lucid/services/db'
import { geolocateIp } from '#services/geolocation_service'

export default class AnalyticsController {
  async trackPageView({ request, response }: HttpContext) {
    const { sessionId, referrer, pagePath } = request.only(['sessionId', 'referrer', 'pagePath'])

    if (!sessionId) {
      return response.noContent()
    }

    const userAgent = request.header('user-agent') ?? null
    const ip = request.ip()
    const geo = await geolocateIp(ip)

    await PageView.create({
      sessionId,
      ipAddress: ip,
      country: geo.country,
      city: geo.city,
      referrer: referrer || null,
      userAgent,
      pagePath: pagePath || '/',
    })

    return response.noContent()
  }

  async trackEvent({ request, response }: HttpContext) {
    const { sessionId, eventType, eventData } = request.only([
      'sessionId',
      'eventType',
      'eventData',
    ])

    if (!sessionId || !eventType) {
      return response.noContent()
    }

    try {
      await AnalyticsEvent.create({
        sessionId,
        eventType,
        eventData: eventData ? JSON.parse(JSON.stringify(eventData)) : null,
      })
    } catch (error) {
      console.error('trackEvent error:', error)
    }

    return response.noContent()
  }

  async trackTime({ request, response }: HttpContext) {
    const { sessionId, timeOnPage } = request.only(['sessionId', 'timeOnPage'])

    if (!sessionId || timeOnPage === undefined) {
      return response.noContent()
    }

    await PageView.query()
      .where('session_id', sessionId)
      .orderBy('created_at', 'desc')
      .limit(1)
      .update({ timeOnPage: Math.round(timeOnPage) })

    return response.noContent()
  }

  async dashboard({ request, view }: HttpContext) {
    const days = Number(request.input('days', 30))
    const since = new Date()
    since.setDate(since.getDate() - days)
    const sinceStr = since.toISOString()

    const dailyVisits = await db
      .from('page_views')
      .select(db.raw("DATE(created_at) as date"))
      .countDistinct('ip_address as count')
      .where('created_at', '>=', sinceStr)
      .groupByRaw('DATE(created_at)')
      .orderBy('date', 'asc')

    const totalVisitors = await db
      .from('page_views')
      .where('created_at', '>=', sinceStr)
      .countDistinct('session_id as count')
      .first()

    const totalPageViews = await db
      .from('page_views')
      .where('created_at', '>=', sinceStr)
      .count('* as count')
      .first()

    const topCountries = await db
      .from('page_views')
      .select('country')
      .count('* as count')
      .where('created_at', '>=', sinceStr)
      .whereNotNull('country')
      .groupBy('country')
      .orderBy('count', 'desc')
      .limit(10)

    const topCities = await db
      .from('page_views')
      .select('city', 'country')
      .count('* as count')
      .where('created_at', '>=', sinceStr)
      .whereNotNull('city')
      .groupBy('city', 'country')
      .orderBy('count', 'desc')
      .limit(10)

    const topSections = await db
      .from('analytics_events')
      .select(db.raw("event_data->>'section_title' as section_title"))
      .count('* as count')
      .where('event_type', 'accordion_click')
      .where('created_at', '>=', sinceStr)
      .groupByRaw("event_data->>'section_title'")
      .orderBy('count', 'desc')
      .limit(15)

    const avgTime = await db
      .from('page_views')
      .where('created_at', '>=', sinceStr)
      .whereNotNull('time_on_page')
      .avg('time_on_page as avg')
      .first()

    const totalSubmissions = await db
      .from('contact_submissions')
      .where('created_at', '>=', sinceStr)
      .count('* as count')
      .first()

    const topReferrers = await db
      .from('page_views')
      .select('referrer')
      .count('* as count')
      .where('created_at', '>=', sinceStr)
      .whereNotNull('referrer')
      .where('referrer', '!=', '')
      .groupBy('referrer')
      .orderBy('count', 'desc')
      .limit(10)

    const dailySubmissions = await db
      .from('contact_submissions')
      .select(db.raw("DATE(created_at) as date"))
      .count('* as count')
      .where('created_at', '>=', sinceStr)
      .groupByRaw('DATE(created_at)')
      .orderBy('date', 'asc')

    const uniqueVisitorCount = Number(totalVisitors?.count ?? 0)
    const totalPageViewCount = Number(totalPageViews?.count ?? 0)
    const avgTimeOnPage = Math.round(Number(avgTime?.avg ?? 0))
    const totalSubmissionCount = Number(totalSubmissions?.count ?? 0)
    const conversionRate =
      uniqueVisitorCount > 0
        ? ((totalSubmissionCount / uniqueVisitorCount) * 100).toFixed(1)
        : '0.0'

    return view.render('admin/analytics/dashboard', {
      days,
      dailyVisits: JSON.stringify(dailyVisits),
      uniqueVisitorCount,
      totalPageViewCount,
      topCountries,
      topCities,
      topSections,
      avgTimeOnPage,
      totalSubmissionCount,
      conversionRate,
      topReferrers,
      dailySubmissions: JSON.stringify(dailySubmissions),
    })
  }
}
