import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Section extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare reflectiveQuestion: string | null

  @column()
  declare reflectiveQuestion2: string | null

  @column()
  declare reflectiveQuestion3: string | null

  @column()
  declare content: string

  @column()
  declare imageUrl: string | null

  @column()
  declare displayOrder: number

  @column()
  declare isPublished: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}