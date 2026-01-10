import vine from '@vinejs/vine'

export const contactValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim().minLength(1).maxLength(100),
    lastName: vine.string().trim().maxLength(100).optional(),
    town: vine.string().trim().minLength(1).maxLength(100),
    email: vine.string().trim().email(),
    wantFollowJesus: vine.boolean().optional(),
    wantBible: vine.boolean().optional(),
    wantPrayerRequest: vine.boolean().optional(),
    wantAskQuestion: vine.boolean().optional(),
    message: vine.string().trim().optional(),
  })
)