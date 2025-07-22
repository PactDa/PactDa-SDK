import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './config/environment.validation';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<EnvironmentVariables>);

  // Security middleware
  app.use(helmet());

  // Rate limiting
  const rateLimitWindowMs = configService.get('RATE_LIMIT_WINDOW_MS', {
    infer: true,
  });
  const rateLimitMaxRequests = configService.get('RATE_LIMIT_MAX_REQUESTS', {
    infer: true,
  });

  app.use(
    rateLimit({
      windowMs: rateLimitWindowMs,
      max: rateLimitMaxRequests,
      message: {
        statusCode: 429,
        message: 'Too many requests, please try again later',
      },
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Enhanced validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: configService.get('NODE_ENV') === 'production',
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // CORS configuration
  app.enableCors({
    origin:
      configService.get('NODE_ENV') === 'production'
        ? configService.get('DOMAIN')
        : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const port = configService.get('PORT', { infer: true }) || 3000;
  await app.listen(port);

  console.log(`🚀 Server running on port ${port}`);
  console.log(
    `🔒 Security features enabled: Helmet, Rate Limiting, Enhanced Validation`,
  );
}
void bootstrap();
