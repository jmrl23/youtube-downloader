import fastify from 'fastify';
import path from 'node:path';
import fastifyProxy from '@fastify/http-proxy';
import fastifyStatic from '@fastify/static';

const server = fastify();
const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3001';
const host = process.env.SERVER_HOST ?? 'localhost'; // 0.0.0.0
const port = parseInt(process.env.PORT ?? '3000');

server.register(fastifyProxy, {
  upstream: backendUrl,
  prefix: '/api',
});

server.register(fastifyStatic, {
  root: path.resolve(__dirname, '../dist'),
});

server.listen({ host, port }, function () {
  console.clear();
  console.log('Server is running on port', port);
});
