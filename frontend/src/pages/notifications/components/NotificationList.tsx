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
import NotificationListCard from "./NotificationListCard";
import { type NotificationPreviewContent } from "./types";

const mockGetPaginatedNotifications = ({ page }: { page: number }) => {
  const testNotifications: NotificationPreviewContent[] = [
    {
      id: "1",
      applicationName: "App1",
      message: "Message1",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "2",
      applicationName: "App2",
      message: "Message2",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "3",
      applicationName: "App3",
      message: "Message3",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "4",
      applicationName: "App4",
      message: "Message4",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "5",
      applicationName: "App5",
      message: "Message5",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "6",
      applicationName: "App6",
      message: "Message6",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "7",
      applicationName: "App7",
      message: "Message7",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "8",
      applicationName: "App8",
      message: "Message8",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "9",
      applicationName: "App9",
      message: "Message9",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "10",
      applicationName: "App10",
      message: "Message10",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "11",
      applicationName: "App11",
      message: "Message11",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "12",
      applicationName: "App12",
      message: "Message12",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "13",
      applicationName: "App13",
      message: "Message13",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "14",
      applicationName: "App14",
      message: "Message14",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "15",
      applicationName: "App15",
      message: "Message15",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "16",
      applicationName: "App16",
      message: "Message16",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "17",
      applicationName: "App17",
      message: "Message17",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "18",
      applicationName: "App18",
      message: "Message18",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "19",
      applicationName: "App19",
      message: "Message19",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "20",
      applicationName: "App20",
      message: "Message20",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "21",
      applicationName: "App21",
      message: "Message21",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "22",
      applicationName: "App22",
      message: "Message22",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "23",
      applicationName: "App23",
      message: "Message23",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "24",
      applicationName: "App24",
      message: "Message24",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "25",
      applicationName: "App25",
      message: "Message25",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "26",
      applicationName: "App26",
      message: "Message26",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "27",
      applicationName: "App27",
      message: "Message27",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "28",
      applicationName: "App28",
      message: "Message28",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "29",
      applicationName: "App29",
      message: "Message29",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
    {
      id: "30",
      applicationName: "App30",
      message: "Message30",
      createdTime: new Date(),
      image: "https://source.unsplash.com/random/300x300",
    },
  ];
  const res = {
    data: {
      notifications: testNotifications.slice((page - 1) * 10, page * 10),
    },
    meta: {
      total: testNotifications.length,
      lastPage: Math.ceil(testNotifications.length / 10),
      currentPage: page,
      perPage: 10,
      prev: page > 1 ? page - 1 : null,
      next: page < Math.ceil(testNotifications.length / 10) ? page + 1 : null,
    },
  };
  return res;
};

const groupAndSortItemsByDate = (items: NotificationPreviewContent[]) => {
  const groupedNotifications = groupBy(items || [], (notification) =>
    notification.createdTime.toDateString()
  );
  const sortedGroupedNotifications = sortBy(
    Object.entries(groupedNotifications),
    ([date]) => new Date(date).getTime(),
    function ([, notifications]) {
      return notifications;
    }
  );
  return sortedGroupedNotifications;
};

const NotificationList = () => {
  const { ref, inView } = useInView();

  const { data, error, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["projects"],
    queryFn: ({ pageParam }) =>
      mockGetPaginatedNotifications({ page: pageParam }),
    initialPageParam: 1,
    getPreviousPageParam: (firstPage) => firstPage.meta.prev,
    getNextPageParam: (lastPage) => lastPage.meta.next,
  });

  // Assume bff send notifications in date descending order
  const groupedAndSortedNotifications = groupAndSortItemsByDate(
    data?.pages.flatMap((page) => page.data.notifications) ?? []
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
        {groupedAndSortedNotifications.map(([date, notifications]) => (
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
        ))}
      </List>
      <Grid2
        container
        ref={ref}
        direction="column"
        alignItems="center"
        justifyContent="center"
        margin={2}
      >
        {isFetchingNextPage ? (
          <CircularProgress />
        ) : (
          <Typography variant="body1">You have seen it all!</Typography>
        )}
      </Grid2>
    </>
  );
};

export default NotificationList;
