import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

// import { ApiKeyMiddleware } from './api-key/api-key.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(ApiKeyMiddleware);
  dotenv.config({ path: './.env' });
  app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.enableCors();
  await app.listen(3001);
}
bootstrap();
