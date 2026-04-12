import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('parent_id').unsigned().nullable().references('id').inTable('comments').onDelete('CASCADE')
      table.boolean('is_admin_reply').defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('parent_id')
      table.dropColumn('is_admin_reply')
    })
  }
}
