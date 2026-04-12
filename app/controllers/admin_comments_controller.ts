import type { HttpContext } from '@adonisjs/core/http'
import Comment from '#models/comment'

export default class AdminCommentsController {
  /**
   * Display all comments for admin review
   */
  async index({ view }: HttpContext) {
    const pendingComments = await Comment.query()
      .where('is_approved', false)
      .whereNull('parent_id')
      .preload('section')
      .preload('replies', (query) => {
        query.orderBy('created_at', 'asc')
      })
      .orderBy('created_at', 'desc')

    const approvedComments = await Comment.query()
      .where('is_approved', true)
      .whereNull('parent_id')
      .preload('section')
      .preload('replies', (query) => {
        query.orderBy('created_at', 'asc')
      })
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
   * Reply to a comment
   */
  async reply({ params, request, response, session, auth }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)
    const content = request.input('content')

    if (!content || content.trim().length === 0) {
      session.flash('error', 'Reply content cannot be empty')
      return response.redirect().back()
    }

    await Comment.create({
      sectionId: comment.sectionId,
      parentId: comment.id,
      authorName: auth.user?.fullName || 'Admin',
      authorEmail: auth.user?.email || '',
      content: content.trim(),
      isApproved: true,
      isAdminReply: true,
    })

    session.flash('success', 'Reply posted successfully')
    return response.redirect().back()
  }

  /**
   * Update a comment's content
   */
  async update({ params, request, response, session }: HttpContext) {
    const comment = await Comment.findOrFail(params.id)
    const content = request.input('content')

    if (!content || content.trim().length === 0) {
      session.flash('error', 'Comment content cannot be empty')
      return response.redirect().back()
    }

    comment.content = content.trim()
    await comment.save()

    session.flash('success', 'Comment updated successfully')
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
