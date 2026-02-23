import type { HttpContext } from '@adonisjs/core/http'
import Setting from '#models/setting'
import { translateMultiple } from '#services/translation_service'

// Default form labels
const DEFAULT_FORM_LABELS = {
  formTitle: 'Get In Touch',
  formFirstNameLabel: 'First Name',
  formLastNameLabel: 'Last Name',
  formTownLabel: 'Town',
  formEmailLabel: 'Email',
  formWouldLikeLabel: 'Would you like',
  formFollowJesusLabel: 'Further information on how to become a follower of Jesus Christ',
  formBibleLabel: 'A Bible in your own language',
  formPrayerLabel: 'Share a prayer request',
  formQuestionLabel: 'Ask a question',
  formMessageLabel: 'Your Question or Feedback',
  formSubmitLabel: 'Send Message',
}

// Default QR code section labels
const DEFAULT_QR_LABELS = {
  qrTitle: 'Share this page',
  qrDescription: 'Scan the QR code to open on your phone',
  qrLinkText: 'Or go to www.readinggodsword.org.au',
  qrLinkUrl: 'https://www.readinggodsword.org.au',
}

export default class SettingsController {
  /**
   * Show settings editor with English content and Indonesian translations
   * Left column: English (editable) - stored in main fields
   * Right column: Indonesian (translation preview) - stored in _id fields
   */
  async edit({ view, request }: HttpContext) {
    // Check if user wants to refresh translations from API
    const refreshTranslations = request.input('refresh') === '1'

    // Get English content for About Us
    const aboutUsTitle = await Setting.get('about_us_title', 'About Us')
    const aboutUsContent = await Setting.get('about_us_content', '')

    // Get English content for Form labels
    const formTitle = await Setting.get('form_title', DEFAULT_FORM_LABELS.formTitle)
    const formFirstNameLabel = await Setting.get(
      'form_first_name_label',
      DEFAULT_FORM_LABELS.formFirstNameLabel
    )
    const formLastNameLabel = await Setting.get(
      'form_last_name_label',
      DEFAULT_FORM_LABELS.formLastNameLabel
    )
    const formTownLabel = await Setting.get('form_town_label', DEFAULT_FORM_LABELS.formTownLabel)
    const formEmailLabel = await Setting.get('form_email_label', DEFAULT_FORM_LABELS.formEmailLabel)
    const formWouldLikeLabel = await Setting.get(
      'form_would_like_label',
      DEFAULT_FORM_LABELS.formWouldLikeLabel
    )
    const formFollowJesusLabel = await Setting.get(
      'form_follow_jesus_label',
      DEFAULT_FORM_LABELS.formFollowJesusLabel
    )
    const formBibleLabel = await Setting.get('form_bible_label', DEFAULT_FORM_LABELS.formBibleLabel)
    const formPrayerLabel = await Setting.get(
      'form_prayer_label',
      DEFAULT_FORM_LABELS.formPrayerLabel
    )
    const formQuestionLabel = await Setting.get(
      'form_question_label',
      DEFAULT_FORM_LABELS.formQuestionLabel
    )
    const formMessageLabel = await Setting.get(
      'form_message_label',
      DEFAULT_FORM_LABELS.formMessageLabel
    )
    const formSubmitLabel = await Setting.get(
      'form_submit_label',
      DEFAULT_FORM_LABELS.formSubmitLabel
    )

    // Get stored Indonesian translations for About Us
    const aboutUsTitleId = await Setting.get('about_us_title_id', '')
    const aboutUsContentId = await Setting.get('about_us_content_id', '')

    // Get English content for QR code section
    const qrTitle = await Setting.get('qr_title', DEFAULT_QR_LABELS.qrTitle)
    const qrDescription = await Setting.get('qr_description', DEFAULT_QR_LABELS.qrDescription)
    const qrLinkText = await Setting.get('qr_link_text', DEFAULT_QR_LABELS.qrLinkText)
    const qrLinkUrl = await Setting.get('qr_link_url', DEFAULT_QR_LABELS.qrLinkUrl)

    // Get stored Indonesian translations for QR code section
    const qrTitleId = await Setting.get('qr_title_id', '')
    const qrDescriptionId = await Setting.get('qr_description_id', '')
    const qrLinkTextId = await Setting.get('qr_link_text_id', '')

    // Get stored Indonesian translations for Form labels
    const formTitleId = await Setting.get('form_title_id', '')
    const formFirstNameLabelId = await Setting.get('form_first_name_label_id', '')
    const formLastNameLabelId = await Setting.get('form_last_name_label_id', '')
    const formTownLabelId = await Setting.get('form_town_label_id', '')
    const formEmailLabelId = await Setting.get('form_email_label_id', '')
    const formWouldLikeLabelId = await Setting.get('form_would_like_label_id', '')
    const formFollowJesusLabelId = await Setting.get('form_follow_jesus_label_id', '')
    const formBibleLabelId = await Setting.get('form_bible_label_id', '')
    const formPrayerLabelId = await Setting.get('form_prayer_label_id', '')
    const formQuestionLabelId = await Setting.get('form_question_label_id', '')
    const formMessageLabelId = await Setting.get('form_message_label_id', '')
    const formSubmitLabelId = await Setting.get('form_submit_label_id', '')

    // Check if we have stored Indonesian translations
    const hasStoredTranslations =
      aboutUsTitleId || aboutUsContentId || formTitleId || formFirstNameLabelId || qrTitleId

    let translationMap: Record<string, string> = {}
    let translationError = ''

    // If refreshing or no stored translations, fetch from API (English -> Indonesian)
    if (refreshTranslations || !hasStoredTranslations) {
      const textsToTranslate: string[] = []
      const textKeys: string[] = []

      // About Us fields
      if (aboutUsTitle) {
        textsToTranslate.push(aboutUsTitle)
        textKeys.push('aboutUsTitle')
      }
      if (aboutUsContent) {
        textsToTranslate.push(aboutUsContent)
        textKeys.push('aboutUsContent')
      }

      // QR code fields
      if (qrTitle) {
        textsToTranslate.push(qrTitle)
        textKeys.push('qrTitle')
      }
      if (qrDescription) {
        textsToTranslate.push(qrDescription)
        textKeys.push('qrDescription')
      }
      if (qrLinkText) {
        textsToTranslate.push(qrLinkText)
        textKeys.push('qrLinkText')
      }

      // Form fields
      if (formTitle) {
        textsToTranslate.push(formTitle)
        textKeys.push('formTitle')
      }
      if (formFirstNameLabel) {
        textsToTranslate.push(formFirstNameLabel)
        textKeys.push('formFirstNameLabel')
      }
      if (formLastNameLabel) {
        textsToTranslate.push(formLastNameLabel)
        textKeys.push('formLastNameLabel')
      }
      if (formTownLabel) {
        textsToTranslate.push(formTownLabel)
        textKeys.push('formTownLabel')
      }
      if (formEmailLabel) {
        textsToTranslate.push(formEmailLabel)
        textKeys.push('formEmailLabel')
      }
      if (formWouldLikeLabel) {
        textsToTranslate.push(formWouldLikeLabel)
        textKeys.push('formWouldLikeLabel')
      }
      if (formFollowJesusLabel) {
        textsToTranslate.push(formFollowJesusLabel)
        textKeys.push('formFollowJesusLabel')
      }
      if (formBibleLabel) {
        textsToTranslate.push(formBibleLabel)
        textKeys.push('formBibleLabel')
      }
      if (formPrayerLabel) {
        textsToTranslate.push(formPrayerLabel)
        textKeys.push('formPrayerLabel')
      }
      if (formQuestionLabel) {
        textsToTranslate.push(formQuestionLabel)
        textKeys.push('formQuestionLabel')
      }
      if (formMessageLabel) {
        textsToTranslate.push(formMessageLabel)
        textKeys.push('formMessageLabel')
      }
      if (formSubmitLabel) {
        textsToTranslate.push(formSubmitLabel)
        textKeys.push('formSubmitLabel')
      }

      try {
        if (textsToTranslate.length > 0) {
          // Translate from English to Indonesian
          const translations = await translateMultiple(textsToTranslate, 'id', 'en')
          textKeys.forEach((key, index) => {
            translationMap[key] = translations[index]
          })
        }
      } catch (error) {
        console.error('Translation error:', error)
        translationError = error instanceof Error ? error.message : 'Translation failed'
      }
    } else {
      // Use stored Indonesian translations
      translationMap = {
        aboutUsTitle: aboutUsTitleId,
        aboutUsContent: aboutUsContentId,
        qrTitle: qrTitleId,
        qrDescription: qrDescriptionId,
        qrLinkText: qrLinkTextId,
        formTitle: formTitleId,
        formFirstNameLabel: formFirstNameLabelId,
        formLastNameLabel: formLastNameLabelId,
        formTownLabel: formTownLabelId,
        formEmailLabel: formEmailLabelId,
        formWouldLikeLabel: formWouldLikeLabelId,
        formFollowJesusLabel: formFollowJesusLabelId,
        formBibleLabel: formBibleLabelId,
        formPrayerLabel: formPrayerLabelId,
        formQuestionLabel: formQuestionLabelId,
        formMessageLabel: formMessageLabelId,
        formSubmitLabel: formSubmitLabelId,
      }
    }

    return view.render('admin/settings/edit', {
      // English content (editable) - About Us
      aboutUsTitle,
      aboutUsContent,
      // English content (editable) - QR code section
      qrTitle,
      qrDescription,
      qrLinkText,
      qrLinkUrl,
      // English content (editable) - Form labels
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
      // Indonesian translations - About Us
      aboutUsTitleTranslated: translationMap.aboutUsTitle || '',
      aboutUsContentTranslated: translationMap.aboutUsContent || '',
      // Indonesian translations - QR code section
      qrTitleTranslated: translationMap.qrTitle || '',
      qrDescriptionTranslated: translationMap.qrDescription || '',
      qrLinkTextTranslated: translationMap.qrLinkText || '',
      // Indonesian translations - Form labels
      formTitleTranslated: translationMap.formTitle || '',
      formFirstNameLabelTranslated: translationMap.formFirstNameLabel || '',
      formLastNameLabelTranslated: translationMap.formLastNameLabel || '',
      formTownLabelTranslated: translationMap.formTownLabel || '',
      formEmailLabelTranslated: translationMap.formEmailLabel || '',
      formWouldLikeLabelTranslated: translationMap.formWouldLikeLabel || '',
      formFollowJesusLabelTranslated: translationMap.formFollowJesusLabel || '',
      formBibleLabelTranslated: translationMap.formBibleLabel || '',
      formPrayerLabelTranslated: translationMap.formPrayerLabel || '',
      formQuestionLabelTranslated: translationMap.formQuestionLabel || '',
      formMessageLabelTranslated: translationMap.formMessageLabel || '',
      formSubmitLabelTranslated: translationMap.formSubmitLabel || '',
      translationError,
      hasStoredTranslations,
    })
  }

