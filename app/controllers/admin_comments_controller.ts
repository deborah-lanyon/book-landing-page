import type { HttpContext } from '@adonisjs/core/http'
import Comment from '#models/comment'

export default class AdminCommentsController {
  /**
   * Display all comments for admin review
   */
  async index({ view }: HttpContext) {
    const pendingComments = await Comment.query()
      .where('is_approved', false)
      .preload('section')
      .orderBy('created_at', 'desc')

    const approvedComments = await Comment.query()
      .where('is_approved', true)
      .preload('section')
      .orderBy('created_at', 'desc')

    return view.render('admin/comments/index', {
      pendingComments,
      approvedComments,
    })
  }

  /**
   * Approve a comment
   */
  async approve({ params, response, session }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)
    comment.isApproved = true
    await comment.save()

    session.flash('success', 'Comment approved successfully')
    return response.redirect().back()
  }

  /**
   * Delete a comment
   */
  async destroy({ params, response, session }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)
    await comment.delete()

    session.flash('success', 'Comment deleted successfully')
    return response.redirect().back()
  }
}
