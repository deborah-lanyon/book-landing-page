# Authentication Issue - Production Login Failing

## Problem Summary
Login works perfectly locally but fails in production on Google Cloud Run with "Invalid credentials" error.

## Environment Details
- **Application**: AdonisJS 6 application
- **Local Environment**: Works perfectly - login succeeds with admin@example.com / password123
- **Production Environment**: Google Cloud Run (australia-southeast1)
- **Database**: Cloud SQL PostgreSQL (book-landing-db, australia-southeast1)
- **Service Name**: book-landing-page
- **Project**: book-landing-page-483402

## What We Know For Certain

### 1. Database is Correct
Verified via direct SQL query to production database:
```sql
SELECT email, password, created_at FROM users WHERE email = 'admin@example.com';
```

Result:
- Email: admin@example.com
- Password Hash: `$scrypt$n=16384,r=8,p=1$kBi4YV+5Sup/g7eoAJEZyA$630eb3CeRzxefzEy827OhTddbtoBSO3HW2clQ9ishyxg2vaisp7P9966B5ssWHpI/yI5K5TGUKlh7gf3FeJqdQ`
- Created: 2026-01-08 03:11:21.651+00

The hash is properly formatted with scrypt algorithm.

### 2. Local Environment Works
- Login at http://localhost:3333/login succeeds
- Same credentials (admin@example.com / password123)
- Same codebase

### 3. Production Login Flow
- User submits form at https://book-landing-page-cmtcyurzda-uc.a.run.app/login
- Receives HTTP 302 redirect back to login page
- "Invalid credentials" flash message appears
- No useful logs appear in Cloud Logging

### 4. Code Configuration

**User Model** (app/models/user.ts):
```typescript
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, beforeSave } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @beforeSave()
  static async hashPassword(user: any) {
    if (user.$dirty.password) {
      user.password = await hash.make(user.password)
    }
  }
}
```

**Hash Config** (config/hash.ts):
```typescript
import { defineConfig, drivers } from '@adonisjs/core/hash'

const hashConfig = defineConfig({
  default: 'scrypt',

  list: {
    scrypt: drivers.scrypt({
      cost: 16384,
      blockSize: 8,
      parallelization: 1,
      maxMemory: 33554432,
    }),
  },
})

export default hashConfig
```

**Auth Config** (config/auth.ts):
```typescript
import { defineConfig } from '@adonisjs/auth'
import { sessionGuard, sessionUserProvider } from '@adonisjs/auth/session'

const authConfig = defineConfig({
  default: 'web',
  guards: {
    web: sessionGuard({
      useRememberMeTokens: false,
      provider: sessionUserProvider({
        model: () => import('#models/user')
      }),
    }),
  },
})

export default authConfig
```

**Current Auth Controller** (app/controllers/auth_controller.ts):
```typescript
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  async showLogin({ view }: HttpContext) {
    return view.render('auth/login')
  }

  async login({ request, response, auth, session }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const user = await User.findBy('email', email)

      if (!user) {
        return response.send(`DEBUG: User not found for email: ${email}`)
      }

      const hashPreview = user.password.substring(0, 50)
      const isValid = await hash.use('scrypt').verify(user.password, password)

      return response.send(`
        DEBUG INFO:<br>
        Email: ${email}<br>
        User found: YES (ID: ${user.id})<br>
        Password hash (first 50 chars): ${hashPreview}<br>
        Hash verification result: ${isValid}<br>
        Password entered length: ${password.length}<br>
      `)

      // This code won't run due to early return above
      await auth.use('web').login(user)
      return response.redirect().toRoute('admin.sections.index')
    } catch (error: any) {
      return response.send(`DEBUG ERROR: ${error.message}<br>Stack: ${error.stack}`)
    }
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('login')
  }
}
```

## What We've Tried

### 1. Seeder Updates (Multiple Times)
- Changed from `firstOrCreate()` to `updateOrCreate()` - didn't work
- Changed to explicit `delete()` + `create()` - still didn't work
- Ran migration job multiple times to reseed database
- Each time verified the hash was created correctly in the database

