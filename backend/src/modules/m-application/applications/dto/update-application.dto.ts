import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateApplicationDto } from './create-application.dto';

export class UpdateApplicationDto extends PartialType(
  OmitType(CreateApplicationDto, ['id']),
) {}
