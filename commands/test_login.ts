import { BaseCommand } from '@adonisjs/core/ace'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class TestLogin extends BaseCommand {
  static commandName = 'test:login'
  static description = 'Test user login verification'

  async run() {
    const email = 'admin@example.com'
    const password = 'password123'

    this.logger.info(`Testing login for ${email}`)

    try {
      // First test: Direct hash verification with the production hash
      const productionHash = '$scrypt$n=16384,r=8,p=1$kBi4YV+5Sup/g7eoAJEZyA$630eb3CeRzxefzEy827OhTddbtoBSO3HW2clQ9ishyxg2vaisp7P9966B5ssWHpI/yI5K5TGUKlh7gf3FeJqdQ'

      this.logger.info('\n1. Testing production hash verification')
      const productionHashValid = await hash.use('scrypt').verify(productionHash, password)

      if (productionHashValid) {
        this.logger.success(`✅ Production hash verification PASSED!`)
      } else {
        this.logger.error(`❌ Production hash verification FAILED!`)
      }

      // Second test: Try to find the user in local database
      this.logger.info('\n2. Checking local database')
      const user = await User.query().where('email', email).first()

      if (!user) {
        this.logger.warning('⚠️  User not found in local database')
        this.logger.info('Creating user locally...')

        const newUser = await User.create({
          fullName: 'Admin User',
          email: email,
          password: password,
        })

        this.logger.success(`✅ User created with ID: ${newUser.id}`)
        this.logger.info(`Password hash: ${newUser.password.substring(0, 50)}...`)

        // Test the newly created user
        try {
          const verifiedUser = await User.verifyCredentials(email, password)
          this.logger.success(`✅ Login with new user successful! User ID: ${verifiedUser.id}`)
        } catch (error: any) {
          this.logger.error(`❌ Login with new user failed: ${error.message}`)
        }
      } else {
        this.logger.info(`User found: ${user.email}`)
        this.logger.info(`Password hash: ${user.password.substring(0, 50)}...`)

        // Fourth test: Manual hash verification FIRST
        this.logger.info('\n3. Testing manual hash verification')
        const manualVerify = await hash.use('scrypt').verify(user.password, password)

        if (manualVerify) {
          this.logger.success(`✅ Manual hash verification PASSED!`)
        } else {
          this.logger.error(`❌ Manual hash verification FAILED!`)
        }

        // Third test: Try to verify credentials
        this.logger.info('\n4. Testing User.verifyCredentials()')
        try {
          const verifiedUser = await User.verifyCredentials(email, password)
          this.logger.success(`✅ Login successful! User ID: ${verifiedUser.id}`)
        } catch (error: any) {
          this.logger.error(`❌ Login failed: ${error.message}`)
          if (manualVerify) {
            this.logger.error('⚠️  Hash is valid but User.verifyCredentials() failed - this is the bug!')
          }
        }
      }

    } catch (error: any) {
      this.logger.error(`Error: ${error.message}`)
      this.logger.error(error.stack)
    }
  }
}
