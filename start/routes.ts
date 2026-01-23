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
const TranslationController = () => import('#controllers/translation_controller')
const BilingualEditorController = () => import('#controllers/bilingual_editor_controller')

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
    router.post('/settings/translations', [SettingsController, 'saveTranslations']).as('admin.settings.saveTranslations')

    // User management
    router.get('/users', [AuthController, 'listUsers']).as('admin.users.index')
    router.get('/users/create', [AuthController, 'showCreateUser']).as('admin.users.create')
    router.post('/users', [AuthController, 'createUser']).as('admin.users.store')
    router.delete('/users/:id', [AuthController, 'deleteUser']).as('admin.users.destroy')

    // Translation (admin)
    router.post('/translate/section/:id', [TranslationController, 'translateSection']).as('admin.translate.section')
    router.post('/translate/text', [TranslationController, 'translateText']).as('admin.translate.text')

    // Bilingual editor
    router.get('/bilingual', [BilingualEditorController, 'index']).as('admin.bilingual.index')
    router.put('/bilingual/settings', [BilingualEditorController, 'updateSettings']).as('admin.bilingual.updateSettings')
    router.post('/bilingual/translations', [BilingualEditorController, 'saveTranslations']).as('admin.bilingual.saveTranslations')
    router.put('/bilingual/sections/:id', [BilingualEditorController, 'updateSection']).as('admin.bilingual.updateSection')
    router.post('/bilingual/sections', [BilingualEditorController, 'createSection']).as('admin.bilingual.createSection')
    router.delete('/bilingual/sections/:id', [BilingualEditorController, 'deleteSection']).as('admin.bilingual.deleteSection')
  })
  .prefix('/admin')
  .use(middleware.auth())

// Public translation API
router.get('/api/translate/languages', [TranslationController, 'languages']).as('api.translate.languages')
router.post('/api/translate/page', [TranslationController, 'translatePage']).as('api.translate.page')
