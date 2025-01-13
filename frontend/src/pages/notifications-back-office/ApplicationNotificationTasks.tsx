import { Chip } from "@mui/material";
import {
  DataGrid,
  GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query"; // Ensure you have react-query installed
import { useState } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../../api";
import {
  NotificationTask,
  NotificationTaskPriorityEnum,
  NotificationTaskSentStatusEnum,
} from "../../api/generated";
import { allChannels } from "../notifications/constants/allChannels";

const CustomToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarColumnsButton />
    <GridToolbarDensitySelector />
  </GridToolbarContainer>
);

const ServerSideGridWithReactQuery = () => {
  const { applicationId } = useParams();
  // State for pagination and sorting
  const [page, setPage] = useState(0); // 0-based index for DataGrid
  const [pageSize, setPageSize] = useState(5);
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: "createdAt",
      sort: "desc",
    },
  ]);

  // Query to fetch data
  const {
    data: notificationTasks,
    isLoading: isNotificationTasksLoading,
    isError: isNotificationTasksError,
  } = useQuery({
    queryKey: [
      apiClient.NotificationModuleApi
        .mNotificationControllerFindAllNotificationTasksByApplicationIdPaginated
        .name,
      applicationId!,
      { page, pageSize, sortModel },
    ],
    queryFn: async () => {
      // Extract sorting details
      const sort = sortModel[0] || {};
      const response =
        await apiClient.NotificationModuleApi.mNotificationControllerFindAllNotificationTasksByApplicationIdPaginated(
          applicationId!,
          page + 1,
          pageSize,
          sort.field as keyof NotificationTask,
          sort.sort ?? undefined
        );
      return response.data;
    },
  });

  if (isNotificationTasksError) {
    return <div>Error</div>;
  }

  return (
    <DataGrid
      getRowId={(row) =>
        `${row.channelType}-${row.userId}-${row.notificationId}-${row.templateId}-${row.messageType}`
      }
      slots={{
        toolbar: CustomToolbar,
      }}
      rows={notificationTasks?.data}
      columns={[
        {
          field: "channelType",
          headerName: "Channel Type",
          width: 150,
          renderCell: ({ value }) => {
            const channel = Object.values(allChannels).find(
              (channel) => channel.channelType === value
            );

            if (channel) {
              return (
                <Chip label={channel.displayName} icon={<channel.icon />} />
              );
            }
            return <Chip label={value} />;
          },
        },
        { field: "userId", headerName: "User ID", width: 150 },
        {
          field: "notificationId",
          headerName: "Notification ID",
          width: 150,
        },
        { field: "templateId", headerName: "Template ID", width: 150 },
        { field: "messageType", headerName: "Message Type", width: 150 },
        {
          field: "priority",
          headerName: "Priority",
          width: 150,
          renderCell: ({ value }) => {
            switch (value) {
              case NotificationTaskPriorityEnum.Low:
                return <Chip label="Low" color="default" />;
              case NotificationTaskPriorityEnum.Medium:
                return <Chip label="Medium" color="warning" />;
              case NotificationTaskPriorityEnum.High:
                return <Chip label="High" color="error" />;
              default:
                return value;
            }
          },
        },
        { field: "createdAt", headerName: "Created At", width: 150 },
        { field: "updatedAt", headerName: "Updated At", width: 150 },
        {
          field: "sentStatus",
          headerName: "Sent Status",
          width: 150,

          renderCell: ({ value }) => {
            switch (value) {
              case NotificationTaskSentStatusEnum.Sent:
                return <Chip label="Sent" color="success" />;
              case NotificationTaskSentStatusEnum.Failed:
                return <Chip label="Failed" color="error" />;
              case NotificationTaskSentStatusEnum.Pending:
                return <Chip label="Pending" color="warning" />;
              default:
                return value;
            }
          },
        },
        { field: "sentTimestamp", headerName: "Sent Timestamp", width: 150 },
        {
          field: "failedTimestamp",
          headerName: "Failed Timestamp",
          width: 150,
        },
        { field: "retryCount", headerName: "Retry Count", width: 150 },
        { field: "retryLimit", headerName: "Retry Limit", width: 150 },
      ]}
      disableColumnMenu
      loading={isNotificationTasksLoading}
      paginationMode="server" // Enable server-side pagination
      sortingMode="server" // Enable server-side sorting
      rowCount={notificationTasks?.meta?.total ?? -1} // Total rows from server
      pageSizeOptions={[5, 10, 20, 50, 100]}
      sortModel={sortModel}
      onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
      paginationModel={{ page, pageSize }}
      onPaginationModelChange={({ page, pageSize }) => {
        setPage(page);
        setPageSize(pageSize);
      }}
    />
  );
};

export default ServerSideGridWithReactQuery;
