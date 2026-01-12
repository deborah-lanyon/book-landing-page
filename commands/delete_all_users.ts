import { BaseCommand } from '@adonisjs/core/ace'
import User from '#models/user'

export default class DeleteAllUsers extends BaseCommand {
  static commandName = 'user:delete-all'
  static description = 'Delete ALL users (forces setup page to appear)'

  async run() {
    const count = await User.query().delete()

    this.logger.success(`Deleted ${count} user(s)`)
    this.logger.info('Visit /setup to create a new admin account')
  }
}