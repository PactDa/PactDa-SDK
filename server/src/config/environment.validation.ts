import { plainToClass, Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  validateSync,
  MinLength,
} from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsIn(['development', 'production', 'test'])
  NODE_ENV: string = 'development';

  @IsNumber()
  @Type(() => Number)
  PORT: number = 3000;

  // Database Configuration (Required, no defaults for security)
  @IsString()
  DB_HOST: string;

  @IsNumber()
  @Type(() => Number)
  DB_PORT: number = 5432;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;

  // JWT Configuration (Required, no defaults for security)
  @IsString()
  @MinLength(32, { message: 'JWT_SECRET must be at least 32 characters long' })
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRATION: string = '24h';

  // Google OAuth Configuration
  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_SECRET?: string;

  @IsOptional()
  @IsString()
  GOOGLE_REDIRECT_URI?: string;

  // Mail Configuration
  @IsString()
  MAIL_HOST: string = 'localhost';

  @IsNumber()
  @Type(() => Number)
  MAIL_PORT: number = 587;

  @IsOptional()
  @IsString()
  MAIL_USER?: string;

  @IsOptional()
  @IsString()
  MAIL_PASS?: string;

  @IsString()
  DOMAIN: string;

  // Rate Limiting Configuration
  @IsNumber()
  @Type(() => Number)
  RATE_LIMIT_WINDOW_MS: number = 15 * 60 * 1000; // 15 minutes

  @IsNumber()
  @Type(() => Number)
  RATE_LIMIT_MAX_REQUESTS: number = 100;

  // External API Timeout Configuration
  @IsNumber()
  @Type(() => Number)
  EXTERNAL_API_TIMEOUT_MS: number = 10000; // 10 seconds
}

export function validateEnvironment(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessage = errors
      .map((error) => Object.values(error.constraints || {}))
      .flat()
      .join(', ');
    throw new Error(`Configuration validation failed: ${errorMessage}`);
  }

  return validatedConfig;
}
