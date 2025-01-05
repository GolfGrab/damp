import { ApiProperty } from '@nestjs/swagger';
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
      };
    }>
{
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