  /**
   * Update English content
   */
  async update({ request, response, session }: HttpContext) {
    const data = request.only([
      'about_us_title',
      'about_us_content',
      'qr_title',
      'qr_description',
      'qr_link_text',
      'qr_link_url',
      'form_title',
      'form_first_name_label',
      'form_last_name_label',
      'form_town_label',
      'form_email_label',
      'form_would_like_label',
      'form_follow_jesus_label',
      'form_bible_label',
      'form_prayer_label',
      'form_question_label',
      'form_message_label',
      'form_submit_label',
    ])

    // Save English content - About Us
    await Setting.set('about_us_title', data.about_us_title || '')
    await Setting.set('about_us_content', data.about_us_content || '')

    // Save English content - QR code section (only if provided)
    if (data.qr_title !== undefined) {
      await Setting.set('qr_title', data.qr_title || '')
    }
    if (data.qr_description !== undefined) {
      await Setting.set('qr_description', data.qr_description || '')
    }
    if (data.qr_link_text !== undefined) {
      await Setting.set('qr_link_text', data.qr_link_text || '')
    }
    if (data.qr_link_url !== undefined) {
      await Setting.set('qr_link_url', data.qr_link_url || '')
    }

    // Save English content - Form labels (only if provided)
    if (data.form_title !== undefined) {
      await Setting.set('form_title', data.form_title || '')
    }
    if (data.form_first_name_label !== undefined) {
      await Setting.set('form_first_name_label', data.form_first_name_label || '')
    }
    if (data.form_last_name_label !== undefined) {
      await Setting.set('form_last_name_label', data.form_last_name_label || '')
    }
    if (data.form_town_label !== undefined) {
      await Setting.set('form_town_label', data.form_town_label || '')
    }
    if (data.form_email_label !== undefined) {
      await Setting.set('form_email_label', data.form_email_label || '')
    }
    if (data.form_would_like_label !== undefined) {
      await Setting.set('form_would_like_label', data.form_would_like_label || '')
    }
    if (data.form_follow_jesus_label !== undefined) {
      await Setting.set('form_follow_jesus_label', data.form_follow_jesus_label || '')
    }
    if (data.form_bible_label !== undefined) {
      await Setting.set('form_bible_label', data.form_bible_label || '')
    }
    if (data.form_prayer_label !== undefined) {
      await Setting.set('form_prayer_label', data.form_prayer_label || '')
    }
    if (data.form_question_label !== undefined) {
      await Setting.set('form_question_label', data.form_question_label || '')
    }
    if (data.form_message_label !== undefined) {
      await Setting.set('form_message_label', data.form_message_label || '')
    }
    if (data.form_submit_label !== undefined) {
      await Setting.set('form_submit_label', data.form_submit_label || '')
    }

    session.flash('success', 'Settings updated successfully')
    // Refresh translations after updating English content
    return response.redirect().toRoute('admin.settings.edit', {}, { qs: { refresh: '1' } })
  }

