import type { HttpContext } from '@adonisjs/core/http'
import Section from '#models/section'

export default class HomeController {
  /**
   * Display the public accordion landing page
   */
  async index({ view }: HttpContext) {
    const sections = await Section.query()
      .where('is_published', true)
      .orderBy('display_order', 'asc')

    return view.render('pages/home', { sections })
  }
}