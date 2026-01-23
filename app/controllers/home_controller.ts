import type { HttpContext } from '@adonisjs/core/http'
import Section from '#models/section'
import Setting from '#models/setting'
import { translateMultiple } from '#services/translation_service'

// Language names for display
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  id: 'Indonesian',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  hi: 'Hindi',
  ru: 'Russian',
  vi: 'Vietnamese',
  th: 'Thai',
}

export default class HomeController {
  /**
   * Display the public accordion landing page
   * Shows Indonesian content (the original) with option to translate to English and other languages
   */
  async index({ view }: HttpContext) {
    const sections = await Section.query()
      .where('is_published', true)
      .orderBy('display_order', 'asc')

    // Get Indonesian content for sections/lesson/welcome (stored in main fields from bilingual editor)
    const welcomeTitle = await Setting.get('welcome_title', 'Selamat Datang')
    const welcomeSubtitle = await Setting.get('welcome_subtitle', '')
    const lessonTitle = await Setting.get('lesson_title', '')
    const lessonIntroduction = await Setting.get('lesson_introduction', '')
    const lessonImage = await Setting.get('lesson_image', '')

    // Get Indonesian content for About Us (stored in _id fields from settings page)
    // Fall back to English content if Indonesian translation doesn't exist yet
    const aboutUsTitleId = await Setting.get('about_us_title_id', '')
    const aboutUsContentId = await Setting.get('about_us_content_id', '')
    const aboutUsTitle = aboutUsTitleId || (await Setting.get('about_us_title', 'Tentang Kami'))
    const aboutUsContent = aboutUsContentId || (await Setting.get('about_us_content', ''))

    // Build sections with Indonesian content (the original)
    const displaySections = sections.map((section) => ({
      id: section.id,
      title: section.title,
      content: section.content,
      reflectiveQuestion: section.reflectiveQuestion,
      reflectiveQuestion2: section.reflectiveQuestion2,
      reflectiveQuestion3: section.reflectiveQuestion3,
      imageUrl: section.imageUrl,
      isPublished: section.isPublished,
      displayOrder: section.displayOrder,
    }))

    // Render single-column Indonesian page with language selector
    return view.render('pages/home', {
      sections: displaySections,
      welcomeTitle,
      welcomeSubtitle,
      lessonTitle,
      lessonIntroduction,
      lessonImage,
      aboutUsTitle,
      aboutUsContent,
      defaultLanguage: 'id',
      defaultLanguageName: 'Indonesian',
    })
  }

  /**
   * Render page translated to a specific language
   * Used when user selects a different language via the language selector
   */
  async translatePage({ request, response }: HttpContext) {
    const { targetLanguage, texts } = request.only(['targetLanguage', 'texts'])

    if (!targetLanguage || !texts || !Array.isArray(texts)) {
      return response.status(400).json({ error: 'Invalid request' })
    }

    try {
      // Translate from Indonesian to target language
      const translations = await translateMultiple(texts, targetLanguage, 'id')
      return response.json({
        success: true,
        translations,
        languageName: LANGUAGE_NAMES[targetLanguage] || targetLanguage,
      })
    } catch (error) {
      console.error('Translation error:', error)
      return response.status(500).json({
        error: 'Translation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
