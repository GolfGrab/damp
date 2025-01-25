import { Email, Sms } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Button,
  Chip,
  Skeleton,
  Stack,
  styled,
  SvgIcon,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import React from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../api";
import {
  AccountChannelTypeEnum,
  MNotificationControllerPreviewTemplateMessageTypeEnum,
} from "../../api/generated";
import NotificationCenterGenericLayout from "../../layout/NotificationCenterGenericLayout";
import SlackLogo from "./components/SlackLogo.svg";

const useNotificationQuery = (userId: string, notificationId: number) =>
  useQuery({
    queryKey: ["notification", userId, notificationId],
    queryFn: () =>
      apiClient.NotificationModuleApi.mNotificationControllerGetNotificationsForUserById(
        userId,
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
  const auth = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useNotificationQuery(
    auth.user?.profile.email ?? "",
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
        <Stack spacing={4} width="100%">
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
        </Stack>
      </Layout>
    );
  }
  if (isError) {
    return (
      <Layout>
        <Stack spacing={4} width="100%">
          <Alert severity="error">Error loading notification</Alert>
          <Stack spacing={2}>
            <Button variant="contained" onClick={() => refetch()}>
              Try Again
            </Button>
            <Button variant="outlined" onClick={() => navigate(0)}>
              Refresh This Page
            </Button>
          </Stack>
        </Stack>
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
