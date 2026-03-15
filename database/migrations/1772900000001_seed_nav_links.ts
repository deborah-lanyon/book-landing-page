import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.defer(async (db) => {
      await db.table('nav_links').multiInsert([
        { label: 'Albata', url: 'https://albata.info', open_in_new_tab: true, sort_order: 0, created_at: new Date() },
        { label: 'Waha App', url: 'https://waha.app/eng/app', open_in_new_tab: true, sort_order: 1, created_at: new Date() },
      ])
    })
  }

  async down() {
    await this.defer(async (db) => {
      await db.from('nav_links').whereIn('label', ['Albata', 'Waha App']).delete()
    })
  }
}
