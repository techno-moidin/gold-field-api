export const appConfig = {
  port: parseInt(process.env.APP_PORT ?? '8001', 10),
  env: process.env.APP_ENV ?? 'development',
};
