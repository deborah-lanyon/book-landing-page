import type { HttpContext } from '@adonisjs/core/http'
import Section from '#models/section'
import Setting from '#models/setting'

export default class HomeController {
  /**
   * Display the public accordion landing page
   */
  async index({ view }: HttpContext) {
    const sections = await Section.query()
      .where('is_published', true)
      .orderBy('display_order', 'asc')

    const welcomeTitle = await Setting.get('welcome_title', 'Welcome')
    const welcomeSubtitle = await Setting.get('welcome_subtitle', 'Tap any section below to learn more')
    const lessonTitle = await Setting.get('lesson_title', '')
    const lessonIntroduction = await Setting.get('lesson_introduction', '')
    const lessonImage = await Setting.get('lesson_image', '')

    return view.render('pages/home', { sections, welcomeTitle, welcomeSubtitle, lessonTitle, lessonIntroduction, lessonImage })
  }
}