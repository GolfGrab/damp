import { Add, Search } from "@mui/icons-material";
import { Button, Stack, TextField } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { useDialogs } from "@toolpad/core";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api";
import { Application } from "../../api/generated";
import CreateApplicationDialog from "./CreateApplicationDialog";

const Applications = () => {
  const dialogs = useDialogs();
  const navigate = useNavigate();

  const {
    data: applications,
    isLoading: isApplicationsLoading,
    isError: isApplicationsError,
  } = useQuery({
    queryKey: [
      apiClient.ApplicationModuleApi.mApplicationControllerFindAllApplications,
    ],
    queryFn: () => {
      return apiClient.ApplicationModuleApi.mApplicationControllerFindAllApplications().then(
        (res) => res.data
      );
    },
  });

  const [search, setSearch] = useState("");
  const filteredApplications = applications?.filter((app) =>
    (app.name.toLowerCase() + app.description.toLowerCase()).includes(
      search.toLowerCase().trim()
    )
  );

  if (isApplicationsLoading) {
    return <div>Loading...</div>;
  }

  if (isApplicationsError) {
    return <div>Error</div>;
  }

  const columns: GridColDef<Application>[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1.5 },
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

      renderCell: ({ row: { id: applicationId } }) => (
        <Stack direction="row" spacing={1} alignItems="center" height="100%">
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={() =>
              navigate(
                `/notifications-back-office/applications/${applicationId}/info`
              )
            }
          >
            Info
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between">
        {/* search */}
        <TextField
          placeholder="Search for applications"
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
          onClick={() => dialogs.open(CreateApplicationDialog)}
        >
          New application
        </Button>
      </Stack>
      {/* table */}
      <DataGrid
        rows={filteredApplications}
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
        onRowDoubleClick={(row) => {
          navigate(`/notifications-back-office/applications/${row.id}/info`);
        }}
      />
    </Stack>
  );
};

export default Applications;
