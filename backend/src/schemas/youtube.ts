import type { FromSchema } from 'json-schema-to-ts';
import { asJsonSchema } from '../lib/util/typings';

export const youtubeSearchSuggestionsSchema = asJsonSchema({
  type: 'object',
  description: 'Youtube search suggestions',
  additionalProperties: false,
  required: ['q'],
  properties: {
    q: {
      type: 'string',
      minLength: 0,
    },
    limit: {
      type: 'integer',
      minimum: 1,
    },
  },
});
export type YoutubeSearchSuggestions = FromSchema<
  typeof youtubeSearchSuggestionsSchema
>;

export const youtubeSearchSchema = asJsonSchema({
  type: 'object',
  description: 'Youtube search',
  additionalProperties: false,
  required: ['q'],
  properties: {
    q: {
      type: 'string',
      minLength: 0,
    },
    limit: {
      type: 'integer',
      minimum: 1,
    },
  },
});
export type YoutubeSearch = FromSchema<typeof youtubeSearchSchema>;

export const youtubeDownloadSchema = asJsonSchema({
  type: 'object',
  description: 'Youtube search',
  additionalProperties: false,
  required: ['params', 'querystring'],
  properties: {
    params: {
      type: 'object',
      required: ['videoId'],
      properties: {
        videoId: {
          type: 'string',
        },
      },
    },
    querystring: {
      type: 'object',
      required: ['format'],
      properties: {
        format: {
          type: 'string',
          enum: ['mp3', 'mp4'],
        },
      },
    },
  },
});
export type youtubeDownload = FromSchema<typeof youtubeDownloadSchema>;
