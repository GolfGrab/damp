import { Add, Search } from "@mui/icons-material";
import { Alert, Button, Stack, TextField } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { useDialogs } from "@toolpad/core";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../api";
import { NotificationCategory } from "../../api/generated";
import CreateNotificationCategoryDialog from "./CreateNotificationCategoryDialog";
import UpdateNotificationCategoryDialog from "./UpdateNotificationCategoryDialog";

const ApplicationNotificationCategories = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const dialogs = useDialogs();

  const {
    data: notificationCategories,
    isLoading: isNotificationCategoriesLoading,
    isError: isNotificationCategoriesError,
    refetch: refetchNotificationCategories,
  } = useQuery({
    queryKey: [
      apiClient.ApplicationModuleApi
        .mApplicationControllerFindAllNotificationCategoriesByApplicationId
        .name,
      applicationId!,
    ],
    queryFn: () => {
      return apiClient.ApplicationModuleApi.mApplicationControllerFindAllNotificationCategoriesByApplicationId(
        applicationId!
      ).then((res) => res.data);
    },
  });
  const [search, setSearch] = useState("");

  const filteredNotificationCategories = notificationCategories?.filter(
    (notificationCategory) =>
      (notificationCategory.id + notificationCategory.name)
        .toLowerCase()
        .includes(search.toLowerCase().trim())
  );

  const columns: GridColDef<NotificationCategory>[] = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "createdByUserId", headerName: "Created by", flex: 1 },
    { field: "updatedByUserId", headerName: "Last updated by", flex: 1 },
    {
      field: "updatedAt",
      headerName: "Last updated",
      valueFormatter: (value) => dayjs(value).fromNow(),
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 2,
      sortable: false,

      renderCell: ({
        row: { id: notificationCategoryId, name: oldNotificationCategoryName },
      }) => (
        <Stack direction="row" spacing={1} alignItems="center" height="100%">
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={() =>
              dialogs.open<
                {
                  notificationCategoryId: string;
                  oldNotificationCategoryName: string;
                },
                undefined
              >(UpdateNotificationCategoryDialog, {
                notificationCategoryId,
                oldNotificationCategoryName,
              })
            }
          >
            Edit
          </Button>
        </Stack>
      ),
    },
  ];

  if (isNotificationCategoriesError) {
    return (
      <Stack spacing={4} width="100%">
        <Alert severity="error">Error loading notification categories</Alert>
        <Stack spacing={2}>
          <Button
            variant="contained"
            onClick={() => refetchNotificationCategories()}
          >
            Try Again
          </Button>
          <Button variant="outlined" onClick={() => navigate(0)}>
            Refresh This Page
          </Button>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between">
        {/* search */}
        <TextField
          placeholder="Search"
          variant="outlined"
          size="small"
          slotProps={{
            input: {
              startAdornment: <Search />,
            },
          }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* create new application */}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() =>
            dialogs.open(CreateNotificationCategoryDialog, {
              applicationId: applicationId!,
            })
          }
        >
          New notification category
        </Button>
      </Stack>
      {/* table */}
      <DataGrid
        rows={filteredNotificationCategories}
        columns={columns}
        disableColumnMenu
        pageSizeOptions={[5, 10, 20, 50, 100]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        loading={isNotificationCategoriesLoading}
      />
    </Stack>
  );
};

export default ApplicationNotificationCategories;
