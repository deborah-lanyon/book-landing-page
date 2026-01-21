import type { HttpContext } from '@adonisjs/core/http'
import Section from '#models/section'
import Setting from '#models/setting'
import { translateMultiple } from '#services/translation_service'

export default class BilingualEditorController {
  /**
   * Show the bilingual editor with all content and Indonesian translations
   * Prioritizes stored translations from database, falls back to API translations
   */
  async index({ view, request }: HttpContext) {
    // Check if user wants to refresh translations from API
    const refreshTranslations = request.input('refresh') === '1'

    // Get all settings (English content)
    const welcomeTitle = await Setting.get('welcome_title', 'Welcome')
    const welcomeSubtitle = await Setting.get('welcome_subtitle', '')
    const lessonTitle = await Setting.get('lesson_title', '')
    const lessonIntroduction = await Setting.get('lesson_introduction', '')
    const aboutUsTitle = await Setting.get('about_us_title', 'About Us')
    const aboutUsContent = await Setting.get('about_us_content', '')

    // Get stored Indonesian translations for settings
    const welcomeTitleId = await Setting.get('welcome_title_id', '')
    const welcomeSubtitleId = await Setting.get('welcome_subtitle_id', '')
    const lessonTitleId = await Setting.get('lesson_title_id', '')
    const lessonIntroductionId = await Setting.get('lesson_introduction_id', '')
    const aboutUsTitleId = await Setting.get('about_us_title_id', '')
    const aboutUsContentId = await Setting.get('about_us_content_id', '')

    // Get all sections ordered by display order
    const sections = await Section.query().orderBy('display_order', 'asc')

    // Check if we have stored translations or need to fetch from API
    const hasStoredSettingsTranslations =
      welcomeTitleId || welcomeSubtitleId || lessonTitleId || aboutUsTitleId
    const hasStoredSectionTranslations = sections.some((s) => s.titleId || s.contentId)

    let translationMap: Record<string, string> = {}
    let translationError = ''

    // If refreshing or no stored translations, fetch from API
    if (refreshTranslations || (!hasStoredSettingsTranslations && !hasStoredSectionTranslations)) {
      // Prepare content for translation
      const textsToTranslate: string[] = []
      const textKeys: string[] = []

      // Add settings to translate
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

      // Add section content to translate
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

      try {
        if (textsToTranslate.length > 0) {
          const translations = await translateMultiple(textsToTranslate, 'id')
          textKeys.forEach((key, index) => {
            translationMap[key] = translations[index]
          })
        }
      } catch (error) {
        console.error('Translation error:', error)
        translationError = error instanceof Error ? error.message : 'Translation failed'
      }
    } else {
      // Use stored translations
      translationMap = {
        welcomeTitle: welcomeTitleId,
        welcomeSubtitle: welcomeSubtitleId,
        lessonTitle: lessonTitleId,
        lessonIntroduction: lessonIntroductionId,
        aboutUsTitle: aboutUsTitleId,
        aboutUsContent: aboutUsContentId,
      }

      // Add section translations from database
      for (const section of sections) {
        translationMap[`section_${section.id}_title`] = section.titleId || ''
        translationMap[`section_${section.id}_content`] = section.contentId || ''
        translationMap[`section_${section.id}_q1`] = section.reflectiveQuestionId || ''
        translationMap[`section_${section.id}_q2`] = section.reflectiveQuestion2Id || ''
        translationMap[`section_${section.id}_q3`] = section.reflectiveQuestion3Id || ''
      }
    }

    // Build sections with translations
    const sectionsWithTranslations = sections.map((section) => ({
      id: section.id,
      title: section.title,
      content: section.content,
      reflectiveQuestion: section.reflectiveQuestion,
      reflectiveQuestion2: section.reflectiveQuestion2,
      reflectiveQuestion3: section.reflectiveQuestion3,
      imageUrl: section.imageUrl,
      isPublished: section.isPublished,
      displayOrder: section.displayOrder,
      // Translations (from DB or API)
      titleTranslated: translationMap[`section_${section.id}_title`] || '',
      contentTranslated: translationMap[`section_${section.id}_content`] || '',
      q1Translated: translationMap[`section_${section.id}_q1`] || '',
      q2Translated: translationMap[`section_${section.id}_q2`] || '',
      q3Translated: translationMap[`section_${section.id}_q3`] || '',
    }))

    return view.render('admin/bilingual/index', {
      // Original content
      welcomeTitle,
      welcomeSubtitle,
      lessonTitle,
      lessonIntroduction,
      aboutUsTitle,
      aboutUsContent,
      sections: sectionsWithTranslations,
      // Translations
      welcomeTitleTranslated: translationMap.welcomeTitle || '',
      welcomeSubtitleTranslated: translationMap.welcomeSubtitle || '',
      lessonTitleTranslated: translationMap.lessonTitle || '',
      lessonIntroductionTranslated: translationMap.lessonIntroduction || '',
      aboutUsTitleTranslated: translationMap.aboutUsTitle || '',
      aboutUsContentTranslated: translationMap.aboutUsContent || '',
      translationError,
      hasStoredTranslations: hasStoredSettingsTranslations || hasStoredSectionTranslations,
    })
  }

