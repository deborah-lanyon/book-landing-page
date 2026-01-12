import { BaseCommand, args } from '@adonisjs/core/ace'
import User from '#models/user'

export default class DeleteUser extends BaseCommand {
  static commandName = 'user:delete'
  static description = 'Delete a user by email'

  @args.string({ description: 'Email of the user to delete' })
  declare email: string

  async run() {
    const user = await User.findBy('email', this.email)

    if (!user) {
      this.logger.error(`User with email ${this.email} not found`)
      return
    }

    await user.delete()

    this.logger.success(`User ${this.email} deleted successfully`)
    this.logger.info('You can now visit /setup to create a new admin account')
  }
}