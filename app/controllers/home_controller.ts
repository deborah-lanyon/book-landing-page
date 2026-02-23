import type { HttpContext } from '@adonisjs/core/http'
import Section from '#models/section'
import Setting from '#models/setting'
import Comment from '#models/comment'
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

    // Get approved comments (with fallback to empty array if query fails)
    let comments: Comment[] = []
    try {
      comments = await Comment.query()
        .where('is_approved', true)
        .orderBy('created_at', 'asc')
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }

    // Get Indonesian content for sections/lesson/welcome (stored in main fields from bilingual editor)
    const welcomePublished = (await Setting.get('welcome_published', '1')) === '1'
    const welcomeTitle = welcomePublished ? await Setting.get('welcome_title', 'Selamat Datang') : ''
    const welcomeSubtitle = welcomePublished ? await Setting.get('welcome_subtitle', '') : ''
    const lessonPublished = (await Setting.get('lesson_published', '1')) === '1'
    const lessonTitle = lessonPublished ? await Setting.get('lesson_title', '') : ''
    const lessonIntroduction = lessonPublished ? await Setting.get('lesson_introduction', '') : ''
    const lessonImage = lessonPublished ? await Setting.get('lesson_image', '') : ''

    // Get Indonesian content for About Us (stored in _id fields from settings page)
    // Fall back to English content if Indonesian translation doesn't exist yet
    const aboutUsTitleId = await Setting.get('about_us_title_id', '')
    const aboutUsContentId = await Setting.get('about_us_content_id', '')
    const aboutUsTitle = aboutUsTitleId || (await Setting.get('about_us_title', 'Tentang Kami'))
    const aboutUsContent = aboutUsContentId || (await Setting.get('about_us_content', ''))

    // Get Indonesian content for Form labels (stored in _id fields from settings page)
    // Fall back to English content if Indonesian translation doesn't exist yet
    const formTitleId = await Setting.get('form_title_id', '')
    const formTitle = formTitleId || (await Setting.get('form_title', 'Hubungi Kami'))

    const formFirstNameLabelId = await Setting.get('form_first_name_label_id', '')
    const formFirstNameLabel =
      formFirstNameLabelId || (await Setting.get('form_first_name_label', 'Nama Depan'))

    const formLastNameLabelId = await Setting.get('form_last_name_label_id', '')
    const formLastNameLabel =
      formLastNameLabelId || (await Setting.get('form_last_name_label', 'Nama Belakang'))

    const formTownLabelId = await Setting.get('form_town_label_id', '')
    const formTownLabel = formTownLabelId || (await Setting.get('form_town_label', 'Kota'))

    const formEmailLabelId = await Setting.get('form_email_label_id', '')
    const formEmailLabel = formEmailLabelId || (await Setting.get('form_email_label', 'Email'))

    const formWouldLikeLabelId = await Setting.get('form_would_like_label_id', '')
    const formWouldLikeLabel =
      formWouldLikeLabelId || (await Setting.get('form_would_like_label', 'Apakah Anda ingin'))

    const formFollowJesusLabelId = await Setting.get('form_follow_jesus_label_id', '')
    const formFollowJesusLabel =
      formFollowJesusLabelId ||
      (await Setting.get(
        'form_follow_jesus_label',
        'Informasi lebih lanjut tentang cara menjadi pengikut Yesus Kristus'
      ))

    const formBibleLabelId = await Setting.get('form_bible_label_id', '')
    const formBibleLabel =
      formBibleLabelId ||
      (await Setting.get('form_bible_label', 'Alkitab dalam bahasa Anda sendiri'))

    const formPrayerLabelId = await Setting.get('form_prayer_label_id', '')
    const formPrayerLabel =
      formPrayerLabelId || (await Setting.get('form_prayer_label', 'Berbagi permintaan doa'))

    const formQuestionLabelId = await Setting.get('form_question_label_id', '')
    const formQuestionLabel =
      formQuestionLabelId || (await Setting.get('form_question_label', 'Ajukan pertanyaan'))

    const formMessageLabelId = await Setting.get('form_message_label_id', '')
    const formMessageLabel =
      formMessageLabelId ||
      (await Setting.get('form_message_label', 'Pertanyaan atau Umpan Balik Anda'))

    const formSubmitLabelId = await Setting.get('form_submit_label_id', '')
    const formSubmitLabel =
      formSubmitLabelId || (await Setting.get('form_submit_label', 'Kirim Pesan'))

    // Get Indonesian content for QR code section (stored in _id fields from settings page)
    // Fall back to English content if Indonesian translation doesn't exist yet
    const qrTitleId = await Setting.get('qr_title_id', '')
    const qrTitle = qrTitleId || (await Setting.get('qr_title', 'Share this page'))

    const qrDescriptionId = await Setting.get('qr_description_id', '')
    const qrDescription =
      qrDescriptionId ||
      (await Setting.get('qr_description', 'Scan the QR code to open on your phone'))

    const qrLinkTextId = await Setting.get('qr_link_text_id', '')
    const qrLinkText =
      qrLinkTextId ||
      (await Setting.get('qr_link_text', 'Or go to www.readinggodsword.org.au'))

    const qrLinkUrl = await Setting.get('qr_link_url', 'https://www.readinggodsword.org.au')

    // Build sections with Indonesian content (the original) and their comments
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
      comments: comments.filter((c) => c.sectionId === section.id),
    }))

    // Render single-column Indonesian page with language selector
    return view.render('pages/home', {
      sections: displaySections,
      comments,
      welcomeTitle,
      welcomeSubtitle,
      lessonTitle,
      lessonIntroduction,
      lessonImage,
      aboutUsTitle,
      aboutUsContent,
      // Form labels (Indonesian)
      formTitle,
      formFirstNameLabel,
      formLastNameLabel,
      formTownLabel,
      formEmailLabel,
      formWouldLikeLabel,
      formFollowJesusLabel,
      formBibleLabel,
      formPrayerLabel,
      formQuestionLabel,
      formMessageLabel,
      formSubmitLabel,
      // QR code section
      qrTitle,
      qrDescription,
      qrLinkText,
      qrLinkUrl,
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
