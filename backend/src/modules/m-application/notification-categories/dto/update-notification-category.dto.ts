import { PartialType } from '@nestjs/swagger';
import { CreateNotificationCategoryDto } from './create-notification-category.dto';

export class UpdateNotificationCategoryDto extends PartialType(
  CreateNotificationCategoryDto,
) {}
