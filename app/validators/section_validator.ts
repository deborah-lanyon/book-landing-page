import vine from '@vinejs/vine'

export const createSectionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
    content: vine.string().trim().minLength(1),
    displayOrder: vine.number().min(0).optional(),
    isPublished: vine.boolean().optional(),
  })
)

export const updateSectionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
    content: vine.string().trim().minLength(1),
    displayOrder: vine.number().min(0).optional(),
    isPublished: vine.boolean().optional(),
  })
)
