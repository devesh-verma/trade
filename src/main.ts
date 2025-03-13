import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation for all routes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Set up global prefix
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  const nodeEnv = configService.get('NODE_ENV');
  await app.listen(port);
  logger.log(`Server is running`, {
    port,
    nodeEnv,
    ormType: configService.get('ORM_TYPE'),
  });
}
bootstrap();
