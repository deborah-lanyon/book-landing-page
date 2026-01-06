/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const HomeController = () => import('#controllers/home_controller')
const SectionsController = () => import('#controllers/sections_controller')
const AuthController = () => import('#controllers/auth_controller')

// Public landing page
router.get('/', [HomeController, 'index'])

// Auth routes
router.get('/login', [AuthController, 'showLogin']).as('login').use(middleware.guest())
router.post('/login', [AuthController, 'login']).as('login.store')
router.post('/logout', [AuthController, 'logout']).as('logout').use(middleware.auth())

// Admin routes (protected by auth middleware)
router
  .group(() => {
    router.get('/sections', [SectionsController, 'index']).as('admin.sections.index')
    router.get('/sections/create', [SectionsController, 'create']).as('admin.sections.create')
    router.post('/sections', [SectionsController, 'store']).as('admin.sections.store')
    router.get('/sections/:id/edit', [SectionsController, 'edit']).as('admin.sections.edit')
    router.put('/sections/:id', [SectionsController, 'update']).as('admin.sections.update')
    router.delete('/sections/:id', [SectionsController, 'destroy']).as('admin.sections.destroy')
  })
  .prefix('/admin')
  .use(middleware.auth())
