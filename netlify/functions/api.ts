import serverless from 'serverless-http'
import app from '../../server/dist/index.js'

export const handler = serverless(app)
