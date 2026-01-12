import { BaseCommand, args } from '@adonisjs/core/ace'
import User from '#models/user'

export default class ResetPassword extends BaseCommand {
  static commandName = 'user:reset-password'
  static description = 'Reset password for a user'

  @args.string({ description: 'Email of the user' })
  declare email: string

  @args.string({ description: 'New password (min 8 characters)' })
  declare newPassword: string

  async run() {
    if (this.newPassword.length < 8) {
      this.logger.error('Password must be at least 8 characters')
      return
    }

    const user = await User.findBy('email', this.email)

    if (!user) {
      this.logger.error(`User with email ${this.email} not found`)
      return
    }

    user.password = this.newPassword
    await user.save()

    this.logger.success(`Password updated for ${this.email}`)
  }
}