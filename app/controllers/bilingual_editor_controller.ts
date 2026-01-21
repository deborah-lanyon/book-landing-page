import type { HttpContext } from '@adonisjs/core/http'
import Section from '#models/section'
import Setting from '#models/setting'
import { translateMultiple } from '#services/translation_service'

export default class BilingualEditorController {
  /**
   * Show the bilingual editor with Indonesian content and English translations
   * Left column: Indonesian (editable) - stored in main fields
   * Right column: English (translation preview) - stored in _en fields
   */
  async index({ view, request }: HttpContext) {
    // Check if user wants to refresh translations from API
    const refreshTranslations = request.input('refresh') === '1'

    // Get all settings (Indonesian content - stored in main fields)
    const welcomeTitle = await Setting.get('welcome_title', 'Selamat Datang')
    const welcomeSubtitle = await Setting.get('welcome_subtitle', '')
    const lessonTitle = await Setting.get('lesson_title', '')
    const lessonIntroduction = await Setting.get('lesson_introduction', '')
    const aboutUsTitle = await Setting.get('about_us_title', 'Tentang Kami')
    const aboutUsContent = await Setting.get('about_us_content', '')

    // Get stored English translations for settings
    const welcomeTitleEn = await Setting.get('welcome_title_en', '')
    const welcomeSubtitleEn = await Setting.get('welcome_subtitle_en', '')
    const lessonTitleEn = await Setting.get('lesson_title_en', '')
    const lessonIntroductionEn = await Setting.get('lesson_introduction_en', '')
    const aboutUsTitleEn = await Setting.get('about_us_title_en', '')
    const aboutUsContentEn = await Setting.get('about_us_content_en', '')

    // Get all sections ordered by display order
    const sections = await Section.query().orderBy('display_order', 'asc')

    // Check if we have stored English translations or need to fetch from API
    const hasStoredSettingsTranslations =
      welcomeTitleEn || welcomeSubtitleEn || lessonTitleEn || aboutUsTitleEn
    const hasStoredSectionTranslations = sections.some((s) => s.titleEn || s.contentEn)

    let translationMap: Record<string, string> = {}
    let translationError = ''

    // If refreshing or no stored translations, fetch from API (Indonesian -> English)
    if (refreshTranslations || (!hasStoredSettingsTranslations && !hasStoredSectionTranslations)) {
      // Prepare Indonesian content for translation to English
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
          // Translate from Indonesian to English (explicitly specify source as 'id')
          const translations = await translateMultiple(textsToTranslate, 'en', 'id')
          textKeys.forEach((key, index) => {
            translationMap[key] = translations[index]
          })
        }
      } catch (error) {
        console.error('Translation error:', error)
        translationError = error instanceof Error ? error.message : 'Translation failed'
      }
    } else {
      // Use stored English translations
      translationMap = {
        welcomeTitle: welcomeTitleEn,
        welcomeSubtitle: welcomeSubtitleEn,
        lessonTitle: lessonTitleEn,
        lessonIntroduction: lessonIntroductionEn,
        aboutUsTitle: aboutUsTitleEn,
        aboutUsContent: aboutUsContentEn,
      }

      // Add section English translations from database
      for (const section of sections) {
        translationMap[`section_${section.id}_title`] = section.titleEn || ''
        translationMap[`section_${section.id}_content`] = section.contentEn || ''
        translationMap[`section_${section.id}_q1`] = section.reflectiveQuestionEn || ''
        translationMap[`section_${section.id}_q2`] = section.reflectiveQuestion2En || ''
        translationMap[`section_${section.id}_q3`] = section.reflectiveQuestion3En || ''
      }
    }

    // Build sections with translations
    const sectionsWithTranslations = sections.map((section) => ({
      id: section.id,
      // Indonesian content (editable)
      title: section.title,
      content: section.content,
      reflectiveQuestion: section.reflectiveQuestion,
      reflectiveQuestion2: section.reflectiveQuestion2,
      reflectiveQuestion3: section.reflectiveQuestion3,
      imageUrl: section.imageUrl,
      isPublished: section.isPublished,
      displayOrder: section.displayOrder,
      // English translations (from DB or API)
      titleTranslated: translationMap[`section_${section.id}_title`] || '',
      contentTranslated: translationMap[`section_${section.id}_content`] || '',
      q1Translated: translationMap[`section_${section.id}_q1`] || '',
      q2Translated: translationMap[`section_${section.id}_q2`] || '',
      q3Translated: translationMap[`section_${section.id}_q3`] || '',
    }))

    return view.render('admin/bilingual/index', {
      // Indonesian content (editable)
      welcomeTitle,
      welcomeSubtitle,
      lessonTitle,
      lessonIntroduction,
      aboutUsTitle,
      aboutUsContent,
      sections: sectionsWithTranslations,
      // English translations
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
   * Update settings (Indonesian content)
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

    // Save Indonesian content to main fields
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
   * Save English translations to the database
   */
  async saveTranslations({ request, response, session }: HttpContext) {
    const data = request.only([
      // English translations for settings
      'welcome_title_en',
      'welcome_subtitle_en',
      'lesson_title_en',
      'lesson_introduction_en',
      'about_us_title_en',
      'about_us_content_en',
      // Section translations
      'sections',
    ])

    // Save English translations for settings
    await Setting.set('welcome_title_en', data.welcome_title_en || '')
    await Setting.set('welcome_subtitle_en', data.welcome_subtitle_en || '')
    await Setting.set('lesson_title_en', data.lesson_title_en || '')
    await Setting.set('lesson_introduction_en', data.lesson_introduction_en || '')
    await Setting.set('about_us_title_en', data.about_us_title_en || '')
    await Setting.set('about_us_content_en', data.about_us_content_en || '')

    // Save section English translations
    if (data.sections && Array.isArray(data.sections)) {
      for (const sectionData of data.sections) {
        const section = await Section.find(sectionData.id)
        if (section) {
          section.titleEn = sectionData.title_en || null
          section.contentEn = sectionData.content_en || null
          section.reflectiveQuestionEn = sectionData.q1_en || null
          section.reflectiveQuestion2En = sectionData.q2_en || null
          section.reflectiveQuestion3En = sectionData.q3_en || null
          await section.save()
        }
      }
    }

    session.flash('success', 'English translations saved successfully')
    return response.redirect().toRoute('admin.bilingual.index')
  }

  /**
   * Update a single section (Indonesian content)
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

    // Save Indonesian content
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
   * Create a new section (Indonesian content)
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
      // Translate from Indonesian to English (explicitly specify source as 'id')
      const translations = await translateMultiple(texts, 'en', 'id')
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
