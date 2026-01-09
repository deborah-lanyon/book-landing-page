import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  /**
   * Show login form
   */
  async showLogin({ view }: HttpContext) {
    return view.render('auth/login')
  }

  /**
   * Handle login
   */
  async login({ request, response, auth, session }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const user = await User.findBy('email', email)

      if (!user) {
        return response.send(`DEBUG: User not found for email: ${email}`)
      }

      const hashPreview = user.password.substring(0, 50)
      const isValid = await hash.use('scrypt').verify(user.password, password)

      return response.send(`
        DEBUG INFO:<br>
        Email: ${email}<br>
        User found: YES (ID: ${user.id})<br>
        Password hash (first 50 chars): ${hashPreview}<br>
        Hash verification result: ${isValid}<br>
        Password entered length: ${password.length}<br>
      `)

      // This code won't run due to early return above
      await auth.use('web').login(user)
      return response.redirect().toRoute('admin.sections.index')
    } catch (error: any) {
      return response.send(`DEBUG ERROR: ${error.message}<br>Stack: ${error.stack}`)
    }
  }

  /**
   * Handle logout
   */
  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('login')
  }
}