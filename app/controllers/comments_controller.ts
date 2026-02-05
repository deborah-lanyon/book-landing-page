import type { HttpContext } from '@adonisjs/core/http'
import Comment from '#models/comment'
import Section from '#models/section'
import { commentValidator } from '#validators/comment_validator'
import { errors } from '@vinejs/vine'

export default class CommentsController {
  /**
   * Store a new comment (public - requires admin approval)
   */
  async store({ request, response, session }: HttpContext) {
    try {
      const data = await request.validateUsing(commentValidator)

      // Check honeypot - if filled, it's likely a bot
      if (data.website && data.website.length > 0) {
        // Silently reject but show success to not alert the bot
        session.flash('commentSuccess', 'Thank you for your comment! It will be visible after approval.')
        return response.redirect().back()
      }

      // Verify section exists and is published
      const section = await Section.query()
        .where('id', data.sectionId)
        .where('is_published', true)
        .first()

      if (!section) {
        session.flash('commentError', 'Section not found')
        return response.redirect().back()
      }

      await Comment.create({
        sectionId: data.sectionId,
        authorName: data.authorName,
        authorEmail: data.authorEmail,
        content: data.content,
        isApproved: false,
      })

      session.flash('commentSuccess', 'Thank you for your comment! It will be visible after approval.')
      return response.redirect().back()
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        session.flash('commentErrors', error.messages)
        return response.redirect().back()
      }
      throw error
    }
  }
}
