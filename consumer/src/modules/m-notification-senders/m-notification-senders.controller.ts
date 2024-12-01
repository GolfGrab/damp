import { RateLimitInterceptor } from '@/utils/rate-limitter/rate-limit.interceptor';
import { Controller, Logger, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
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
      quota: 1,
      timeWindowMs: 5000,
    }),
  )
  @MessagePattern($Enums.ChannelType.EMAIL)
  async emailConsumer(
    @Payload()
    data: NotificationTaskMessageDto,
  ) {
    this.logger.warn('Received email task:', data);
    await this.mNotificationSendersService.sendEmailNotification(data);
  }

  // @UseInterceptors(
  //   new RateLimitInterceptor($Enums.ChannelType.SMS, {
  //     quota: 3,
  //     timeWindowMs: 5000,
  //   }),
  // )
  // @MessagePattern($Enums.ChannelType.SMS)
  // async smsConsumer(
  //   @Payload()
  //   data: NotificationTaskMessageDto,
  // ) {
  //   console.log('Received sms task:', data);
  //   await this.mNotificationSendersService.sendSmsNotification(data);
  // }
}
