import {
  CircularProgress,
  Divider,
  Grid2,
  List,
  ListSubheader,
  Typography,
} from "@mui/material";
import { useInfiniteQuery } from "@tanstack/react-query";
import { groupBy, sortBy } from "lodash";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { apiClient } from "../../../api";
import {
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
        id: notification.id.toString(),
        applicationName: notification.applicationId,
        message:
          notification.compiledMessages.find(
            (message) =>
              message.messageType ===
              MNotificationControllerPreviewTemplateMessageTypeEnum.Html
          )?.compiledMessage ?? "",
        createdAt: new Date(notification.createdAt),
        image: notification.applicationId,
        title:
          notification.compiledMessages
            .find(
              (message) =>
                message.messageType ===
                MNotificationControllerPreviewTemplateMessageTypeEnum.Text
            )
            ?.compiledMessage.split("\n", 1)[0] ?? "",
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

const useNotificationsInfiniteQuery = () =>
  useInfiniteQuery({
    queryKey: ["projects"],
    queryFn: ({ pageParam }) =>
      apiClient.NotificationModuleApi.mNotificationControllerGetPaginatedNotificationsByUserId(
        "test",
        pageParam,
        10
      ),
    initialPageParam: 1,
    getPreviousPageParam: (firstPage) => firstPage.data.meta?.prev,
    getNextPageParam: (lastPage) => lastPage.data.meta?.next,
  });

const NotificationList = () => {
  const { ref, inView } = useInView();

  const { data, error, isFetchingNextPage, fetchNextPage, isLoading } =
    useNotificationsInfiniteQuery();

  console.log(data);

  // Assume bff send notifications in date descending order
  const groupedAndSortedNotifications = groupSortAndTransformNotifications(
    data?.pages.flatMap((page) => page.data.data ?? []) ?? []
  );

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  if (error) {
    return (
      <Typography>Something went wrong, please try again later.</Typography>
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
        subheader={<li />}
      >
        {groupedAndSortedNotifications.map(([date, notifications]) => {
          return (
            <>
              <li key={`section-${date}`}>
                <ul>
                  <ListSubheader>{date}</ListSubheader>
                  {notifications.map((notification, ind) => (
                    <>
                      <NotificationListCard
                        content={notification}
                        key={notification.id}
                      />
                      {ind !== notifications.length - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </>
                  ))}
                </ul>
              </li>
            </>
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
