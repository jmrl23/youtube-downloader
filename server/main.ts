import fastify from 'fastify';
import path from 'node:path';
import fastifyProxy from '@fastify/http-proxy';
import fastifyStatic from '@fastify/static';

const server = fastify();
const host = process.env.HOST ?? 'localhost';
const port = parseInt(process.env.PORT ?? '3000');

server.register(fastifyProxy, {
  upstream: process.env.API_URL ?? 'http://localhost:3001',
  prefix: '/api',
});

server.register(fastifyStatic, {
  root: path.resolve(__dirname, '../dist'),
});

server.listen({ host, port }, function () {
  console.log('Server is running on port', port);
});
