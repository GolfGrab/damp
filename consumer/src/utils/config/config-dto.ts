import { $Enums } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
} from 'class-validator';

export class Config {
  @IsEnum(['development', 'production'])
  readonly NODE_ENV: 'development' | 'production';

  @IsUrl()
  @IsOptional()
  readonly OAUTH_URL: string;

  @IsUUID()
  @IsOptional()
  readonly CLIENT_ID: string;

  @IsString()
  @IsOptional()
  readonly CLIENT_SECRET: string;

  @IsString()
  readonly QUEUE_URL: string;

  @IsString()
  readonly QUEUE_PREFIX: string;

  @IsEnum($Enums.ChannelType)
  readonly CHANNEL_TYPE: $Enums.ChannelType;

  @IsString()
  readonly EMAIL_HOST: string;

  @Type(() => Number)
  @IsInt()
  readonly EMAIL_PORT: number;

  @IsString()
  @IsOptional()
  readonly EMAIL_AUTH_USER: string | undefined;

  @IsString()
  @IsOptional()
  readonly EMAIL_AUTH_PASS: string | undefined;

  @IsString()
  readonly EMAIL_FROM: string;
}
