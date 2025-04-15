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
    PAYMENTS_LOCAL_PORT: process.env.PAYMENTS_LOCAL_PORT,
    RABBIT_URLS: process.env.RABBIT_URLS?.split(','),
    DATABASE_URL: process.env.DATABASE_URL,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
  };
};