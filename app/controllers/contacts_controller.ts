import type { HttpContext } from '@adonisjs/core/http'
import ContactSubmission from '#models/contact_submission'
import { contactValidator } from '#validators/contact_validator'
import { errors } from '@vinejs/vine'

export default class ContactsController {
  async store({ request, response, session }: HttpContext) {
    try {
      // Verify reCAPTCHA v3
      const recaptchaResponse = request.input('g-recaptcha-response')
      if (!recaptchaResponse) {
        session.flash('contactErrors', [{ message: 'reCAPTCHA verification failed. Please try again.' }])
        return response.redirect().back()
      }

      const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=6LfdeoYsAAAAAEz1Agse9HqZhwfLfOSg60T3qP2I&response=${recaptchaResponse}`,
      })
      const verifyData = await verifyRes.json() as { success: boolean; score?: number }

      if (!verifyData.success || (verifyData.score !== undefined && verifyData.score < 0.5)) {
        session.flash('contactErrors', [{ message: 'reCAPTCHA verification failed. Please try again.' }])
        return response.redirect().back()
      }

      const data = await request.validateUsing(contactValidator)

      await ContactSubmission.create({
        firstName: data.firstName,
        lastName: data.lastName ?? null,
        town: data.town,
        email: data.email,
        wantFollowJesus: data.wantFollowJesus ?? false,
        wantBible: data.wantBible ?? false,
        wantPrayerRequest: data.wantPrayerRequest ?? false,
        wantAskQuestion: data.wantAskQuestion ?? false,
        message: data.message ?? null,
      })

      session.flash('contactSuccess', 'Thank you for your message! We will be in touch soon.')
      return response.redirect().back()
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        session.flash('contactErrors', error.messages)
        return response.redirect().back()
      }
      throw error
    }
  }
}
