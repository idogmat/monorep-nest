export type EnvironmentsTypes =
  | 'DEVELOPMENT'
  | 'STAGING'
  | 'PRODUCTION'
  | 'TESTING';
export const EnvironmentMode = {
  DEVELOPMENT: 'DEVELOPMENT',
  STAGING: 'STAGING',
  PRODUCTION: 'PRODUCTION',
  TESTING: 'TESTING'
}
export const Environments = Object.keys(EnvironmentMode);

export const getConfiguration = () => {
  console.log(process.env.NODE_ENV?.trim(), 'NODE_ENV')
  return {
    NODE_ENV: (Environments.includes(process.env.NODE_ENV?.trim())
      ? process.env.NODE_ENV.trim()
      : 'DEVELOPMENT') as EnvironmentsTypes,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    MONGO_DB_URL: process.env.MONGO_DB_URL,
    CONNECT_PORT: process.env.CONNECT_PORT,
    FILES_TCP: process.env.FILES_TCP,
    RABBIT_URLS: process.env.RABBIT_URLS?.split(','),
    DB: {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
      logging: true
    }
  };
};