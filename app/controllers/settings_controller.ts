import type { HttpContext } from '@adonisjs/core/http'
import Setting from '#models/setting'

export default class SettingsController {
  async edit({ view }: HttpContext) {
    const welcomeTitle = await Setting.get('welcome_title', 'Welcome')
    const welcomeSubtitle = await Setting.get('welcome_subtitle', 'Tap any section below to learn more')
    const aboutUsTitle = await Setting.get('about_us_title', 'About Us')
    const aboutUsContent = await Setting.get('about_us_content', '')

    return view.render('admin/settings/edit', {
      welcomeTitle,
      welcomeSubtitle,
      aboutUsTitle,
      aboutUsContent,
    })
  }

  async update({ request, response, session }: HttpContext) {
    const { welcome_title, welcome_subtitle, about_us_title, about_us_content } = request.only([
      'welcome_title',
      'welcome_subtitle',
      'about_us_title',
      'about_us_content',
    ])

    await Setting.set('welcome_title', welcome_title)
    await Setting.set('welcome_subtitle', welcome_subtitle)
    await Setting.set('about_us_title', about_us_title)
    await Setting.set('about_us_content', about_us_content)

    session.flash('success', 'Settings updated successfully')
    return response.redirect().toRoute('admin.settings.edit')
  }
}