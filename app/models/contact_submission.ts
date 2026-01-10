import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ContactSubmission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare firstName: string

  @column()
  declare lastName: string | null

  @column()
  declare town: string

  @column()
  declare email: string

  @column()
  declare wantFollowJesus: boolean

  @column()
  declare wantBible: boolean

  @column()
  declare wantPrayerRequest: boolean

  @column()
  declare wantAskQuestion: boolean

  @column()
  declare message: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}