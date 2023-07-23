import { cleanEnv, host, num, port, str } from 'envalid';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), `../.env.${process.env.NODE_ENV}`) });

const config = cleanEnv(process.env, {
  // Postgres Database
  POSTGRES_HOST: host({ default: 'localhost' }),
  POSTGRES_PORT: num(),
  POSTGRES_DB: str(),
  POSTGRES_USER: str(),
  POSTGRES_PASSWORD: str(),
  // Redis Cache
  REDIS_HOST: host(),
  REDIS_PORT: port(),
  REDIS_PASSWORD: str(),
  REDIS_CACHE_TTL: num({ default: 60_000 }),
  // User
  USERNAME_MIN_LENGTH: num({ default: 6 }),
  PASSWORD_MIN_LENGTH: num({ default: 6 }),
  PASSWORD_SALT: num({ default: 10 }),
  JWT_SECRET: str(),
  JWT_EXPIRATION_IN: str({ default: '1d' }),
});

type ConfigType = typeof config;

export { ConfigType, config };

export default (): ConfigType => {
  return {
    ...config,
  };
};
