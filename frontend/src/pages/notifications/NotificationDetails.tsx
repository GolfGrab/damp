import { Email, Sms } from "@mui/icons-material";
import {
  Avatar,
  Chip,
  CircularProgress,
  Stack,
  styled,
  SvgIcon,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import React from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../../api";
import {
  AccountChannelTypeEnum,
  MNotificationControllerPreviewTemplateMessageTypeEnum,
} from "../../api/generated";
import NotificationCenterGenericLayout from "../../layout/NotificationCenterGenericLayout";
import SlackLogo from "./components/SlackLogo.svg";

const useNotificationQuery = (notificationId: number) =>
  useQuery({
    queryKey: ["notification", notificationId],
    queryFn: () =>
      apiClient.NotificationModuleApi.mNotificationControllerGetNotificationsForUserById(
        "test",
        notificationId
      ),
  });

const Layout = ({ children }: React.PropsWithChildren) => {
  return (
    <NotificationCenterGenericLayout
      title="Notification Details"
      parentPath="/notifications"
    >
      <Stack
        gap={3}
        alignContent="center"
        justifyContent="center"
        alignItems="center"
      >
        {children}
      </Stack>
    </NotificationCenterGenericLayout>
  );
};

const NotificationDetails = () => {
  const { notificationId } = useParams();
  const { data, isLoading, isError } = useNotificationQuery(
    Number(notificationId)
  );
  const notificationDetails = {
    id: data?.data.id,
    applicationName: data?.data.application.name ?? "",
    message:
      data?.data.compiledMessages.find(
        (message) =>
          message.messageType ===
          MNotificationControllerPreviewTemplateMessageTypeEnum.Html
      )?.compiledMessage ?? "",
    createdAt: data?.data.createdAt
      ? new Date(data?.data.createdAt)
      : undefined,
    image: data?.data.application.name,
    title:
      data?.data.compiledMessages
        .find(
          (message) =>
            message.messageType ===
            MNotificationControllerPreviewTemplateMessageTypeEnum.Text
        )
        ?.compiledMessage.split("\n", 1)[0] ?? "",
    notificationCategoryName: data?.data.notificationCategory.name,
    channelTypes: data?.data.notificationTasks
      .map((task) => task.channelType as AccountChannelTypeEnum)
      .sort(),
  };
  console.log(data);
  console.log(notificationDetails);
  if (isLoading) {
    return (
      <Layout>
        <CircularProgress />
      </Layout>
    );
  }
  if (isError) {
    return (
      <Layout>
        <Typography variant="h6">Something went wrong</Typography>
      </Layout>
    );
  }
  return (
    <Layout>
      <Avatar
        alt={notificationDetails.applicationName + " icon"}
        src={notificationDetails.image}
        sx={{ width: 64, height: 64 }}
      />
      <Stack width="100%" alignItems="center" gap={1}>
        <Typography variant="h6">{notificationDetails.title}</Typography>
        <Typography
          component="span"
          variant="body2"
          sx={{ color: "text.primary" }}
          display="inline"
          noWrap
          width="100%"
          textAlign="center"
        >
          {notificationDetails.applicationName +
            " — " +
            (notificationDetails.createdAt
              ? dayjs(notificationDetails.createdAt).fromNow()
              : "")}
        </Typography>
        <Typography variant="caption" color="primary">
          # {notificationDetails.notificationCategoryName}
        </Typography>
      </Stack>
      <Stack direction="row" gap={1}>
        {notificationDetails.channelTypes?.map((channelType) => (
          <Chip
            key={channelType}
            variant="outlined"
            label={channelType}
            icon={
              {
                [AccountChannelTypeEnum.Email]: <Email />,
                [AccountChannelTypeEnum.Sms]: <Sms />,
                [AccountChannelTypeEnum.Slack]: (
                  <SvgIcon component={SlackLogo} inheritViewBox />
                ),
              }[channelType]
            }
          />
        ))}
      </Stack>
      <NotificationMessageContainer
        dangerouslySetInnerHTML={{
          __html: notificationDetails.message,
        }}
      />
    </Layout>
  );
};

const NotificationMessageContainer = styled("div")({
  width: "100%",
  textAlign: "center",
  "& *": {
    overflowWrap: "break-word",
    whiteSpace: "normal",
  },
});

export default NotificationDetails;
