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
const SettingsController = () => import('#controllers/settings_controller')
const ContactsController = () => import('#controllers/contacts_controller')

// Public landing page
router.get('/', [HomeController, 'index'])

// Contact form submission
router.post('/contact', [ContactsController, 'store']).as('contact.store')

// Setup route (only works when no users exist)
router.get('/setup', [AuthController, 'showSetup']).as('setup')
router.post('/setup', [AuthController, 'setup']).as('setup.store')

// Auth routes
router.get('/login', [AuthController, 'showLogin']).as('login').use(middleware.guest())
router.post('/login', [AuthController, 'login']).as('login.store')
router.post('/logout', [AuthController, 'logout']).as('logout').use(middleware.auth())

// Forgot password routes
router.get('/forgot-password', [AuthController, 'showForgotPassword']).as('password.forgot')
router.post('/forgot-password', [AuthController, 'forgotPassword']).as('password.forgot.store')
router.get('/reset-password/:token', [AuthController, 'showResetPassword']).as('password.reset')
router.post('/reset-password/:token', [AuthController, 'resetPassword']).as('password.reset.store')

// Admin routes (protected by auth middleware)
router
  .group(() => {
    router.get('/sections', [SectionsController, 'index']).as('admin.sections.index')
    router.put('/sections/lesson', [SectionsController, 'updateLesson']).as('admin.sections.updateLesson')
    router.post('/sections/reorder', [SectionsController, 'reorder']).as('admin.sections.reorder')
    router.get('/sections/create', [SectionsController, 'create']).as('admin.sections.create')
    router.post('/sections', [SectionsController, 'store']).as('admin.sections.store')
    router.get('/sections/:id/edit', [SectionsController, 'edit']).as('admin.sections.edit')
    router.put('/sections/:id', [SectionsController, 'update']).as('admin.sections.update')
    router.delete('/sections/:id', [SectionsController, 'destroy']).as('admin.sections.destroy')

    // Password change
    router.get('/password', [AuthController, 'showChangePassword']).as('admin.password.edit')
    router.put('/password', [AuthController, 'changePassword']).as('admin.password.update')

    // Settings
    router.get('/settings', [SettingsController, 'edit']).as('admin.settings.edit')
    router.put('/settings', [SettingsController, 'update']).as('admin.settings.update')
  })
  .prefix('/admin')
  .use(middleware.auth())
