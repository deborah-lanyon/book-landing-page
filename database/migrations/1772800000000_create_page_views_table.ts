import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'page_views'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('session_id', 64).notNullable().index()
      table.string('ip_address', 45).nullable()
      table.string('country', 100).nullable()
      table.string('city', 100).nullable()
      table.string('referrer', 2048).nullable()
      table.string('user_agent', 1024).nullable()
      table.integer('time_on_page').nullable()
      table.string('page_path', 512).defaultTo('/')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
