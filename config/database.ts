import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbHost = env.get('DB_HOST')
const isUnixSocket = dbHost.startsWith('/')

const dbConfig = defineConfig({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: isUnixSocket
        ? {
            host: dbHost,
            user: env.get('DB_USER'),
            password: env.get('DB_PASSWORD'),
            database: env.get('DB_DATABASE'),
          }
        : {
            host: dbHost,
            port: env.get('DB_PORT'),
            user: env.get('DB_USER'),
            password: env.get('DB_PASSWORD'),
            database: env.get('DB_DATABASE'),
          },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig