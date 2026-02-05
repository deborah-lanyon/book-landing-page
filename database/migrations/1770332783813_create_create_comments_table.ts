import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('section_id')
        .unsigned()
        .references('id')
        .inTable('sections')
        .onDelete('CASCADE')
      table.string('author_name').notNullable()
      table.string('author_email').notNullable()
      table.text('content').notNullable()
      table.boolean('is_approved').defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
