import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class AnalyticsEvent extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare sessionId: string

  @column()
  declare eventType: string

  @column()
  declare eventData: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
