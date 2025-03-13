import { Type, plainToInstance } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, validateSync } from 'class-validator';

export class EnvironmentVariables {
  // Server
  @IsInt()
  @Type(() => Number)
  PORT!: number;

  @IsString()
  @IsNotEmpty()
  NODE_ENV!: string;

  // JWT
  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_EXPIRATION!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_EXPIRATION!: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_EXPIRATION_SECONDS!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_EXPIRATION_SECONDS!: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map((error) => {
      return `${error.property}: ${Object.values(error.constraints || {}).join(', ')}`;
    });
    throw new Error(
      `Configuration validation failed:\n${errorMessages.join('\n')}`,
    );
  }

  return validatedConfig;
}
