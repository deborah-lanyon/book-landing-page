import vine from '@vinejs/vine'

export const createSectionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    reflectiveQuestion: vine.string().trim().optional(),
    reflectiveQuestion2: vine.string().trim().optional(),
    reflectiveQuestion3: vine.string().trim().optional(),
    content: vine.string().trim().minLength(1),
    imageUrl: vine.string().trim().optional(),
    displayOrder: vine.number().min(0).optional(),
    isPublished: vine.boolean().optional(),
  })
)

export const updateSectionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    reflectiveQuestion: vine.string().trim().optional(),
    reflectiveQuestion2: vine.string().trim().optional(),
    reflectiveQuestion3: vine.string().trim().optional(),
    content: vine.string().trim().minLength(1),
    imageUrl: vine.string().trim().optional(),
    displayOrder: vine.number().min(0).optional(),
    isPublished: vine.boolean().optional(),
  })
)
