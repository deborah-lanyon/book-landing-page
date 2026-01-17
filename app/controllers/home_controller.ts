import type { HttpContext } from '@adonisjs/core/http'
import Section from '#models/section'
import Setting from '#models/setting'
import env from '#start/env'
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
   */
  async index({ view }: HttpContext) {
    const defaultLanguage = env.get('DEFAULT_LANGUAGE', 'en')

    const sections = await Section.query()
      .where('is_published', true)
      .orderBy('display_order', 'asc')

    let welcomeTitle = await Setting.get('welcome_title', 'Welcome')
    let welcomeSubtitle = await Setting.get('welcome_subtitle', 'Tap any section below to learn more')
    let lessonTitle = await Setting.get('lesson_title', '')
    let lessonIntroduction = await Setting.get('lesson_introduction', '')
    const lessonImage = await Setting.get('lesson_image', '')
    let aboutUsTitle = await Setting.get('about_us_title', 'About Us')
    let aboutUsContent = await Setting.get('about_us_content', '')

    // If default language is not English, translate all content
    if (defaultLanguage !== 'en') {
      try {
        // Collect all texts to translate
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
        if (lessonTitle) {
          textsToTranslate.push(lessonTitle)
          textKeys.push('lessonTitle')
        }
        if (lessonIntroduction) {
          textsToTranslate.push(lessonIntroduction)
          textKeys.push('lessonIntroduction')
        }
        if (aboutUsTitle) {
          textsToTranslate.push(aboutUsTitle)
          textKeys.push('aboutUsTitle')
        }
        if (aboutUsContent) {
          textsToTranslate.push(aboutUsContent)
          textKeys.push('aboutUsContent')
        }

        // Add section content
        for (const section of sections) {
          textsToTranslate.push(section.title)
          textKeys.push(`section_${section.id}_title`)
          textsToTranslate.push(section.content)
          textKeys.push(`section_${section.id}_content`)
          if (section.reflectiveQuestion) {
            textsToTranslate.push(section.reflectiveQuestion)
            textKeys.push(`section_${section.id}_q1`)
          }
          if (section.reflectiveQuestion2) {
            textsToTranslate.push(section.reflectiveQuestion2)
            textKeys.push(`section_${section.id}_q2`)
          }
          if (section.reflectiveQuestion3) {
            textsToTranslate.push(section.reflectiveQuestion3)
            textKeys.push(`section_${section.id}_q3`)
          }
        }

        // Translate all at once
        const translations = await translateMultiple(textsToTranslate, defaultLanguage)

        // Map translations back
        const translationMap: Record<string, string> = {}
        textKeys.forEach((key, index) => {
          translationMap[key] = translations[index]
        })

        // Apply translations to settings
        if (translationMap.welcomeTitle) welcomeTitle = translationMap.welcomeTitle
        if (translationMap.welcomeSubtitle) welcomeSubtitle = translationMap.welcomeSubtitle
        if (translationMap.lessonTitle) lessonTitle = translationMap.lessonTitle
        if (translationMap.lessonIntroduction) lessonIntroduction = translationMap.lessonIntroduction
        if (translationMap.aboutUsTitle) aboutUsTitle = translationMap.aboutUsTitle
        if (translationMap.aboutUsContent) aboutUsContent = translationMap.aboutUsContent

        // Apply translations to sections
        for (const section of sections) {
          const titleKey = `section_${section.id}_title`
          const contentKey = `section_${section.id}_content`
          const q1Key = `section_${section.id}_q1`
          const q2Key = `section_${section.id}_q2`
          const q3Key = `section_${section.id}_q3`

          if (translationMap[titleKey]) section.title = translationMap[titleKey]
          if (translationMap[contentKey]) section.content = translationMap[contentKey]
          if (translationMap[q1Key]) section.reflectiveQuestion = translationMap[q1Key]
          if (translationMap[q2Key]) section.reflectiveQuestion2 = translationMap[q2Key]
          if (translationMap[q3Key]) section.reflectiveQuestion3 = translationMap[q3Key]
        }
      } catch (error) {
        console.error('Failed to translate content for default language:', error)
        // Continue with English content if translation fails
      }
    }

    const defaultLanguageName = LANGUAGE_NAMES[defaultLanguage] || defaultLanguage

    return view.render('pages/home', {
      sections,
      welcomeTitle,
      welcomeSubtitle,
      lessonTitle,
      lessonIntroduction,
      lessonImage,
      aboutUsTitle,
      aboutUsContent,
      defaultLanguage,
      defaultLanguageName,
    })
  }
}