import env from 'env-var';

export const NODE_ENV = process.env.NODE_ENV;

export const SERVER_HOST = env.get('SERVER_HOST').default('0.0.0.0').asString();

export const PORT = env.get('PORT').default(3001).asPortNumber();
