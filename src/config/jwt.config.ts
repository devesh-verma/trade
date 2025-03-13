import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessExpiration: process.env.JWT_ACCESS_EXPIRATION,
  refreshExpiration: process.env.JWT_REFRESH_EXPIRATION,
  accessExpirationSeconds: process.env.JWT_ACCESS_EXPIRATION_SECONDS,
  refreshExpirationSeconds: process.env.JWT_REFRESH_EXPIRATION_SECONDS,
}));
