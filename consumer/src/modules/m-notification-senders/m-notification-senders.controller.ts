import { Controller, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MNotificationSendersService } from './m-notification-senders.service';
import { $Enums } from '@prisma/client';
import { NotificationTaskMessageDto } from './dto/notification-task-message.dto';
import { ParseJsonPipe } from '@/pipe/ParseJson.pipe';

@Controller()
export class MNotificationSendersController {
  constructor(
    private readonly mNotificationSendersService: MNotificationSendersService,
  ) {}

  @MessagePattern($Enums.ChannelType.EMAIL)
  emailConsumer(
    @Payload()
    data: NotificationTaskMessageDto,
  ) {
    console.log('Received email task:', data);
    return this.mNotificationSendersService.sendEmail(data);
  }
}
