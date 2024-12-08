import {
  IsEnum,
  IsNumberString,
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

  @IsNumberString()
  readonly EMAIL_RETRY_LIMIT: string;

  @IsNumberString()
  readonly SMS_RETRY_LIMIT: string;

  @IsNumberString()
  readonly WEB_PUSH_RETRY_LIMIT: string;

  @IsNumberString()
  readonly SLACK_RETRY_LIMIT: string;
}