  /**
   * Save Indonesian translations to the database
   */
  async saveTranslations({ request, response, session }: HttpContext) {
    const data = request.only([
      'about_us_title_id',
      'about_us_content_id',
      'qr_title_id',
      'qr_description_id',
      'qr_link_text_id',
      'form_title_id',
      'form_first_name_label_id',
      'form_last_name_label_id',
      'form_town_label_id',
      'form_email_label_id',
      'form_would_like_label_id',
      'form_follow_jesus_label_id',
      'form_bible_label_id',
      'form_prayer_label_id',
      'form_question_label_id',
      'form_message_label_id',
      'form_submit_label_id',
    ])

    // Save Indonesian translations - About Us
    await Setting.set('about_us_title_id', data.about_us_title_id || '')
    await Setting.set('about_us_content_id', data.about_us_content_id || '')

    // Save Indonesian translations - QR code section
    await Setting.set('qr_title_id', data.qr_title_id || '')
    await Setting.set('qr_description_id', data.qr_description_id || '')
    await Setting.set('qr_link_text_id', data.qr_link_text_id || '')

    // Save Indonesian translations - Form labels
    await Setting.set('form_title_id', data.form_title_id || '')
    await Setting.set('form_first_name_label_id', data.form_first_name_label_id || '')
    await Setting.set('form_last_name_label_id', data.form_last_name_label_id || '')
    await Setting.set('form_town_label_id', data.form_town_label_id || '')
    await Setting.set('form_email_label_id', data.form_email_label_id || '')
    await Setting.set('form_would_like_label_id', data.form_would_like_label_id || '')
    await Setting.set('form_follow_jesus_label_id', data.form_follow_jesus_label_id || '')
    await Setting.set('form_bible_label_id', data.form_bible_label_id || '')
    await Setting.set('form_prayer_label_id', data.form_prayer_label_id || '')
    await Setting.set('form_question_label_id', data.form_question_label_id || '')
    await Setting.set('form_message_label_id', data.form_message_label_id || '')
    await Setting.set('form_submit_label_id', data.form_submit_label_id || '')

    session.flash('success', 'Indonesian translations saved successfully')
    return response.redirect().toRoute('admin.settings.edit')
  }
}
