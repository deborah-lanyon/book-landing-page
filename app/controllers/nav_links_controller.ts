import type { HttpContext } from '@adonisjs/core/http'
import NavLink from '#models/nav_link'

export default class NavLinksController {
  async index({ view }: HttpContext) {
    const links = await NavLink.query()
      .whereNull('parent_id')
      .orderBy('sort_order', 'asc')
      .preload('children', (query) => {
        query.orderBy('sort_order', 'asc')
      })

    return view.render('admin/nav-links/index', { links })
  }

  async store({ request, response, session }: HttpContext) {
    const { label, url, openInNewTab, parentId } = request.only(['label', 'url', 'openInNewTab', 'parentId'])

    if (!label || !url) {
      session.flash('error', 'Label and URL are required.')
      return response.redirect().back()
    }

    const parent = parentId ? Number(parentId) : null
    const maxOrder = await NavLink.query()
      .if(parent, (q) => q.where('parent_id', parent!))
      .if(!parent, (q) => q.whereNull('parent_id'))
      .max('sort_order as max')
      .first()
    const nextOrder = (maxOrder?.$extras?.max ?? 0) + 1

    await NavLink.create({
      label,
      url,
      openInNewTab: openInNewTab === 'on' || openInNewTab === true,
      sortOrder: nextOrder,
      parentId: parent,
    })

    session.flash('success', 'Link added.')
    return response.redirect().toRoute('admin.navlinks.index')
  }

  async update({ params, request, response, session }: HttpContext) {
    const link = await NavLink.findOrFail(params.id)
    const { label, url, openInNewTab } = request.only(['label', 'url', 'openInNewTab'])

    link.label = label
    link.url = url
    link.openInNewTab = openInNewTab === 'on' || openInNewTab === true
    await link.save()

    session.flash('success', 'Link updated.')
    return response.redirect().toRoute('admin.navlinks.index')
  }

  async destroy({ params, response, session }: HttpContext) {
    const link = await NavLink.findOrFail(params.id)
    await link.delete()

    session.flash('success', 'Link removed.')
    return response.redirect().toRoute('admin.navlinks.index')
  }

  async reorder({ request, response }: HttpContext) {
    const { ids } = request.only(['ids'])
    if (Array.isArray(ids)) {
      for (let i = 0; i < ids.length; i++) {
        await NavLink.query().where('id', ids[i]).update({ sort_order: i })
      }
    }
    return response.json({ ok: true })
  }
}
