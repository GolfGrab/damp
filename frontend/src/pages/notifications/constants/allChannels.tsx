import { Email, Sms, SvgIconComponent } from "@mui/icons-material";
import { SvgIcon } from "@mui/material";
import { AccountChannelTypeEnum } from "../../../api/generated";
import SlackLogo from "../components/SlackLogo.svg";

export const allChannels = {
  [AccountChannelTypeEnum.Email]: {
    channelType: AccountChannelTypeEnum.Email,
    displayName: "Email",
    icon: Email,
  },
  [AccountChannelTypeEnum.Sms]: {
    channelType: AccountChannelTypeEnum.Sms,
    displayName: "SMS",
    icon: Sms,
  },
  [AccountChannelTypeEnum.Slack]: {
    channelType: AccountChannelTypeEnum.Slack,
    displayName: "Slack",
    icon: (props: {
      color?: React.ComponentProps<SvgIconComponent>["color"];
    }) => <SvgIcon component={SlackLogo} inheritViewBox {...props} />,
  },
} as const satisfies Record<
  string,
  {
    channelType: AccountChannelTypeEnum;
    displayName: string;
    icon: React.FC<{
      color?: React.ComponentProps<SvgIconComponent>["color"];
    }>;
  }
>;
