import { Add } from "@mui/icons-material";
import { Alert, Button, Stack, TextField } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { useDialogs } from "@toolpad/core";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api";
import { User } from "../../api/generated";
import ImportUsersDialog from "./components/ImportUsersDialog";

const CustomToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarColumnsButton />
    <GridToolbarDensitySelector />
  </GridToolbarContainer>
);

const Users = () => {
  const dialogs = useDialogs();
  const navigate = useNavigate();

  // State for pagination and sorting
  const [page, setPage] = useState(0); // 0-based index for DataGrid
  const [pageSize, setPageSize] = useState(5);
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: "createdAt",
      sort: "desc",
    },
  ]);

  // State for search
  const [search, setSearch] = useState("");

  const {
    data: users,
    isLoading: isUsersLoading,
    isError: isUsersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: [
      apiClient.UserModuleApi.mUserControllerFindAllUsers.name,
      { page, pageSize, sortModel, search },
    ],
    queryFn: async () => {
      const sort = sortModel[0] || {};
      const response =
        await apiClient.UserModuleApi.mUserControllerFindAllUsers(
          page + 1,
          pageSize,
          sort.field as keyof User,
          sort.sort ?? undefined,
          search
        );
      return response.data;
    },
  });

  if (isUsersError) {
    return (
      <Stack spacing={4} width="100%">
        <Alert severity="error">Error loading users</Alert>
        <Stack spacing={2}>
          <Button variant="contained" onClick={() => refetchUsers()}>
            Try Again
          </Button>
          <Button variant="outlined" onClick={() => navigate(0)}>
            Refresh This Page
          </Button>
        </Stack>
      </Stack>
    );
  }

  const columns: GridColDef<User>[] = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "createdByUserId", headerName: "Created by", flex: 1 },
    {
      field: "createdAt",
      headerName: "Created At",
      valueFormatter: (value) => dayjs(value).fromNow(),
      flex: 1,
    },
    { field: "updatedByUserId", headerName: "Last updated by", flex: 1 },
    {
      field: "updatedAt",
      headerName: "Last updated",
      valueFormatter: (value) => dayjs(value).fromNow(),
      flex: 1,
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between">
        {/* search */}
        <TextField
          placeholder="Search for users"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* import users */}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => dialogs.open(ImportUsersDialog)}
        >
          Import Users
        </Button>
      </Stack>
      {/* table */}
      <DataGrid
        rows={users?.data || []}
        columns={columns}
        disableColumnMenu
        loading={isUsersLoading}
        paginationMode="server" // Enable server-side pagination
        sortingMode="server" // Enable server-side sorting
        rowCount={users?.meta?.total ?? -1} // Total rows from server
        pageSizeOptions={[5, 10, 20, 50, 100]}
        sortModel={sortModel}
        onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={({ page, pageSize }) => {
          setPage(page);
          setPageSize(pageSize);
        }}
        slots={{
          toolbar: CustomToolbar,
        }}
      />
    </Stack>
  );
};

export default Users;
