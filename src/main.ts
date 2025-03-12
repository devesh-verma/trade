import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  const nodeEnv = configService.get('NODE_ENV');
  await app.listen(port);
  logger.log(`Server is running on port ${port} in ${nodeEnv} mode`);
}
bootstrap();
