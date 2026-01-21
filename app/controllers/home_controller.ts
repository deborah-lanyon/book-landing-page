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

    // English page with automatic Indonesian translation
    // Translate all content from English to Indonesian server-side
    return this.renderEnglishWithIndonesian(view, {
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

  /**
   * Render bilingual side-by-side page (Indonesian original + English/other translation)
   * Left column: Original Indonesian content (no translation needed)
   * Right column: Translated to English (default) or other selected language
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
      // Collect all texts to translate FROM Indonesian TO English
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

      // Translate all FROM Indonesian TO English (source language is 'id' by default now)
      const translations = await translateMultiple(textsToTranslate, 'en')

      // Map translations
      const translationMap: Record<string, string> = {}
      textKeys.forEach((key, index) => {
        translationMap[key] = translations[index]
      })

      // Build sections with both original Indonesian and translated English content
      const sectionsWithTranslations = data.sections.map((section) => ({
        id: section.id,
        // Original Indonesian content (left column)
        title: section.title,
        content: section.content,
        reflectiveQuestion: section.reflectiveQuestion,
        reflectiveQuestion2: section.reflectiveQuestion2,
        reflectiveQuestion3: section.reflectiveQuestion3,
        imageUrl: section.imageUrl,
        // Translated English content (right column)
        titleTranslated: translationMap[`section_${section.id}_title`] || section.title,
        contentTranslated: translationMap[`section_${section.id}_content`] || section.content,
        reflectiveQuestionTranslated: translationMap[`section_${section.id}_q1`] || section.reflectiveQuestion,
        reflectiveQuestion2Translated: translationMap[`section_${section.id}_q2`] || section.reflectiveQuestion2,
        reflectiveQuestion3Translated: translationMap[`section_${section.id}_q3`] || section.reflectiveQuestion3,
      }))

      return view.render('pages/home-bilingual', {
        sections: sectionsWithTranslations,
        // Original Indonesian (left column)
        welcomeTitle: data.welcomeTitle,
        welcomeSubtitle: data.welcomeSubtitle,
        lessonTitle: data.lessonTitle,
        lessonIntroduction: data.lessonIntroduction,
        lessonImage: data.lessonImage,
        aboutUsTitle: data.aboutUsTitle,
        aboutUsContent: data.aboutUsContent,
        // Translated English (right column)
        welcomeTitleTranslated: translationMap.welcomeTitle || data.welcomeTitle,
        welcomeSubtitleTranslated: translationMap.welcomeSubtitle || data.welcomeSubtitle,
        lessonTitleTranslated: translationMap.lessonTitle || data.lessonTitle,
        lessonIntroductionTranslated: translationMap.lessonIntroduction || data.lessonIntroduction,
        aboutUsTitleTranslated: translationMap.aboutUsTitle || data.aboutUsTitle,
        aboutUsContentTranslated: translationMap.aboutUsContent || data.aboutUsContent,
      })
    } catch (error) {
      console.error('Failed to translate content for bilingual page:', error)
      // Fall back to bilingual page with Indonesian content on both sides
      // (translation will be available via client-side when API works)
      const sectionsWithTranslations = data.sections.map((section) => ({
        id: section.id,
        title: section.title,
        content: section.content,
        reflectiveQuestion: section.reflectiveQuestion,
        reflectiveQuestion2: section.reflectiveQuestion2,
        reflectiveQuestion3: section.reflectiveQuestion3,
        imageUrl: section.imageUrl,
        // Use same content when translation fails
        titleTranslated: section.title,
        contentTranslated: section.content,
        reflectiveQuestionTranslated: section.reflectiveQuestion,
        reflectiveQuestion2Translated: section.reflectiveQuestion2,
        reflectiveQuestion3Translated: section.reflectiveQuestion3,
      }))

      return view.render('pages/home-bilingual', {
        sections: sectionsWithTranslations,
        welcomeTitle: data.welcomeTitle,
        welcomeSubtitle: data.welcomeSubtitle,
        lessonTitle: data.lessonTitle,
        lessonIntroduction: data.lessonIntroduction,
        lessonImage: data.lessonImage,
        aboutUsTitle: data.aboutUsTitle,
        aboutUsContent: data.aboutUsContent,
        // Use same content when translation fails
        welcomeTitleTranslated: data.welcomeTitle,
        welcomeSubtitleTranslated: data.welcomeSubtitle,
        lessonTitleTranslated: data.lessonTitle,
        lessonIntroductionTranslated: data.lessonIntroduction,
        aboutUsTitleTranslated: data.aboutUsTitle,
        aboutUsContentTranslated: data.aboutUsContent,
      })
    }
  }

  /**
   * Render English page with stored Indonesian translations
   * Uses translations saved in the database from the bilingual editor
   * This ensures the public page shows exactly the same Indonesian text as the editor
   */
  private async renderEnglishWithIndonesian(
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
    // Get stored Indonesian translations for settings from database
    const welcomeTitleId = await Setting.get('welcome_title_id', '')
    const welcomeSubtitleId = await Setting.get('welcome_subtitle_id', '')
    const lessonTitleId = await Setting.get('lesson_title_id', '')
    const lessonIntroductionId = await Setting.get('lesson_introduction_id', '')
    const aboutUsTitleId = await Setting.get('about_us_title_id', '')
    const aboutUsContentId = await Setting.get('about_us_content_id', '')

    // Build sections with stored Indonesian translations from database
    const sectionsWithTranslations = data.sections.map((section) => ({
      id: section.id,
      // Original English content (left column)
      title: section.title,
      content: section.content,
      reflectiveQuestion: section.reflectiveQuestion,
      reflectiveQuestion2: section.reflectiveQuestion2,
      reflectiveQuestion3: section.reflectiveQuestion3,
      imageUrl: section.imageUrl,
      // Stored Indonesian translations from database (right column)
      titleTranslated: section.titleId || section.title,
      contentTranslated: section.contentId || section.content,
      reflectiveQuestionTranslated: section.reflectiveQuestionId || section.reflectiveQuestion,
      reflectiveQuestion2Translated: section.reflectiveQuestion2Id || section.reflectiveQuestion2,
      reflectiveQuestion3Translated: section.reflectiveQuestion3Id || section.reflectiveQuestion3,
    }))

    return view.render('pages/home-bilingual', {
      sections: sectionsWithTranslations,
      // Original English (left column)
      welcomeTitle: data.welcomeTitle,
      welcomeSubtitle: data.welcomeSubtitle,
      lessonTitle: data.lessonTitle,
      lessonIntroduction: data.lessonIntroduction,
      lessonImage: data.lessonImage,
      aboutUsTitle: data.aboutUsTitle,
      aboutUsContent: data.aboutUsContent,
      // Stored Indonesian translations from database (right column)
      welcomeTitleTranslated: welcomeTitleId || data.welcomeTitle,
      welcomeSubtitleTranslated: welcomeSubtitleId || data.welcomeSubtitle,
      lessonTitleTranslated: lessonTitleId || data.lessonTitle,
      lessonIntroductionTranslated: lessonIntroductionId || data.lessonIntroduction,
      aboutUsTitleTranslated: aboutUsTitleId || data.aboutUsTitle,
      aboutUsContentTranslated: aboutUsContentId || data.aboutUsContent,
    })
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