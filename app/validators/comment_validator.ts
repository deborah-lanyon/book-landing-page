import vine from '@vinejs/vine'

export const commentValidator = vine.compile(
  vine.object({
    sectionId: vine.number().positive(),
    authorName: vine.string().trim().minLength(1).maxLength(100),
    authorEmail: vine.string().trim().email(),
    content: vine.string().trim().minLength(1).maxLength(2000),
    // Honeypot field - must be empty (bots fill this, humans don't see it)
    website: vine.string().trim().maxLength(0).optional(),
  })
)
