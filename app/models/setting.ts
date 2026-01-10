import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Setting extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare key: string

  @column()
  declare value: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  static async get(key: string, defaultValue: string = ''): Promise<string> {
    const setting = await this.findBy('key', key)
    return setting?.value ?? defaultValue
  }

  static async set(key: string, value: string): Promise<void> {
    await this.updateOrCreate({ key }, { key, value })
  }
}