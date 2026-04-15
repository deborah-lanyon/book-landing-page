import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'nav_links'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('parent_id').unsigned().nullable().references('id').inTable('nav_links').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('parent_id')
    })
  }
}
