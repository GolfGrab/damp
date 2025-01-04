import { Container, Pagination } from "@mui/material";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useClient } from "../../common/useClient";
import NotificationList from "./components/NotificationList";
import { NotificationPreviewContent } from "./components/types";

const NotificationsHome = () => {
  const { isClientLoaded } = useClient();
  const [page, setPage] = useState(1);

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
    return {
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
  };

  const { data, isLoading } = useQuery({
    queryKey: ["projects", page],
    queryFn: () =>
      mockGetPaginatedNotifications({
        page: page,
      }),
    placeholderData: keepPreviousData,
  });

  if (!isClientLoaded) return null;
  return (
    <Container maxWidth="xs">
      {!isLoading && (
        <>
          <NotificationList notifications={data?.data.notifications ?? []} />
          <Pagination
            count={data?.meta.lastPage ?? 1}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
          />
        </>
      )}
    </Container>
  );
};

export default NotificationsHome;
