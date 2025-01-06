import { Application } from '@/modules/m-application/applications/entities/application.entity';
import { NotificationCategory } from '@/modules/m-application/notification-categories/entities/notification-category.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { $Enums, Prisma } from '@prisma/client';
import { CompiledMessage } from '../entities/compiled-message.entity';
import { NotificationTask } from '../entities/notification-task.entity';

export class OutputNotificationWithCompiledMessageAndNotificationTaskDto
  implements
    Prisma.NotificationGetPayload<{
      include: {
        notificationTasks: {
          where: {
            userId;
          };
        };
        compiledMessages: true;
        application: {
          select: {
            name: true;
          };
        };
        notificationCategory: {
          select: {
            name: true;
          };
        };
      };
    }>
{
  @ApiProperty({
    type: PickType(NotificationCategory, ['name']),
  })
  notificationCategory: Pick<NotificationCategory, 'name'>;

  @ApiProperty({
    type: PickType(Application, ['name']),
  })
  application: Pick<Application, 'name'>;

  @ApiProperty({
    type: NotificationTask,
    isArray: true,
  })
  notificationTasks: NotificationTask[];

  @ApiProperty({
    type: CompiledMessage,
    isArray: true,
  })
  compiledMessages: CompiledMessage[];

  @ApiProperty({
    type: String,
  })
  applicationId: string;

  @ApiProperty({
    type: String,
  })
  notificationCategoryId: string;

  @ApiProperty({
    type: String,
  })
  templateId: string;

  @ApiProperty({
    type: String,
  })
  templateData: string;

  @ApiProperty({
    type: String,
  })
  priority: $Enums.Priority;

  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;

  @ApiProperty({
    type: Number,
  })
  id: number;
}
