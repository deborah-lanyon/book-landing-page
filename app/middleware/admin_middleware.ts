import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Admin middleware restricts access to admin-only routes.
 * Contributors are redirected to the content editor with an error message.
 */
export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user

    if (!user || user.role !== 'admin') {
      ctx.session.flash('error', 'You do not have permission to access that page')
      return ctx.response.redirect().toRoute('admin.bilingual.index')
    }

    return next()
  }
}
