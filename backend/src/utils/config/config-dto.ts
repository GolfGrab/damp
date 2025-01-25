import { IsEnum, IsNumberString, IsString, IsUrl } from 'class-validator';

export class Config {
  @IsEnum(['development', 'production'])
  readonly NODE_ENV: 'development' | 'production';

  @IsUrl()
  readonly OAUTH_ISSUER_URL: string;

  @IsString()
  readonly OAUTH_CLIENT_ID: string;

  @IsString()
  readonly OAUTH_CLIENT_SECRET: string;

  @IsString()
  readonly OAUTH_ALLOWED_CLIENT_ID: string;

  @IsString()
  readonly QUEUE_URL: string;

  @IsString()
  readonly QUEUE_PREFIX: string;

  @IsNumberString()
  readonly EMAIL_RETRY_LIMIT: string;

  @IsNumberString()
  readonly SMS_RETRY_LIMIT: string;

  @IsNumberString()
  readonly SLACK_RETRY_LIMIT: string;
}
