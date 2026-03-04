import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class PageView extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare sessionId: string

  @column()
  declare ipAddress: string | null

  @column()
  declare country: string | null

  @column()
  declare city: string | null

  @column()
  declare referrer: string | null

  @column()
  declare userAgent: string | null

  @column()
  declare timeOnPage: number | null

  @column()
  declare pagePath: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
