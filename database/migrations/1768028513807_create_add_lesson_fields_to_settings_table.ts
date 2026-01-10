import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'settings'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('lesson_title').nullable()
      table.text('lesson_introduction').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('lesson_title')
      table.dropColumn('lesson_introduction')
    })
  }
}