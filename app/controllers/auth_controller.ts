import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'
import { randomBytes } from 'node:crypto'

export default class AuthController {
  /**
   * Show setup form (only if no users exist)
   */
  async showSetup({ view, response }: HttpContext) {
    const userCount = await User.query().count('* as total')
    const hasUsers = Number(userCount[0].$extras.total) > 0

    if (hasUsers) {
      return response.redirect().toRoute('login')
    }

    return view.render('auth/setup')
  }

  /**
   * Handle initial admin setup
   */
  async setup({ request, response, session }: HttpContext) {
    const userCount = await User.query().count('* as total')
    const hasUsers = Number(userCount[0].$extras.total) > 0

    if (hasUsers) {
      session.flash('error', 'Setup already completed')
      return response.redirect().toRoute('login')
    }

    const { full_name, email, password, confirm_password } = request.only([
      'full_name',
      'email',
      'password',
      'confirm_password',
    ])

    if (!full_name || !email || !password) {
      session.flash('error', 'All fields are required')
      return response.redirect().back()
    }

    if (password !== confirm_password) {
      session.flash('error', 'Passwords do not match')
      return response.redirect().back()
    }

    if (password.length < 8) {
      session.flash('error', 'Password must be at least 8 characters')
      return response.redirect().back()
    }

    await User.create({
      fullName: full_name,
      email: email,
      password: password,
    })

    session.flash('success', 'Admin account created! Please log in.')
    return response.redirect().toRoute('login')
  }

  /**
   * Show login form
   */
  async showLogin({ view, response }: HttpContext) {
    // Check if any users exist, if not redirect to setup
    const userCount = await User.query().count('* as total')
    const hasUsers = Number(userCount[0].$extras.total) > 0

    if (!hasUsers) {
      return response.redirect().toRoute('setup')
    }

    return view.render('auth/login')
  }

  /**
   * Handle login
   */
  async login({ request, response, auth, session }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)

      return response.redirect().toRoute('admin.sections.index')
    } catch {
      session.flash('error', 'Invalid credentials')
      return response.redirect().back()
    }
  }

  /**
   * Handle logout
   */
  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('login')
  }

  /**
   * Show change password form
   */
  async showChangePassword({ view }: HttpContext) {
    return view.render('auth/change-password')
  }

  /**
   * Handle password change
   */
  async changePassword({ request, response, auth, session }: HttpContext) {
    const { current_password, new_password, confirm_password } = request.only([
      'current_password',
      'new_password',
      'confirm_password',
    ])

    const user = auth.user!

    // Verify current password
    const isValid = await hash.verify(user.password, current_password)
    if (!isValid) {
      session.flash('error', 'Current password is incorrect')
      return response.redirect().back()
    }

    // Check new passwords match
    if (new_password !== confirm_password) {
      session.flash('error', 'New passwords do not match')
      return response.redirect().back()
    }

    // Check minimum length
    if (new_password.length < 8) {
      session.flash('error', 'Password must be at least 8 characters')
      return response.redirect().back()
    }

    // Update password
    user.password = new_password
    await user.save()

    session.flash('success', 'Password updated successfully')
    return response.redirect().toRoute('admin.sections.index')
  }

  /**
   * Show forgot password form
   */
  async showForgotPassword({ view }: HttpContext) {
    return view.render('auth/forgot-password')
  }

  /**
   * Handle forgot password request - generates reset token
   */
  async forgotPassword({ request, response, session }: HttpContext) {
    const { email } = request.only(['email'])

    const user = await User.findBy('email', email)

    if (!user) {
      // Don't reveal if email exists or not for security
      session.flash('success', 'If an account with that email exists, a reset link has been generated. Check the server logs.')
      return response.redirect().back()
    }

    // Generate a secure random token
    const token = randomBytes(32).toString('hex')

    // Save token with 1 hour expiry
    user.resetToken = token
    user.resetTokenExpiresAt = DateTime.now().plus({ hours: 1 })
    await user.save()

    // Log the reset URL to console (visible in Cloud Run logs)
    const resetUrl = `/reset-password/${token}`
    console.log('========================================')
    console.log('PASSWORD RESET REQUESTED')
    console.log(`Email: ${email}`)
    console.log(`Reset URL: ${resetUrl}`)
    console.log(`Expires: ${user.resetTokenExpiresAt.toISO()}`)
    console.log('========================================')

    session.flash('success', 'If an account with that email exists, a reset link has been generated. Check the server logs.')
    return response.redirect().back()
  }

  /**
   * Show reset password form
   */
  async showResetPassword({ view, params, response, session }: HttpContext) {
    const { token } = params

    const user = await User.query()
      .where('reset_token', token)
      .where('reset_token_expires_at', '>', DateTime.now().toSQL())
      .first()

    if (!user) {
      session.flash('error', 'Invalid or expired reset link')
      return response.redirect().toRoute('password.forgot')
    }

    return view.render('auth/reset-password', { token })
  }

  /**
   * Handle password reset
   */
  async resetPassword({ request, params, response, session }: HttpContext) {
    const { token } = params
    const { password, confirm_password } = request.only(['password', 'confirm_password'])

    const user = await User.query()
      .where('reset_token', token)
      .where('reset_token_expires_at', '>', DateTime.now().toSQL())
      .first()

    if (!user) {
      session.flash('error', 'Invalid or expired reset link')
      return response.redirect().toRoute('password.forgot')
    }

    if (password !== confirm_password) {
      session.flash('error', 'Passwords do not match')
      return response.redirect().back()
    }

    if (password.length < 8) {
      session.flash('error', 'Password must be at least 8 characters')
      return response.redirect().back()
    }

    // Update password and clear reset token
    user.password = password
    user.resetToken = null
    user.resetTokenExpiresAt = null
    await user.save()

    session.flash('success', 'Password reset successfully! Please log in.')
    return response.redirect().toRoute('login')
  }
}