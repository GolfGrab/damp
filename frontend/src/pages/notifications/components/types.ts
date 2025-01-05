import { AccountChannelTypeEnum } from "../../../api/generated";

export type NotificationPreviewContent = {
  id: number;
  applicationName: string;
  title: string;
  message: string;
  notificationCategoryName: string;
  createdAt: Date;
  image?: string;
  channelTypes: AccountChannelTypeEnum[];
};
