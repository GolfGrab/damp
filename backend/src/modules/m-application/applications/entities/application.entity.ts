import { OmitType } from '@nestjs/swagger';
import { ApplicationWithApiKey } from './application-with-api-key.entity';

export class Application extends OmitType(ApplicationWithApiKey, ['apiKey']) {}
