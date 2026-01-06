import type { HttpContext } from '@adonisjs/core/http'
import Section from '#models/section'
import { createSectionValidator, updateSectionValidator } from '#validators/section_validator'

export default class SectionsController {
  /**
   * Display a list of all sections
   */
  async index({ view }: HttpContext) {
    const sections = await Section.query().orderBy('display_order', 'asc')
    return view.render('admin/sections/index', { sections })
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
    const data = await request.validateUsing(createSectionValidator)

    await Section.create({
      title: data.title,
      content: data.content,
      displayOrder: data.displayOrder ?? 0,
      isPublished: data.isPublished ?? false,
    })

    session.flash('success', 'Section created successfully')
    return response.redirect().toRoute('admin.sections.index')
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
    const data = await request.validateUsing(updateSectionValidator)

    section.title = data.title
    section.content = data.content
    section.displayOrder = data.displayOrder ?? 0
    section.isPublished = data.isPublished ?? false

    await section.save()

    session.flash('success', 'Section updated successfully')
    return response.redirect().toRoute('admin.sections.index')
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