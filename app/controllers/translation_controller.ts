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
      // Get lesson settings
      const lessonTitleSetting = await Setting.findBy('key', 'lesson_title')
      const lessonIntroSetting = await Setting.findBy('key', 'lesson_introduction')

      // Get all published sections
      const sections = await Section.query()
        .where('is_published', true)
        .orderBy('display_order', 'asc')

      const result: {
        lessonTitle?: string
        lessonIntroduction?: string
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

      if (lessonTitleSetting?.value) {
        result.lessonTitle = lessonTitleSetting.value
      }
      if (lessonIntroSetting?.value) {
        result.lessonIntroduction = lessonIntroSetting.value
      }

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
      // Get lesson settings
      const lessonTitleSetting = await Setting.findBy('key', 'lesson_title')
      const lessonIntroSetting = await Setting.findBy('key', 'lesson_introduction')

      // Get all published sections
      const sections = await Section.query()
        .where('is_published', true)
        .orderBy('display_order', 'asc')

      // Collect all texts to translate
      const textsToTranslate: string[] = []

      if (lessonTitleSetting?.value) {
        textsToTranslate.push(lessonTitleSetting.value)
      }
      if (lessonIntroSetting?.value) {
        textsToTranslate.push(lessonIntroSetting.value)
      }

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
        lessonTitle?: string
        lessonIntroduction?: string
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

      if (lessonTitleSetting?.value) {
        result.lessonTitle = translations[index++]
      }
      if (lessonIntroSetting?.value) {
        result.lessonIntroduction = translations[index++]
      }

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