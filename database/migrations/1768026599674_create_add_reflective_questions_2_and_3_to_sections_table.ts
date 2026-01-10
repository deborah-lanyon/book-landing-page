import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sections'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('reflective_question_2').nullable()
      table.text('reflective_question_3').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('reflective_question_2')
      table.dropColumn('reflective_question_3')
    })
  }
}