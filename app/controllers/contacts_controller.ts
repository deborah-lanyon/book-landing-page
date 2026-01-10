import type { HttpContext } from '@adonisjs/core/http'
import ContactSubmission from '#models/contact_submission'
import { contactValidator } from '#validators/contact_validator'
import { errors } from '@vinejs/vine'

export default class ContactsController {
  async store({ request, response, session }: HttpContext) {
    try {
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