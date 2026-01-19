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

    // Original English content
    const welcomeTitle = await Setting.get('welcome_title', 'Welcome')
    const welcomeSubtitle = await Setting.get('welcome_subtitle', 'Tap any section below to learn more')
    const lessonTitle = await Setting.get('lesson_title', '')
    const lessonIntroduction = await Setting.get('lesson_introduction', '')
    const lessonImage = await Setting.get('lesson_image', '')
    const aboutUsTitle = await Setting.get('about_us_title', 'About Us')
    const aboutUsContent = await Setting.get('about_us_content', '')

    // For Indonesian bilingual layout
    if (defaultLanguage === 'id') {
      return this.renderBilingualPage(view, {
        sections,
        welcomeTitle,
        welcomeSubtitle,
        lessonTitle,
        lessonIntroduction,
        lessonImage,
        aboutUsTitle,
        aboutUsContent,
      })
    }

    // For other non-English languages, translate content
    if (defaultLanguage !== 'en') {
      return this.renderTranslatedPage(view, defaultLanguage, {
        sections,
        welcomeTitle,
        welcomeSubtitle,
        lessonTitle,
        lessonIntroduction,
        lessonImage,
        aboutUsTitle,
        aboutUsContent,
      })
    }

    // Default English page
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

  /**
   * Render bilingual side-by-side page (Indonesian + English/other)
   */
  private async renderBilingualPage(
    view: HttpContext['view'],
    data: {
      sections: Section[]
      welcomeTitle: string
      welcomeSubtitle: string
      lessonTitle: string
      lessonIntroduction: string
      lessonImage: string
      aboutUsTitle: string
      aboutUsContent: string
    }
  ) {
    try {
      // Collect all texts to translate to Indonesian
      const textsToTranslate: string[] = []
      const textKeys: string[] = []

      if (data.welcomeTitle) {
        textsToTranslate.push(data.welcomeTitle)
        textKeys.push('welcomeTitle')
      }
      if (data.welcomeSubtitle) {
        textsToTranslate.push(data.welcomeSubtitle)
        textKeys.push('welcomeSubtitle')
      }
      if (data.lessonTitle) {
        textsToTranslate.push(data.lessonTitle)
        textKeys.push('lessonTitle')
      }
      if (data.lessonIntroduction) {
        textsToTranslate.push(data.lessonIntroduction)
        textKeys.push('lessonIntroduction')
      }
      if (data.aboutUsTitle) {
        textsToTranslate.push(data.aboutUsTitle)
        textKeys.push('aboutUsTitle')
      }
      if (data.aboutUsContent) {
        textsToTranslate.push(data.aboutUsContent)
        textKeys.push('aboutUsContent')
      }

      // Add section content
      for (const section of data.sections) {
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

      // Translate all to Indonesian
      const translations = await translateMultiple(textsToTranslate, 'id')

      // Map translations
      const translationMap: Record<string, string> = {}
      textKeys.forEach((key, index) => {
        translationMap[key] = translations[index]
      })

      // Build sections with both original and translated content
      const sectionsWithTranslations = data.sections.map((section) => ({
        id: section.id,
        title: section.title,
        content: section.content,
        reflectiveQuestion: section.reflectiveQuestion,
        reflectiveQuestion2: section.reflectiveQuestion2,
        reflectiveQuestion3: section.reflectiveQuestion3,
        imageUrl: section.imageUrl,
        titleTranslated: translationMap[`section_${section.id}_title`] || section.title,
        contentTranslated: translationMap[`section_${section.id}_content`] || section.content,
        reflectiveQuestionTranslated: translationMap[`section_${section.id}_q1`] || section.reflectiveQuestion,
        reflectiveQuestion2Translated: translationMap[`section_${section.id}_q2`] || section.reflectiveQuestion2,
        reflectiveQuestion3Translated: translationMap[`section_${section.id}_q3`] || section.reflectiveQuestion3,
      }))

      return view.render('pages/home-bilingual', {
        sections: sectionsWithTranslations,
        // Original English
        welcomeTitle: data.welcomeTitle,
        welcomeSubtitle: data.welcomeSubtitle,
        lessonTitle: data.lessonTitle,
        lessonIntroduction: data.lessonIntroduction,
        lessonImage: data.lessonImage,
        aboutUsTitle: data.aboutUsTitle,
        aboutUsContent: data.aboutUsContent,
        // Translated Indonesian
        welcomeTitleTranslated: translationMap.welcomeTitle || data.welcomeTitle,
        welcomeSubtitleTranslated: translationMap.welcomeSubtitle || data.welcomeSubtitle,
        lessonTitleTranslated: translationMap.lessonTitle || data.lessonTitle,
        lessonIntroductionTranslated: translationMap.lessonIntroduction || data.lessonIntroduction,
        aboutUsTitleTranslated: translationMap.aboutUsTitle || data.aboutUsTitle,
        aboutUsContentTranslated: translationMap.aboutUsContent || data.aboutUsContent,
      })
    } catch (error) {
      console.error('Failed to translate content for bilingual page:', error)
      // Fall back to English-only if translation fails
      return view.render('pages/home', {
        sections: data.sections,
        welcomeTitle: data.welcomeTitle,
        welcomeSubtitle: data.welcomeSubtitle,
        lessonTitle: data.lessonTitle,
        lessonIntroduction: data.lessonIntroduction,
        lessonImage: data.lessonImage,
        aboutUsTitle: data.aboutUsTitle,
        aboutUsContent: data.aboutUsContent,
        defaultLanguage: 'en',
        defaultLanguageName: 'English',
      })
    }
  }

  /**
   * Render page translated to a non-English language (single language view)
   */
  private async renderTranslatedPage(
    view: HttpContext['view'],
    targetLanguage: string,
    data: {
      sections: Section[]
      welcomeTitle: string
      welcomeSubtitle: string
      lessonTitle: string
      lessonIntroduction: string
      lessonImage: string
      aboutUsTitle: string
      aboutUsContent: string
    }
  ) {
    let translatedWelcomeTitle = data.welcomeTitle
    let translatedWelcomeSubtitle = data.welcomeSubtitle
    let translatedLessonTitle = data.lessonTitle
    let translatedLessonIntroduction = data.lessonIntroduction
    let translatedAboutUsTitle = data.aboutUsTitle
    let translatedAboutUsContent = data.aboutUsContent

    try {
      // Collect all texts to translate
      const textsToTranslate: string[] = []
      const textKeys: string[] = []

      if (data.welcomeTitle) {
        textsToTranslate.push(data.welcomeTitle)
        textKeys.push('welcomeTitle')
      }
      if (data.welcomeSubtitle) {
        textsToTranslate.push(data.welcomeSubtitle)
        textKeys.push('welcomeSubtitle')
      }
      if (data.lessonTitle) {
        textsToTranslate.push(data.lessonTitle)
        textKeys.push('lessonTitle')
      }
      if (data.lessonIntroduction) {
        textsToTranslate.push(data.lessonIntroduction)
        textKeys.push('lessonIntroduction')
      }
      if (data.aboutUsTitle) {
        textsToTranslate.push(data.aboutUsTitle)
        textKeys.push('aboutUsTitle')
      }
      if (data.aboutUsContent) {
        textsToTranslate.push(data.aboutUsContent)
        textKeys.push('aboutUsContent')
      }

      // Add section content
      for (const section of data.sections) {
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
      const translations = await translateMultiple(textsToTranslate, targetLanguage)

      // Map translations back
      const translationMap: Record<string, string> = {}
      textKeys.forEach((key, index) => {
        translationMap[key] = translations[index]
      })

      // Apply translations to settings
      if (translationMap.welcomeTitle) translatedWelcomeTitle = translationMap.welcomeTitle
      if (translationMap.welcomeSubtitle) translatedWelcomeSubtitle = translationMap.welcomeSubtitle
      if (translationMap.lessonTitle) translatedLessonTitle = translationMap.lessonTitle
      if (translationMap.lessonIntroduction) translatedLessonIntroduction = translationMap.lessonIntroduction
      if (translationMap.aboutUsTitle) translatedAboutUsTitle = translationMap.aboutUsTitle
      if (translationMap.aboutUsContent) translatedAboutUsContent = translationMap.aboutUsContent

      // Apply translations to sections
      for (const section of data.sections) {
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

    const defaultLanguageName = LANGUAGE_NAMES[targetLanguage] || targetLanguage

    return view.render('pages/home', {
      sections: data.sections,
      welcomeTitle: translatedWelcomeTitle,
      welcomeSubtitle: translatedWelcomeSubtitle,
      lessonTitle: translatedLessonTitle,
      lessonIntroduction: translatedLessonIntroduction,
      lessonImage: data.lessonImage,
      aboutUsTitle: translatedAboutUsTitle,
      aboutUsContent: translatedAboutUsContent,
      defaultLanguage: targetLanguage,
      defaultLanguageName,
    })
  }
}