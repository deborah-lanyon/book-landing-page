import type { HttpContext } from '@adonisjs/core/http'
import Section from '#models/section'
import Setting from '#models/setting'
import { createSectionValidator, updateSectionValidator } from '#validators/section_validator'
import { errors } from '@vinejs/vine'

export default class SectionsController {
  /**
   * Display a list of all sections
   */
  async index({ view }: HttpContext) {
    const sections = await Section.query().orderBy('display_order', 'asc')
    const lessonTitle = await Setting.get('lesson_title', '')
    const lessonIntroduction = await Setting.get('lesson_introduction', '')
    const lessonImage = await Setting.get('lesson_image', '')
    return view.render('admin/sections/index', { sections, lessonTitle, lessonIntroduction, lessonImage })
  }

  /**
   * Update lesson settings from the sections page
   */
  async updateLesson({ request, response, session }: HttpContext) {
    const { lesson_title, lesson_introduction, lesson_image } = request.only([
      'lesson_title',
      'lesson_introduction',
      'lesson_image',
    ])
    await Setting.set('lesson_title', lesson_title || '')
    await Setting.set('lesson_introduction', lesson_introduction || '')
    await Setting.set('lesson_image', lesson_image || '')
    session.flash('success', 'Lesson settings updated successfully')
    return response.redirect().toRoute('admin.sections.index')
  }

  /**
   * Reorder sections via drag-and-drop
   */
  async reorder({ request, response }: HttpContext) {
    const { order } = request.only(['order'])

    if (Array.isArray(order)) {
      for (let i = 0; i < order.length; i++) {
        await Section.query().where('id', order[i]).update({ display_order: i })
      }
    }

    return response.json({ success: true })
  }

  /**
   * Display form to create a new section
   */
  async create({ view }: HttpContext) {
    return view.render('admin/sections/create')
  }

  /**
   * Handle the form submission to create a new section
   */
  async store({ request, response, session }: HttpContext) {
    try {
      const data = await request.validateUsing(createSectionValidator)

      // Get the max display order to place new section at the end
      const maxOrderResult = await Section.query().max('display_order as max')
      const maxOrder = maxOrderResult[0]?.$extras?.max ?? -1

      await Section.create({
        title: data.title,
        reflectiveQuestion: data.reflectiveQuestion ?? null,
        reflectiveQuestion2: data.reflectiveQuestion2 ?? null,
        reflectiveQuestion3: data.reflectiveQuestion3 ?? null,
        content: data.content,
        imageUrl: data.imageUrl ?? null,
        displayOrder: maxOrder + 1,
        isPublished: data.isPublished ?? false,
      })

      session.flash('success', 'Section created successfully')
      return response.redirect().toRoute('admin.sections.index')
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        session.flash('errors', error.messages)
        return response.redirect().back()
      }
      throw error
    }
  }

  /**
   * Display form to edit an existing section
   */
  async edit({ params, view }: HttpContext) {
    const section = await Section.findOrFail(params.id)
    return view.render('admin/sections/edit', { section })
  }

  /**
   * Handle the form submission to update a section
   */
  async update({ params, request, response, session }: HttpContext) {
    const section = await Section.findOrFail(params.id)

    try {
      const data = await request.validateUsing(updateSectionValidator)

      section.title = data.title
      section.reflectiveQuestion = data.reflectiveQuestion ?? null
      section.reflectiveQuestion2 = data.reflectiveQuestion2 ?? null
      section.reflectiveQuestion3 = data.reflectiveQuestion3 ?? null
      section.content = data.content
      section.imageUrl = data.imageUrl ?? null
      section.isPublished = data.isPublished ?? false

      await section.save()

      session.flash('success', 'Section updated successfully')
      return response.redirect().toRoute('admin.sections.index')
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        session.flash('errors', error.messages)
        return response.redirect().back()
      }
      throw error
    }
  }

  /**
   * Delete a section
   */
  async destroy({ params, response, session }: HttpContext) {
    const section = await Section.findOrFail(params.id)
    await section.delete()

    session.flash('success', 'Section deleted successfully')
    return response.redirect('/admin/sections')
  }
}