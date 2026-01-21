import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sections'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add English translation columns
      table.text('title_en').nullable()
      table.text('content_en').nullable()
      table.text('reflective_question_en').nullable()
      table.text('reflective_question_2_en').nullable()
      table.text('reflective_question_3_en').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('title_en')
      table.dropColumn('content_en')
      table.dropColumn('reflective_question_en')
      table.dropColumn('reflective_question_2_en')
      table.dropColumn('reflective_question_3_en')
    })
  }
}
