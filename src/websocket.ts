import { spawn } from 'child_process'
import { join } from 'path'
import { tmpdir } from 'os'
import { createReadStream, rmSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { Server, Socket } from 'socket.io'
import { server } from './server'
import ytdl, { getBasicInfo } from 'ytdl-core'
import axios from 'axios'
import search from 'yt-search'
import ffmpeg from 'ffmpeg-static'
import moment from 'moment'
// @ts-ignore
import ss from 'socket.io-stream'
import type { VideoInfo } from './types'

const io = new Server(server)

io.on('connection', (socket: Socket) => {
  socket.on('get-suggestion', async (input: string) => {
    try {
      const result = await axios.get(`http://suggestqueries.google.com/complete/search?client=youtube&output=toolbar&hl=en&q=${encodeURI(input)}`)
      const { data } = result
      const suggestions: string[] = []
      data
        .split('[')
        .forEach((e: string, i: number) => {
          if (!e.split('"')[1] || i === 1 || e.split('"')[1] === 'k') return
          return suggestions.push(e.split('"')[1])
        })
      socket.emit('suggest', suggestions)
    } catch (error: any) {
      socket.emit('error', error.message)
    }
  })

  socket.on('search', async (input: string) => {
    try {
      const { videos } = await search(input)
      socket.emit('search-result', videos.slice(0, 18))
    } catch (error: any) {
      socket.emit('error', error.message)
    }
  })

  socket.on('request-download', (videoId: string, _type: string) => {
    const validId = /^[a-zA-Z0-9-_]{11}$/
    const validTypes = ['audio', 'video']

    if (!validId.test(videoId)) {
      socket.emit('error', 'invalid video id')
      return
    }

    if (!validTypes.includes(_type)) {
      socket.emit('error', 'invalid type')
      return
    }

    socket.emit('download-ready', videoId, _type)
  })

  ss(socket).on('download',
    async (stream: any, data: { videoId: string, _type: string }, callback: (error: any, info?: VideoInfo) => any) => {
      const { videoId, _type } = data
      try {
        const { videoDetails } = await getBasicInfo(videoId)
        const { title, ownerChannelName: owner } = videoDetails

        callback(null, { title, owner })
        if (_type === 'audio') {
          ytdl(`http://www.youtube.com/watch?v=${videoId}`, {
            filter: 'audioonly',
            quality: 'highestaudio'
          }).pipe(stream)
          console.log(`${moment(new Date()).format('YYYY-MM-DD / HH:mm')} | ${videoId}`)
          return
        }

        const file = `${uuidv4()}-${videoId}.mp4`
        const location = join(tmpdir(), file)

        if (!ffmpeg) return

        const out = spawn(ffmpeg, [
          '-loglevel', '8', '-hide_banner', '-thread_queue_size',
          '4096', '-i', 'pipe:3', '-i', 'pipe:4', '-c:v', 'copy',
          '-c:a', 'copy', '-map', '0:v:0', '-map', '1:a:0',
          location
        ], {
          windowsHide: true,
          stdio: ['inherit', 'inherit', 'inherit', 'pipe', 'pipe', 'pipe']
        })

        ytdl(`http://www.youtube.com/watch?v=${videoId}`, {
          filter: 'audioonly',
          quality: 'highestaudio'
        }).pipe(out.stdio[4] as any)

        ytdl(`http://www.youtube.com/watch?v=${videoId}`, {
          filter: 'videoonly',
          quality: 'highestvideo'
        }).pipe(out.stdio[3] as any)

        // @ts-ignore
        out.stdio[5].on('end', () => {
          const file = createReadStream(location)
          file.pipe(stream)
          file.on('error', () => {
            rmSync(location, { recursive: true })
            socket.emit('error', 'an error occurs')
          })
          file.on('end', () => {
            rmSync(location, { recursive: true })
            console.log(`${moment(new Date()).format('YYYY-MM-DD / HH:mm')} | ${videoId}`)
          })
        })

        // @ts-ignore
        out.stdio[5].on('error', () => {
          socket.emit('error', 'an error occurs')
        })

      } catch (error: any) {
        callback(error.message)
      }
    }
  )
})