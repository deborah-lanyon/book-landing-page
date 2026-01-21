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
   * Shows English content (translated from Indonesian) with option to translate to other languages
   */
  async index({ view }: HttpContext) {
    const sections = await Section.query()
      .where('is_published', true)
      .orderBy('display_order', 'asc')

    // Get stored English translations (these are the primary display content)
    const welcomeTitleEn = await Setting.get('welcome_title_en', '')
    const welcomeSubtitleEn = await Setting.get('welcome_subtitle_en', '')
    const lessonTitleEn = await Setting.get('lesson_title_en', '')
    const lessonIntroductionEn = await Setting.get('lesson_introduction_en', '')
    const aboutUsTitleEn = await Setting.get('about_us_title_en', '')
    const aboutUsContentEn = await Setting.get('about_us_content_en', '')

    // Fallback to Indonesian content if no English translations exist
    const welcomeTitleId = await Setting.get('welcome_title', 'Welcome')
    const welcomeSubtitleId = await Setting.get('welcome_subtitle', '')
    const lessonTitleId = await Setting.get('lesson_title', '')
    const lessonIntroductionId = await Setting.get('lesson_introduction', '')
    const aboutUsTitleId = await Setting.get('about_us_title', 'About Us')
    const aboutUsContentId = await Setting.get('about_us_content', '')
    const lessonImage = await Setting.get('lesson_image', '')

    // Use English translations if available, otherwise fall back to Indonesian (original)
    const displayWelcomeTitle = welcomeTitleEn || welcomeTitleId
    const displayWelcomeSubtitle = welcomeSubtitleEn || welcomeSubtitleId
    const displayLessonTitle = lessonTitleEn || lessonTitleId
    const displayLessonIntroduction = lessonIntroductionEn || lessonIntroductionId
    const displayAboutUsTitle = aboutUsTitleEn || aboutUsTitleId
    const displayAboutUsContent = aboutUsContentEn || aboutUsContentId

    // Build sections with English translations (or fallback to Indonesian)
    const displaySections = sections.map((section) => ({
      id: section.id,
      title: section.titleEn || section.title,
      content: section.contentEn || section.content,
      reflectiveQuestion: section.reflectiveQuestionEn || section.reflectiveQuestion,
      reflectiveQuestion2: section.reflectiveQuestion2En || section.reflectiveQuestion2,
      reflectiveQuestion3: section.reflectiveQuestion3En || section.reflectiveQuestion3,
      imageUrl: section.imageUrl,
      isPublished: section.isPublished,
      displayOrder: section.displayOrder,
    }))

    // Render single-column English page with language selector
    return view.render('pages/home', {
      sections: displaySections,
      welcomeTitle: displayWelcomeTitle,
      welcomeSubtitle: displayWelcomeSubtitle,
      lessonTitle: displayLessonTitle,
      lessonIntroduction: displayLessonIntroduction,
      lessonImage,
      aboutUsTitle: displayAboutUsTitle,
      aboutUsContent: displayAboutUsContent,
      defaultLanguage: 'en',
      defaultLanguageName: 'English',
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
      // Translate from English to target language
      const translations = await translateMultiple(texts, targetLanguage)
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
