import { exec } from 'child_process'
import { server } from './server'
import './websocket'

const { PORT: port, NODE_ENV: env } = process.env
const PORT = parseInt(port || '3000')
const NODE_ENV = env || 'development'

if (process.env.NODE_ENV !== 'production') {
  exec('yarn run export:client:app', (error) => {
    if (error) console.error(error)
  })
}

server.listen(PORT,
  () => {
    console.table({ PORT, NODE_ENV })
  }
)