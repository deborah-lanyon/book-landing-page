import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class NavLink extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare label: string

  @column()
  declare url: string

  @column()
  declare openInNewTab: boolean

  @column()
  declare sortOrder: number

  @column()
  declare parentId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => NavLink, { foreignKey: 'parentId' })
  declare children: HasMany<typeof NavLink>
}
