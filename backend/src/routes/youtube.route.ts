import { caching, memoryStore } from 'cache-manager';
import contentDisposition from 'content-disposition';
import type { FastifyRequest } from 'fastify';
import fs from 'node:fs';
import util from 'node:util';
import sanitize from 'sanitize-filename';
import { asRoute } from '../lib/util/typings';
import {
  youtubeDownload,
  youtubeDownloadSchema,
  YoutubeSearch,
  youtubeSearchSchema,
  YoutubeSearchSuggestions,
  youtubeSearchSuggestionsSchema,
} from '../schemas/youtube';
import CacheService from '../services/CacheService';
import YoutubeService from '../services/YoutubeService';

export const prefix = '/youtube';

export default asRoute(async function youtubeRoute(app) {
  const cache = await caching(memoryStore({ ttl: 0 }));
  const cacheService = new CacheService(cache);
  const youtubeService = new YoutubeService(cacheService);

  app

    .route({
      method: 'GET',
      url: '/suggestions',
      schema: {
        description: youtubeSearchSuggestionsSchema.description,
        tags: ['youtube'],
        querystring: youtubeSearchSuggestionsSchema,
      },
      async handler(
        request: FastifyRequest<{
          Querystring: YoutubeSearchSuggestions;
        }>,
      ) {
        const { q, limit } = request.query;
        const suggestions = await youtubeService.getSuggestions(q, limit);
        return {
          suggestions,
        };
      },
    })

    .route({
      method: 'GET',
      url: '/videos',
      schema: {
        description: youtubeSearchSchema.description,
        tags: ['youtube'],
        querystring: youtubeSearchSchema,
      },
      async handler(
        request: FastifyRequest<{
          Querystring: YoutubeSearch;
        }>,
      ) {
        const { q, limit } = request.query;
        const videos = await youtubeService.getVideos(q, limit);
        return {
          videos,
        };
      },
    })

    .route({
      method: 'GET',
      url: '/:videoId/download',
      schema: {
        description: youtubeDownloadSchema.description,
        tags: ['youtube'],
        querystring: youtubeDownloadSchema.properties.querystring,
        params: youtubeDownloadSchema.properties.params,
      },
      async handler(
        request: FastifyRequest<{
          Querystring: youtubeDownload['querystring'];
          Params: youtubeDownload['params'];
        }>,
        reply,
      ) {
        const format = request.query.format;
        const videoId = request.params.videoId;

        let info =
          format === 'mp3'
            ? await youtubeService.getMp3(videoId)
            : await youtubeService.getMp4(videoId);

        reply.header('Content-Length', info.fileInfo.size);
        reply.header('Content-Type', info.fileInfo.mime);
        reply.header('Cache-Control', 'max-age=3600');
        reply.header(
          'Content-Disposition',
          `attachment; filename=${contentDisposition(sanitize(`${info.videoInfo.title}.${format}`))}`,
        );
        reply.then(
          async () => {
            void util.promisify(fs.unlinkSync)(info.fileInfo.path);
          },
          async (error) => {
            void util.promisify(fs.unlinkSync)(info.fileInfo.path);
            throw error;
          },
        );

        const readStream = fs.createReadStream(info.fileInfo.path);

        return readStream;
      },
    });
});
