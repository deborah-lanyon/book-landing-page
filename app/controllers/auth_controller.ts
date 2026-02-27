import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Setting from '#models/setting'
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
      // Find user by email
      const user = await User.findBy('email', email)

      if (!user) {
        session.flash('error', 'Invalid credentials')
        return response.redirect().back()
      }

      // Verify password using scrypt hasher
      const isValid = await hash.use('scrypt').verify(user.password, password)

      if (!isValid) {
        session.flash('error', 'Invalid credentials')
        return response.redirect().back()
      }

      // Login the user
      await auth.use('web').login(user)

      return response.redirect().toRoute('admin.bilingual.index')
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
    const isValid = await hash.use('scrypt').verify(user.password, current_password)
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
    return response.redirect().toRoute('admin.bilingual.index')
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

  /**
   * List all admin users
   */
  async listUsers({ view }: HttpContext) {
    const users = await User.query().orderBy('created_at', 'asc')
    return view.render('admin/users/index', { users })
  }

  /**
   * Show create user form
   */
  async showCreateUser({ view }: HttpContext) {
    return view.render('admin/users/create')
  }

  /**
   * Create a new admin user
   */
  async createUser({ request, response, session }: HttpContext) {
    const { full_name, email, password, confirm_password, role } = request.only([
      'full_name',
      'email',
      'password',
      'confirm_password',
      'role',
    ])

    if (!full_name || !email || !password) {
      session.flash('error', 'All fields are required')
      return response.redirect().back()
    }

    // Check if email already exists
    const existingUser = await User.findBy('email', email)
    if (existingUser) {
      session.flash('error', 'A user with this email already exists')
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
      role: role === 'admin' ? 'admin' : 'contributor',
    })

    session.flash('success', 'Admin user created successfully')
    return response.redirect().toRoute('admin.users.index')
  }

  /**
   * Generate a one-time invite link (stored in Settings, expires in 24 hours)
   */
  async generateInvite({ response, session, request }: HttpContext) {
    const token = randomBytes(32).toString('hex')
    const expiresAt = DateTime.now().plus({ hours: 24 }).toISO()

    await Setting.set('invite_token', token)
    await Setting.set('invite_token_expires_at', expiresAt!)

    const host = request.header('host')
    const protocol = request.secure() ? 'https' : 'http'
    const inviteUrl = `${protocol}://${host}/register/${token}`

    session.flash('inviteUrl', inviteUrl)
    return response.redirect().toRoute('admin.users.index')
  }

  /**
   * Show registration form (validates invite token)
   */
  async showRegister({ view, params, response, session }: HttpContext) {
    const { token } = params
    const storedToken = await Setting.get('invite_token', '')
    const expiresAtStr = await Setting.get('invite_token_expires_at', '')

    if (!storedToken || token !== storedToken) {
      session.flash('error', 'This invite link is invalid.')
      return response.redirect().toRoute('login')
    }

    if (!expiresAtStr || DateTime.fromISO(expiresAtStr) < DateTime.now()) {
      session.flash('error', 'This invite link has expired.')
      return response.redirect().toRoute('login')
    }

    return view.render('auth/register', { token })
  }

  /**
   * Handle registration via invite link
   */
  async register({ request, params, response, auth, session }: HttpContext) {
    const { token } = params
    const storedToken = await Setting.get('invite_token', '')
    const expiresAtStr = await Setting.get('invite_token_expires_at', '')

    if (!storedToken || token !== storedToken) {
      session.flash('error', 'This invite link is invalid.')
      return response.redirect().toRoute('login')
    }

    if (!expiresAtStr || DateTime.fromISO(expiresAtStr) < DateTime.now()) {
      session.flash('error', 'This invite link has expired.')
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

    const existingUser = await User.findBy('email', email)
    if (existingUser) {
      session.flash('error', 'An account with this email already exists')
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

    const user = await User.create({
      fullName: full_name,
      email: email,
      password: password,
    })

    // Consume the invite token so it can't be reused
    await Setting.set('invite_token', '')
    await Setting.set('invite_token_expires_at', '')

    await auth.use('web').login(user)
    return response.redirect().toRoute('admin.bilingual.index')
  }

  /**
   * Toggle user role between admin and contributor
   */
  async toggleRole({ params, response, session }: HttpContext) {
    const user = await User.find(params.id)

    if (!user) {
      session.flash('error', 'User not found')
      return response.redirect().toRoute('admin.users.index')
    }

    user.role = user.role === 'admin' ? 'contributor' : 'admin'
    await user.save()

    session.flash('success', `${user.fullName} is now ${user.role === 'admin' ? 'an admin' : 'a contributor'}`)
    return response.redirect().toRoute('admin.users.index')
  }

  /**
   * Delete an admin user
   */
  async deleteUser({ params, response, session, auth }: HttpContext) {
    const user = await User.find(params.id)

    if (!user) {
      session.flash('error', 'User not found')
      return response.redirect().toRoute('admin.users.index')
    }

    // Prevent deleting yourself
    if (user.id === auth.user!.id) {
      session.flash('error', 'You cannot delete your own account')
      return response.redirect().toRoute('admin.users.index')
    }

    // Prevent deleting the last user
    const userCount = await User.query().count('* as total')
    if (Number(userCount[0].$extras.total) <= 1) {
      session.flash('error', 'Cannot delete the last admin user')
      return response.redirect().toRoute('admin.users.index')
    }

    await user.delete()

    session.flash('success', 'User deleted successfully')
    return response.redirect().toRoute('admin.users.index')
  }
}