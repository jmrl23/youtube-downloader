# Youtube Downloader Backend

Download videos from youtube in MP3 or MP4 format with the best quality available.

![https://github.com/jmrl23/youtube-downloader-server](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHEyYWhoYmliZDdnOGllaGgycXd4YXgwdWlzODVqMWFmNHRkOXVrNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nj0XPti0kpg5i/giphy.gif)

<picture>
  <source srcset="https://fastify.dev/img/logos/fastify-white.svg" media="(prefers-color-scheme: dark)" />
  <img src="https://fastify.dev/img/logos/fastify-black.svg" />
</picture>

## Installation

```bash
yarn # or npm install
```

- [Download yt-dlp](https://github.com/yt-dlp/yt-dlp/releases)
- Put the downloaded file inside the [.bin](.bin/) folder and name it `yt-dlp`

## Scripts

| Script     | Description                                                                      |
| ---------- | -------------------------------------------------------------------------------- |
| build      | build project                                                                    |
| start      | start (must build first)                                                         |
| start:dev  | start on development mode (uses swc)                                             |
| start:prod | start on production mode (set `NODE_ENV` to `production` and run `start` script) |
| format     | format codes (prettier)                                                          |
