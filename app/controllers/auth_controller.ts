import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

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
}