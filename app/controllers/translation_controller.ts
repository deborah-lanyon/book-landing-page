import type { HttpContext } from '@adonisjs/core/http'
import Section from '#models/section'
import Setting from '#models/setting'
import { translateText, translateMultiple, SUPPORTED_LANGUAGES } from '#services/translation_service'

export default class TranslationController {
  /**
   * Get list of supported languages
   */
  async languages({ response }: HttpContext) {
    return response.json({ languages: SUPPORTED_LANGUAGES })
  }

  /**
   * Translate a single section
   */
  async translateSection({ params, request, response }: HttpContext) {
    const { targetLanguage } = request.only(['targetLanguage'])
    const section = await Section.find(params.id)

    if (!section) {
      return response.status(404).json({ error: 'Section not found' })
    }

    if (!targetLanguage) {
      return response.status(400).json({ error: 'Target language is required' })
    }

    try {
      const [translatedTitle, translatedContent] = await translateMultiple(
        [section.title, section.content],
        targetLanguage
      )

      return response.json({
        success: true,
        original: {
          title: section.title,
          content: section.content,
        },
        translated: {
          title: translatedTitle,
          content: translatedContent,
        },
        targetLanguage,
      })
    } catch (error) {
      console.error('Translation error:', error)
      return response.status(500).json({
        error: 'Translation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Translate all published sections for the public page
   */
  async translatePage({ request, response }: HttpContext) {
    const { targetLanguage } = request.only(['targetLanguage'])

    if (!targetLanguage) {
      return response.status(400).json({ error: 'Target language is required' })
    }

    // Source language is Indonesian (content is stored in Indonesian)
    const sourceLanguage = 'id'

    // If target language matches source language, return original content without translation
    if (targetLanguage === sourceLanguage) {
      // Get welcome settings
      const welcomeTitle = await Setting.get('welcome_title', 'Selamat Datang')
      const welcomeSubtitle = await Setting.get('welcome_subtitle', '')

      // Get lesson settings
      const lessonTitleSetting = await Setting.findBy('key', 'lesson_title')
      const lessonIntroSetting = await Setting.findBy('key', 'lesson_introduction')

      // Get About Us settings (Indonesian stored in _id fields)
      const aboutUsTitleId = await Setting.get('about_us_title_id', '')
      const aboutUsContentId = await Setting.get('about_us_content_id', '')
      const aboutUsTitle = aboutUsTitleId || (await Setting.get('about_us_title', 'Tentang Kami'))
      const aboutUsContent = aboutUsContentId || (await Setting.get('about_us_content', ''))

      // Get Form labels (Indonesian stored in _id fields)
      const formTitleId = await Setting.get('form_title_id', '')
      const formTitle = formTitleId || (await Setting.get('form_title', 'Hubungi Kami'))
      const formFirstNameLabelId = await Setting.get('form_first_name_label_id', '')
      const formFirstNameLabel = formFirstNameLabelId || (await Setting.get('form_first_name_label', 'Nama Depan'))
      const formLastNameLabelId = await Setting.get('form_last_name_label_id', '')
      const formLastNameLabel = formLastNameLabelId || (await Setting.get('form_last_name_label', 'Nama Belakang'))
      const formTownLabelId = await Setting.get('form_town_label_id', '')
      const formTownLabel = formTownLabelId || (await Setting.get('form_town_label', 'Kota'))
      const formEmailLabelId = await Setting.get('form_email_label_id', '')
      const formEmailLabel = formEmailLabelId || (await Setting.get('form_email_label', 'Email'))
      const formWouldLikeLabelId = await Setting.get('form_would_like_label_id', '')
      const formWouldLikeLabel = formWouldLikeLabelId || (await Setting.get('form_would_like_label', 'Apakah Anda ingin'))
      const formFollowJesusLabelId = await Setting.get('form_follow_jesus_label_id', '')
      const formFollowJesusLabel = formFollowJesusLabelId || (await Setting.get('form_follow_jesus_label', 'Informasi lebih lanjut tentang cara menjadi pengikut Yesus Kristus'))
      const formBibleLabelId = await Setting.get('form_bible_label_id', '')
      const formBibleLabel = formBibleLabelId || (await Setting.get('form_bible_label', 'Alkitab dalam bahasa Anda sendiri'))
      const formPrayerLabelId = await Setting.get('form_prayer_label_id', '')
      const formPrayerLabel = formPrayerLabelId || (await Setting.get('form_prayer_label', 'Berbagi permintaan doa'))
      const formQuestionLabelId = await Setting.get('form_question_label_id', '')
      const formQuestionLabel = formQuestionLabelId || (await Setting.get('form_question_label', 'Ajukan pertanyaan'))
      const formMessageLabelId = await Setting.get('form_message_label_id', '')
      const formMessageLabel = formMessageLabelId || (await Setting.get('form_message_label', 'Pertanyaan atau Umpan Balik Anda'))
      const formSubmitLabelId = await Setting.get('form_submit_label_id', '')
      const formSubmitLabel = formSubmitLabelId || (await Setting.get('form_submit_label', 'Kirim Pesan'))

      // Get all published sections
      const sections = await Section.query()
        .where('is_published', true)
        .orderBy('display_order', 'asc')

      const result: {
        welcomeTitle?: string
        welcomeSubtitle?: string
        lessonTitle?: string
        lessonIntroduction?: string
        aboutUsTitle?: string
        aboutUsContent?: string
        formTitle?: string
        formFirstNameLabel?: string
        formLastNameLabel?: string
        formTownLabel?: string
        formEmailLabel?: string
        formWouldLikeLabel?: string
        formFollowJesusLabel?: string
        formBibleLabel?: string
        formPrayerLabel?: string
        formQuestionLabel?: string
        formMessageLabel?: string
        formSubmitLabel?: string
        sections: {
          id: number
          title: string
          content: string
          reflectiveQuestion?: string
          reflectiveQuestion2?: string
          reflectiveQuestion3?: string
        }[]
      } = {
        sections: [],
      }

      // Add Welcome section
      result.welcomeTitle = welcomeTitle
      result.welcomeSubtitle = welcomeSubtitle

      if (lessonTitleSetting?.value) {
        result.lessonTitle = lessonTitleSetting.value
      }
      if (lessonIntroSetting?.value) {
        result.lessonIntroduction = lessonIntroSetting.value
      }

      // Add About Us
      result.aboutUsTitle = aboutUsTitle
      result.aboutUsContent = aboutUsContent

      // Add Form labels
      result.formTitle = formTitle
      result.formFirstNameLabel = formFirstNameLabel
      result.formLastNameLabel = formLastNameLabel
      result.formTownLabel = formTownLabel
      result.formEmailLabel = formEmailLabel
      result.formWouldLikeLabel = formWouldLikeLabel
      result.formFollowJesusLabel = formFollowJesusLabel
      result.formBibleLabel = formBibleLabel
      result.formPrayerLabel = formPrayerLabel
      result.formQuestionLabel = formQuestionLabel
      result.formMessageLabel = formMessageLabel
      result.formSubmitLabel = formSubmitLabel

      for (const section of sections) {
        result.sections.push({
          id: section.id,
          title: section.title,
          content: section.content,
          reflectiveQuestion: section.reflectiveQuestion || undefined,
          reflectiveQuestion2: section.reflectiveQuestion2 || undefined,
          reflectiveQuestion3: section.reflectiveQuestion3 || undefined,
        })
      }

      return response.json({
        success: true,
        targetLanguage,
        data: result,
      })
    }

    try {
      // Get welcome settings
      const welcomeTitle = await Setting.get('welcome_title', 'Selamat Datang')
      const welcomeSubtitle = await Setting.get('welcome_subtitle', '')

      // Get lesson settings
      const lessonTitleSetting = await Setting.findBy('key', 'lesson_title')
      const lessonIntroSetting = await Setting.findBy('key', 'lesson_introduction')

      // Get About Us settings (Indonesian stored in _id fields)
      const aboutUsTitleId = await Setting.get('about_us_title_id', '')
      const aboutUsContentId = await Setting.get('about_us_content_id', '')
      const aboutUsTitle = aboutUsTitleId || (await Setting.get('about_us_title', 'Tentang Kami'))
      const aboutUsContent = aboutUsContentId || (await Setting.get('about_us_content', ''))

      // Get Form labels (Indonesian stored in _id fields)
      const formTitleId = await Setting.get('form_title_id', '')
      const formTitle = formTitleId || (await Setting.get('form_title', 'Hubungi Kami'))
      const formFirstNameLabelId = await Setting.get('form_first_name_label_id', '')
      const formFirstNameLabel = formFirstNameLabelId || (await Setting.get('form_first_name_label', 'Nama Depan'))
      const formLastNameLabelId = await Setting.get('form_last_name_label_id', '')
      const formLastNameLabel = formLastNameLabelId || (await Setting.get('form_last_name_label', 'Nama Belakang'))
      const formTownLabelId = await Setting.get('form_town_label_id', '')
      const formTownLabel = formTownLabelId || (await Setting.get('form_town_label', 'Kota'))
      const formEmailLabelId = await Setting.get('form_email_label_id', '')
      const formEmailLabel = formEmailLabelId || (await Setting.get('form_email_label', 'Email'))
      const formWouldLikeLabelId = await Setting.get('form_would_like_label_id', '')
      const formWouldLikeLabel = formWouldLikeLabelId || (await Setting.get('form_would_like_label', 'Apakah Anda ingin'))
      const formFollowJesusLabelId = await Setting.get('form_follow_jesus_label_id', '')
      const formFollowJesusLabel = formFollowJesusLabelId || (await Setting.get('form_follow_jesus_label', 'Informasi lebih lanjut tentang cara menjadi pengikut Yesus Kristus'))
      const formBibleLabelId = await Setting.get('form_bible_label_id', '')
      const formBibleLabel = formBibleLabelId || (await Setting.get('form_bible_label', 'Alkitab dalam bahasa Anda sendiri'))
      const formPrayerLabelId = await Setting.get('form_prayer_label_id', '')
      const formPrayerLabel = formPrayerLabelId || (await Setting.get('form_prayer_label', 'Berbagi permintaan doa'))
      const formQuestionLabelId = await Setting.get('form_question_label_id', '')
      const formQuestionLabel = formQuestionLabelId || (await Setting.get('form_question_label', 'Ajukan pertanyaan'))
      const formMessageLabelId = await Setting.get('form_message_label_id', '')
      const formMessageLabel = formMessageLabelId || (await Setting.get('form_message_label', 'Pertanyaan atau Umpan Balik Anda'))
      const formSubmitLabelId = await Setting.get('form_submit_label_id', '')
      const formSubmitLabel = formSubmitLabelId || (await Setting.get('form_submit_label', 'Kirim Pesan'))

      // Get all published sections
      const sections = await Section.query()
        .where('is_published', true)
        .orderBy('display_order', 'asc')

      // Collect all texts to translate
      const textsToTranslate: string[] = []

      // Add welcome texts
      textsToTranslate.push(welcomeTitle)
      textsToTranslate.push(welcomeSubtitle)

      if (lessonTitleSetting?.value) {
        textsToTranslate.push(lessonTitleSetting.value)
      }
      if (lessonIntroSetting?.value) {
        textsToTranslate.push(lessonIntroSetting.value)
      }

      // Add About Us texts
      textsToTranslate.push(aboutUsTitle)
      textsToTranslate.push(aboutUsContent)

      // Add Form labels
      textsToTranslate.push(formTitle)
      textsToTranslate.push(formFirstNameLabel)
      textsToTranslate.push(formLastNameLabel)
      textsToTranslate.push(formTownLabel)
      textsToTranslate.push(formEmailLabel)
      textsToTranslate.push(formWouldLikeLabel)
      textsToTranslate.push(formFollowJesusLabel)
      textsToTranslate.push(formBibleLabel)
      textsToTranslate.push(formPrayerLabel)
      textsToTranslate.push(formQuestionLabel)
      textsToTranslate.push(formMessageLabel)
      textsToTranslate.push(formSubmitLabel)

      // Track which sections have which reflective questions
      const sectionQuestions: { id: number; hasQ1: boolean; hasQ2: boolean; hasQ3: boolean }[] = []

      for (const section of sections) {
        textsToTranslate.push(section.title)
        textsToTranslate.push(section.content)
        const hasQ1 = !!section.reflectiveQuestion
        const hasQ2 = !!section.reflectiveQuestion2
        const hasQ3 = !!section.reflectiveQuestion3
        sectionQuestions.push({ id: section.id, hasQ1, hasQ2, hasQ3 })
        if (hasQ1) textsToTranslate.push(section.reflectiveQuestion!)
        if (hasQ2) textsToTranslate.push(section.reflectiveQuestion2!)
        if (hasQ3) textsToTranslate.push(section.reflectiveQuestion3!)
      }

      // Translate all at once for efficiency (from Indonesian to target language)
      const translations = await translateMultiple(textsToTranslate, targetLanguage, 'id')

      // Map translations back
      let index = 0
      const result: {
        welcomeTitle?: string
        welcomeSubtitle?: string
        lessonTitle?: string
        lessonIntroduction?: string
        aboutUsTitle?: string
        aboutUsContent?: string
        formTitle?: string
        formFirstNameLabel?: string
        formLastNameLabel?: string
        formTownLabel?: string
        formEmailLabel?: string
        formWouldLikeLabel?: string
        formFollowJesusLabel?: string
        formBibleLabel?: string
        formPrayerLabel?: string
        formQuestionLabel?: string
        formMessageLabel?: string
        formSubmitLabel?: string
        sections: {
          id: number
          title: string
          content: string
          reflectiveQuestion?: string
          reflectiveQuestion2?: string
          reflectiveQuestion3?: string
        }[]
      } = {
        sections: [],
      }

      // Map welcome translations
      result.welcomeTitle = translations[index++]
      result.welcomeSubtitle = translations[index++]

      if (lessonTitleSetting?.value) {
        result.lessonTitle = translations[index++]
      }
      if (lessonIntroSetting?.value) {
        result.lessonIntroduction = translations[index++]
      }

      // Map About Us translations
      result.aboutUsTitle = translations[index++]
      result.aboutUsContent = translations[index++]

      // Map Form label translations
      result.formTitle = translations[index++]
      result.formFirstNameLabel = translations[index++]
      result.formLastNameLabel = translations[index++]
      result.formTownLabel = translations[index++]
      result.formEmailLabel = translations[index++]
      result.formWouldLikeLabel = translations[index++]
      result.formFollowJesusLabel = translations[index++]
      result.formBibleLabel = translations[index++]
      result.formPrayerLabel = translations[index++]
      result.formQuestionLabel = translations[index++]
      result.formMessageLabel = translations[index++]
      result.formSubmitLabel = translations[index++]

      for (const sq of sectionQuestions) {
        const sectionResult: {
          id: number
          title: string
          content: string
          reflectiveQuestion?: string
          reflectiveQuestion2?: string
          reflectiveQuestion3?: string
        } = {
          id: sq.id,
          title: translations[index++],
          content: translations[index++],
        }
        if (sq.hasQ1) sectionResult.reflectiveQuestion = translations[index++]
        if (sq.hasQ2) sectionResult.reflectiveQuestion2 = translations[index++]
        if (sq.hasQ3) sectionResult.reflectiveQuestion3 = translations[index++]
        result.sections.push(sectionResult)
      }

      return response.json({
        success: true,
        targetLanguage,
        data: result,
      })
    } catch (error) {
      console.error('Translation error:', error)
      return response.status(500).json({
        error: 'Translation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Translate arbitrary text (for admin use)
   */
  async translateText({ request, response }: HttpContext) {
    const { text, targetLanguage } = request.only(['text', 'targetLanguage'])

    if (!text || !targetLanguage) {
      return response.status(400).json({ error: 'Text and target language are required' })
    }

    try {
      const translatedText = await translateText(text, targetLanguage)

      return response.json({
        success: true,
        original: text,
        translated: translatedText,
        targetLanguage,
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