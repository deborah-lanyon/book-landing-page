import type { HttpContext } from '@adonisjs/core/http'
import Setting from '#models/setting'

export default class SettingsController {
  async edit({ view }: HttpContext) {
    const welcomeTitle = await Setting.get('welcome_title', 'Welcome')
    const welcomeSubtitle = await Setting.get('welcome_subtitle', 'Tap any section below to learn more')

    return view.render('admin/settings/edit', {
      welcomeTitle,
      welcomeSubtitle,
    })
  }

  async update({ request, response, session }: HttpContext) {
    const { welcome_title, welcome_subtitle } = request.only([
      'welcome_title',
      'welcome_subtitle',
    ])

    await Setting.set('welcome_title', welcome_title)
    await Setting.set('welcome_subtitle', welcome_subtitle)

    session.flash('success', 'Settings updated successfully')
    return response.redirect().toRoute('admin.settings.edit')
  }
}