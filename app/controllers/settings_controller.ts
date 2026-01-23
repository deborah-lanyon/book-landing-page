import type { HttpContext } from '@adonisjs/core/http'
import Setting from '#models/setting'
import { translateMultiple } from '#services/translation_service'

export default class SettingsController {
  /**
   * Show settings editor with English content and Indonesian translations
   * Left column: English (editable) - stored in main fields
   * Right column: Indonesian (translation preview) - stored in _id fields
   */
  async edit({ view, request }: HttpContext) {
    // Check if user wants to refresh translations from API
    const refreshTranslations = request.input('refresh') === '1'

    // Get English content (stored in main fields)
    const welcomeTitle = await Setting.get('welcome_title', 'Welcome')
    const welcomeSubtitle = await Setting.get(
      'welcome_subtitle',
      'Tap any section below to learn more'
    )
    const aboutUsTitle = await Setting.get('about_us_title', 'About Us')
    const aboutUsContent = await Setting.get('about_us_content', '')

    // Get stored Indonesian translations
    const welcomeTitleId = await Setting.get('welcome_title_id', '')
    const welcomeSubtitleId = await Setting.get('welcome_subtitle_id', '')
    const aboutUsTitleId = await Setting.get('about_us_title_id', '')
    const aboutUsContentId = await Setting.get('about_us_content_id', '')

    // Check if we have stored Indonesian translations
    const hasStoredTranslations =
      welcomeTitleId || welcomeSubtitleId || aboutUsTitleId || aboutUsContentId

    let translationMap: Record<string, string> = {}
    let translationError = ''

    // If refreshing or no stored translations, fetch from API (English -> Indonesian)
    if (refreshTranslations || !hasStoredTranslations) {
      const textsToTranslate: string[] = []
      const textKeys: string[] = []

      if (welcomeTitle) {
        textsToTranslate.push(welcomeTitle)
        textKeys.push('welcomeTitle')
      }
      if (welcomeSubtitle) {
        textsToTranslate.push(welcomeSubtitle)
        textKeys.push('welcomeSubtitle')
      }
      if (aboutUsTitle) {
        textsToTranslate.push(aboutUsTitle)
        textKeys.push('aboutUsTitle')
      }
      if (aboutUsContent) {
        textsToTranslate.push(aboutUsContent)
        textKeys.push('aboutUsContent')
      }

      try {
        if (textsToTranslate.length > 0) {
          // Translate from English to Indonesian
          const translations = await translateMultiple(textsToTranslate, 'id', 'en')
          textKeys.forEach((key, index) => {
            translationMap[key] = translations[index]
          })
        }
      } catch (error) {
        console.error('Translation error:', error)
        translationError = error instanceof Error ? error.message : 'Translation failed'
      }
    } else {
      // Use stored Indonesian translations
      translationMap = {
        welcomeTitle: welcomeTitleId,
        welcomeSubtitle: welcomeSubtitleId,
        aboutUsTitle: aboutUsTitleId,
        aboutUsContent: aboutUsContentId,
      }
    }

    return view.render('admin/settings/edit', {
      // English content (editable)
      welcomeTitle,
      welcomeSubtitle,
      aboutUsTitle,
      aboutUsContent,
      // Indonesian translations
      welcomeTitleTranslated: translationMap.welcomeTitle || '',
      welcomeSubtitleTranslated: translationMap.welcomeSubtitle || '',
      aboutUsTitleTranslated: translationMap.aboutUsTitle || '',
      aboutUsContentTranslated: translationMap.aboutUsContent || '',
      translationError,
      hasStoredTranslations,
    })
  }

  /**
   * Update English content
   */
  async update({ request, response, session }: HttpContext) {
    const { welcome_title, welcome_subtitle, about_us_title, about_us_content } = request.only([
      'welcome_title',
      'welcome_subtitle',
      'about_us_title',
      'about_us_content',
    ])

    // Save English content to main fields
    await Setting.set('welcome_title', welcome_title)
    await Setting.set('welcome_subtitle', welcome_subtitle)
    await Setting.set('about_us_title', about_us_title)
    await Setting.set('about_us_content', about_us_content)

    session.flash('success', 'Settings updated successfully')
    // Refresh translations after updating English content
    return response.redirect().toRoute('admin.settings.edit', {}, { qs: { refresh: '1' } })
  }

  /**
   * Save Indonesian translations to the database
   */
  async saveTranslations({ request, response, session }: HttpContext) {
    const data = request.only([
      'welcome_title_id',
      'welcome_subtitle_id',
      'about_us_title_id',
      'about_us_content_id',
    ])

    // Save Indonesian translations
    await Setting.set('welcome_title_id', data.welcome_title_id || '')
    await Setting.set('welcome_subtitle_id', data.welcome_subtitle_id || '')
    await Setting.set('about_us_title_id', data.about_us_title_id || '')
    await Setting.set('about_us_content_id', data.about_us_content_id || '')

    session.flash('success', 'Indonesian translations saved successfully')
    return response.redirect().toRoute('admin.settings.edit')
  }
}