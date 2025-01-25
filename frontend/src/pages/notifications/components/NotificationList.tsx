import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  Grid2,
  List,
  ListSubheader,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useInfiniteQuery } from "@tanstack/react-query";
import { groupBy, sortBy } from "lodash";
import { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../api";
import {
  AccountChannelTypeEnum,
  MNotificationControllerPreviewTemplateMessageTypeEnum,
  PaginatedResponseOfOutputNotificationWithCompiledMessageAndNotificationTaskDto,
} from "../../../api/generated";
import NotificationListCard from "./NotificationListCard";
import { NotificationPreviewContent } from "./types";

const groupSortAndTransformNotifications = (
  items: PaginatedResponseOfOutputNotificationWithCompiledMessageAndNotificationTaskDto["data"]
) => {
  // Transform the data to the format that NotificationListCard expects
  const notificationPreviewContents = items?.map(
    (notification) =>
      ({
        id: notification.id,
        applicationName: notification.application.name ?? "",
        message:
          notification.compiledMessages.find(
            (message) =>
              message.messageType ===
              MNotificationControllerPreviewTemplateMessageTypeEnum.Html
          )?.compiledMessage ?? "",
        createdAt: new Date(notification.createdAt),
        image: notification.application.name,
        title:
          notification.compiledMessages
            .find(
              (message) =>
                message.messageType ===
                MNotificationControllerPreviewTemplateMessageTypeEnum.Text
            )
            ?.compiledMessage.split("\n", 1)[0] ?? "",
        notificationCategoryName: notification.notificationCategory.name,
        channelTypes: notification.notificationTasks.map(
          (task) => task.channelType as AccountChannelTypeEnum
        ),
      }) satisfies NotificationPreviewContent
  );
  // Group the notifications by date
  const groupedNotifications = groupBy(
    notificationPreviewContents,
    (notification) => new Date(notification.createdAt).toDateString()
  );
  // Sort the notifications by date and time
  const sortedGroupedNotifications = sortBy(
    Object.entries(groupedNotifications),
    ([date]) => new Date(date).getTime(),
    function ([, notifications]) {
      return notifications;
    }
  );
  return sortedGroupedNotifications;
};

const useNotificationsInfiniteQuery = (userId: string) =>
  useInfiniteQuery({
    queryKey: ["notifications", userId],
    queryFn: ({ pageParam }) =>
      apiClient.NotificationModuleApi.mNotificationControllerGetPaginatedNotificationsByUserId(
        userId,
        pageParam,
        10
      ),
    initialPageParam: 1,
    getPreviousPageParam: (firstPage) => firstPage.data.meta?.prev,
    getNextPageParam: (lastPage) => lastPage.data.meta?.next,
  });

const NotificationList = () => {
  const { ref, inView } = useInView();
  const auth = useAuth();
  const navigate = useNavigate();

  const {
    data,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    refetch,
  } = useNotificationsInfiniteQuery(auth.user?.profile.email ?? "");

  // Assume bff send notifications in date descending order
  const groupedAndSortedNotifications = groupSortAndTransformNotifications(
    data?.pages.flatMap((page) => page.data.data ?? []) ?? []
  );

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  if (isError) {
    return (
      <Stack spacing={4} width="100%">
        <Alert severity="error">Error loading notifications</Alert>
        <Stack spacing={2}>
          <Button variant="contained" onClick={() => refetch()}>
            Try Again
          </Button>
          <Button variant="outlined" onClick={() => navigate(0)}>
            Refresh This Page
          </Button>
        </Stack>
      </Stack>
    );
  }
  if (isLoading) {
    return (
      <Stack spacing={4} width="100%">
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
      </Stack>
    );
  }
  return (
    <>
      <List
        sx={{
          width: "100%",
          bgcolor: "background.paper",
          "& ul": { padding: 0, listStyleType: "none" },
        }}
      >
        {groupedAndSortedNotifications.map(([date, notifications]) => {
          return (
            <Fragment key={`section-${date}`}>
              <ListSubheader>{date}</ListSubheader>
              {notifications.map((notification, ind) => (
                <Fragment key={`notification.id-${notification.id}`}>
                  <NotificationListCard content={notification} />
                  {ind !== notifications.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </Fragment>
              ))}
            </Fragment>
          );
        })}
      </List>
      <Divider
        variant="inset"
        component="li"
        sx={{ padding: 0, margin: 0, listStyleType: "none" }}
      />
      <Grid2
        container
        ref={ref}
        direction="column"
        alignItems="center"
        justifyContent="center"
        margin={2}
      >
        {isLoading || isFetchingNextPage ? (
          <CircularProgress />
        ) : (
          <Typography variant="body1">You have seen it all!</Typography>
        )}
      </Grid2>
    </>
  );
};

export default NotificationList;
