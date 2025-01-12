import { Search } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DialogProps, useDialogs } from "@toolpad/core";
import dayjs from "dayjs";
import { useState } from "react";
import { apiClient } from "../../api";

const useTemplatePaginationQuery = (
  paginationOption: {
    page: number;
    perPage: number;
  },
  search: {
    templateName: string;
  }
) =>
  useQuery({
    queryKey: ["template", paginationOption, search],
    queryFn: () => {
      console.log("paginationOption", paginationOption, search);
      return apiClient.NotificationModuleApi.mNotificationControllerFindAllTemplatesPaginated(
        paginationOption.page,
        paginationOption.perPage,
        search.templateName
      );
    },
    placeholderData: keepPreviousData,
  });

// const useCreateTemplateMutation = () =>
//   useMutation({
//     mutationFn: (templateName: string) =>
//       apiClient.NotificationModuleApi.mNotificationControllerCreateTemplate({
//         name: templateName,
//       }),
//   });

function TemplateCreationDialog({
  open,
  onClose,
}: DialogProps<undefined, string | null>) {
  const [result, setResult] = useState<string>();
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState("");
  const handleOk = (value: string | undefined) => {
    if (!value) {
      setError(true);
      setHelperText("Template name is required");
    } else {
      onClose(value);
    }
  };
  return (
    <Dialog fullWidth open={open} onClose={() => onClose(null)}>
      <DialogTitle>Create New Template</DialogTitle>
      <DialogContent>
        <TextField
          label="Template Name"
          fullWidth
          value={result}
          margin="normal"
          onChange={(event) => setResult(event.currentTarget.value)}
          error={error}
          helperText={helperText}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleOk(result)}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}

const TemplateHome = () => {
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 1,
  });
  const [templateNameSearch, setTemplateNameSearch] = useState<string>("");
  const dialogs = useDialogs();

  const columns: GridColDef[] = [
    { field: "name", headerName: "Template Name", flex: 3 },
    { field: "createdByUserId", headerName: "Created by", flex: 1 },
    {
      field: "updatedByUserId",
      headerName: "Last updated by",
      flex: 1,
    },
    {
      field: "updatedAt",
      headerName: "Last updated",
      renderCell: ({ value }) => dayjs(value).fromNow(),
      flex: 1,
    },
    {
      field: "id",
      headerName: "Actions",
      description: "This column has a value getter and is not sortable.",
      renderCell: ({ row }) => (
        <>
          <Button
            variant="outlined"
            color="error"
            onClick={async () => {
              const confirmed = await dialogs.confirm(
                `Are you sure you want to delete template ${row.name}?`,
                {
                  severity: "error",
                  okText: "delete",
                  cancelText: "cancel",
                }
              );
              if (confirmed) {
                await dialogs.alert("Then let's do it!");
              }
            }}
          >
            Delete
          </Button>
        </>
      ),
      flex: 1,
    },
  ];

  const { data, isFetching } = useTemplatePaginationQuery(
    { page: paginationModel.page, perPage: paginationModel.pageSize },
    { templateName: templateNameSearch }
  );
  return (
    // id, Template name, owner, last edit, last edit by, Actions(delete, edit)
    // Search by name
    // (Optional) Sort by name, last edit
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between">
        {/* search */}
        <TextField
          placeholder="Search for applications"
          variant="outlined"
          size="small"
          onChange={(e) => setTemplateNameSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <Search />,
            },
          }}
        />
        {/* create new application */}
        <Button
          variant="contained"
          endIcon={<AddIcon />}
          onClick={async () => {
            await dialogs.open(TemplateCreationDialog);
          }}
        >
          New
        </Button>
      </Stack>
      <DataGrid
        rows={data?.data.data}
        loading={isFetching}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10]}
        disableColumnMenu
        disableColumnSorting
        onRowDoubleClick={(row) => {
          alert(row.row.id);
        }}
        sx={{ border: 0 }}
      />
    </Stack>
  );
};
export default TemplateHome;
