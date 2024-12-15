import { RateLimitInterceptor } from '@/utils/rate-limitter/rate-limit.interceptor';
import { Controller, Logger, UseInterceptors } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { $Enums } from '@prisma/client';
import { NotificationTaskMessageDto } from './dto/notification-task-message.dto';
import { MNotificationSendersService } from './m-notification-senders.service';

@Controller()
export class MNotificationSendersController {
  constructor(
    private readonly mNotificationSendersService: MNotificationSendersService,
  ) {}

  private readonly logger = new Logger(MNotificationSendersController.name);

  @UseInterceptors(
    new RateLimitInterceptor($Enums.ChannelType.EMAIL, {
      quota: 3,
      timeWindowMs: 10000,
    }),
  )
  @MessagePattern($Enums.ChannelType.EMAIL)
  async emailConsumer(
    @Payload() data: NotificationTaskMessageDto,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log('Consuming email notification task');
    await this.mNotificationSendersService.sendEmailNotification(data);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    channel.ack(originalMsg);
  }

  @UseInterceptors(
    new RateLimitInterceptor($Enums.ChannelType.SMS, {
      quota: 3,
      timeWindowMs: 10000,
    }),
  )
  @MessagePattern($Enums.ChannelType.SMS)
  async smsConsumer(
    @Payload() data: NotificationTaskMessageDto,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log('Consuming sms notification task');
    await this.mNotificationSendersService.sendSmsNotification(data);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    channel.ack(originalMsg);
  }
}
