import express from 'express'
import { join } from 'path'

const app = express()

app.use(express.static(join(__dirname, '../public'), {
  maxAge: process.env.NODE_ENV === 'production' ?
    '3600000' : 'public,max-age=0,must-revalidate'
}))

export { app }