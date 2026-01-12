import { BaseCommand } from '@adonisjs/core/ace'
import db from '@adonisjs/lucid/services/db'

export default class DeleteAllUsers extends BaseCommand {
  static commandName = 'user:delete-all'
  static description = 'Delete ALL users (forces setup page to appear)'

  async run() {
    // Use raw SQL to guarantee deletion
    await db.rawQuery('DELETE FROM users')

    this.logger.success(`Deleted all users from database`)
    this.logger.info('Visit /setup to create a new admin account')

    // Verify deletion
    const countResult = await db.rawQuery('SELECT COUNT(*) as count FROM users')
    this.logger.info(`Users remaining: ${countResult.rows[0].count}`)
  }
}