import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'contact_submissions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('first_name').notNullable()
      table.string('last_name').nullable()
      table.string('town').notNullable()
      table.string('email').notNullable()
      table.boolean('want_follow_jesus').defaultTo(false)
      table.boolean('want_bible').defaultTo(false)
      table.boolean('want_prayer_request').defaultTo(false)
      table.boolean('want_ask_question').defaultTo(false)
      table.text('message').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}