  /**
   * Update settings (welcome, lesson, about us)
   */
  async updateSettings({ request, response, session }: HttpContext) {
    const data = request.only([
      'welcome_title',
      'welcome_subtitle',
      'lesson_title',
      'lesson_introduction',
      'about_us_title',
      'about_us_content',
    ])

    await Setting.set('welcome_title', data.welcome_title || '')
    await Setting.set('welcome_subtitle', data.welcome_subtitle || '')
    await Setting.set('lesson_title', data.lesson_title || '')
    await Setting.set('lesson_introduction', data.lesson_introduction || '')
    await Setting.set('about_us_title', data.about_us_title || '')
    await Setting.set('about_us_content', data.about_us_content || '')

    session.flash('success', 'Settings updated successfully')
    return response.redirect().toRoute('admin.bilingual.index', {}, { qs: { refresh: '1' } })
  }

  /**
   * Save Indonesian translations to the database
   */
  async saveTranslations({ request, response, session }: HttpContext) {
    const data = request.only([
      // Settings translations
      'welcome_title_id',
      'welcome_subtitle_id',
      'lesson_title_id',
      'lesson_introduction_id',
      'about_us_title_id',
      'about_us_content_id',
      // Section translations (will be in format section_1_title_id, section_1_content_id, etc.)
      'sections',
    ])

    // Save settings translations
    await Setting.set('welcome_title_id', data.welcome_title_id || '')
    await Setting.set('welcome_subtitle_id', data.welcome_subtitle_id || '')
    await Setting.set('lesson_title_id', data.lesson_title_id || '')
    await Setting.set('lesson_introduction_id', data.lesson_introduction_id || '')
    await Setting.set('about_us_title_id', data.about_us_title_id || '')
    await Setting.set('about_us_content_id', data.about_us_content_id || '')

    // Save section translations
    if (data.sections && Array.isArray(data.sections)) {
      for (const sectionData of data.sections) {
        const section = await Section.find(sectionData.id)
        if (section) {
          section.titleId = sectionData.title_id || null
          section.contentId = sectionData.content_id || null
          section.reflectiveQuestionId = sectionData.q1_id || null
          section.reflectiveQuestion2Id = sectionData.q2_id || null
          section.reflectiveQuestion3Id = sectionData.q3_id || null
          await section.save()
        }
      }
    }

    session.flash('success', 'Indonesian translations saved successfully')
    return response.redirect().toRoute('admin.bilingual.index')
  }

  /**
   * Update a single section
   */
  async updateSection({ params, request, response, session }: HttpContext) {
    const section = await Section.find(params.id)

    if (!section) {
      session.flash('error', 'Section not found')
      return response.redirect().toRoute('admin.bilingual.index')
    }

    const data = request.only([
      'title',
      'content',
      'reflective_question',
      'reflective_question_2',
      'reflective_question_3',
      'is_published',
    ])

    section.title = data.title
    section.content = data.content
    section.reflectiveQuestion = data.reflective_question || null
    section.reflectiveQuestion2 = data.reflective_question_2 || null
    section.reflectiveQuestion3 = data.reflective_question_3 || null
    section.isPublished = data.is_published === 'on' || data.is_published === true

    await section.save()

    session.flash('success', `Section "${section.title}" updated successfully`)
    return response.redirect().toRoute('admin.bilingual.index', {}, { qs: { refresh: '1' } })
  }

  /**
   * Create a new section
   */
  async createSection({ request, response, session }: HttpContext) {
    const data = request.only([
      'title',
      'content',
      'reflective_question',
      'reflective_question_2',
      'reflective_question_3',
      'is_published',
    ])

    // Get the highest display order
    const lastSection = await Section.query().orderBy('display_order', 'desc').first()
    const displayOrder = lastSection ? lastSection.displayOrder + 1 : 1

    await Section.create({
      title: data.title,
      content: data.content,
      reflectiveQuestion: data.reflective_question || null,
      reflectiveQuestion2: data.reflective_question_2 || null,
      reflectiveQuestion3: data.reflective_question_3 || null,
      isPublished: data.is_published === 'on' || data.is_published === true,
      displayOrder,
    })

    session.flash('success', 'New section created successfully')
    return response.redirect().toRoute('admin.bilingual.index', {}, { qs: { refresh: '1' } })
  }

  /**
   * Delete a section
   */
  async deleteSection({ params, response, session }: HttpContext) {
    const section = await Section.find(params.id)

    if (!section) {
      session.flash('error', 'Section not found')
      return response.redirect().toRoute('admin.bilingual.index')
    }

    const title = section.title
    await section.delete()

    session.flash('success', `Section "${title}" deleted successfully`)
    return response.redirect().toRoute('admin.bilingual.index')
  }

  /**
   * Refresh translations via AJAX
   */
  async refreshTranslations({ request, response }: HttpContext) {
    const { texts } = request.only(['texts'])

    if (!texts || !Array.isArray(texts)) {
      return response.status(400).json({ error: 'Invalid request' })
    }

    try {
      const translations = await translateMultiple(texts, 'id')
      return response.json({ success: true, translations })
    } catch (error) {
      console.error('Translation error:', error)
      return response.status(500).json({
        error: 'Translation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
