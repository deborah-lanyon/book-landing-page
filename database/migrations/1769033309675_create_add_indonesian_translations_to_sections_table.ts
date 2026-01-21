import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sections'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Indonesian translations for section fields
      table.text('title_id').nullable()
      table.text('content_id').nullable()
      table.text('reflective_question_id').nullable()
      table.text('reflective_question_2_id').nullable()
      table.text('reflective_question_3_id').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('title_id')
      table.dropColumn('content_id')
      table.dropColumn('reflective_question_id')
      table.dropColumn('reflective_question_2_id')
      table.dropColumn('reflective_question_3_id')
    })
  }
}