### 2. Auth Controller Changes
- Originally used `User.verifyCredentials(email, password)` - failed
- Changed to manual verification with `User.findBy()` + `hash.use('scrypt').verify()` - still failed
- Added extensive debug logging (logger.info, console.log, process.stdout.write) - **NO LOGS APPEARED**
- Added debug version that returns info directly to browser - **DEPLOYMENT SYNC ISSUE**

### 3. Deployment Attempts
- Multiple Docker rebuilds in Cloud Build
- Updated Cloud Run service with new images
- Multiple revisions created (currently on book-landing-page-00008-7cj or higher)
- Updated Dockerfile with `--ignore-ts-errors` flag

## Critical Deployment Sync Issue

**MAJOR PROBLEM**: Cannot get local code changes synced to Cloud Shell for deployment.

- Local file (c:\Users\lanyo\book-landing-page\app\controllers\auth_controller.ts) has debug code
- Cloud Shell version doesn't match
- `git pull` doesn't seem to update the files
- Manual file replacement via `cat >` doesn't persist to deployment
- Debug output NEVER appears in production, still shows "Invalid credentials"

## Logging Mystery

**NO LOGS APPEAR IN CLOUD LOGGING** despite multiple attempts:
- `logger.info()` / `logger.error()` - empty INFO messages appear but no text
- `console.log()` / `console.error()` - no output
- `process.stdout.write()` - no output
- Debug `response.send()` - doesn't appear (suggests code not deployed)

This suggests either:
1. The updated code is not being deployed at all
2. There's a caching/routing issue sending traffic to old revisions
3. There's a fundamental logging configuration problem in production

## Environment Variables (Production)

Cloud Run Service has these environment variables set:
```
NODE_ENV=production
APP_KEY=aI2pduWLRwtVw5lALD5SLg3KbO+TxAEWzRs3FYkWTfE=
HOST=0.0.0.0
LOG_LEVEL=info
SESSION_DRIVER=cookie
DB_HOST=/cloudsql/book-landing-page-483402:australia-southeast1:book-landing-db
DB_USER=bookuser
DB_PASSWORD=MQPIUc`95\g:vviD
DB_DATABASE=app
```

Cloud SQL instance: `book-landing-page-483402:australia-southeast1:book-landing-db`

## Current State

### Latest Revision
- Multiple revisions exist, status shows True for several (not properly cleaned up)
- Latest should be book-landing-page-00008-7cj or higher
- Traffic supposedly routed to 100% latest revision

### Docker Build
- Dockerfile has `--ignore-ts-errors` flag (or should have)
- Build succeeds
- Uses multi-stage build pattern

### What Should Happen Next
1. **Get debug output working** - Need to see actual production behavior
2. **Verify the debug code is actually deployed** - Check compiled JS in container
3. **See if `hash.use('scrypt').verify()` returns true or false** in production
4. **Fix the underlying issue** once we can see what's happening

## Questions to Answer

1. **Why doesn't logging work in production?** (logger, console, stdout all fail)
2. **Why doesn't the debug code deploy?** (file sync issue between local and Cloud Shell)
3. **Why does local work but production fails?** (same code, same hash format)
4. **Is there a difference in how scrypt works in production vs local?**
5. **Is there a session/cookie issue preventing proper authentication?**

## Next Steps for Fresh Eyes

1. **Verify deployment sync**: Ensure the code in Cloud Shell matches local
2. **Get ANY debug output working**: Even a simple "HELLO" message
3. **Check compiled JavaScript**: Look at build/app/controllers/auth_controller.js in deployed container
4. **Try simplest possible auth**: Hardcode password comparison, bypass all hashing
5. **Check for environment differences**: Node version, dependencies, build process

## Files of Interest

- `app/controllers/auth_controller.ts` - Login handler
- `app/models/user.ts` - User model with hash verification
- `config/hash.ts` - Scrypt configuration
- `config/auth.ts` - Authentication guard configuration
- `Dockerfile` - Build configuration
- `database/seeders/main_seeder.ts` - User creation logic

## Contact

User: deborah-lanyon
Repository: https://github.com/deborah-lanyon/book-landing-page
