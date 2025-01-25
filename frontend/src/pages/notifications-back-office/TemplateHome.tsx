import { Search } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { DialogProps, useDialogs, useNotifications } from "@toolpad/core";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    queryKey: [
      apiClient.NotificationModuleApi
        .mNotificationControllerFindAllTemplatesPaginated.name,
      paginationOption,
      search,
    ],
    queryFn: () => {
      console.log("paginationOption", paginationOption, search);
      return apiClient.NotificationModuleApi.mNotificationControllerFindAllTemplatesPaginated(
        paginationOption.page + 1,
        paginationOption.perPage,
        search.templateName
      );
    },
    placeholderData: keepPreviousData,
  });

const useDeleteTemplateMutation = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  return useMutation({
    mutationFn: (templateId: string) =>
      apiClient.NotificationModuleApi.mNotificationControllerDeleteTemplate(
        templateId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          apiClient.NotificationModuleApi
            .mNotificationControllerFindAllTemplatesPaginated.name,
        ],
      });
    },
    onError: () => {
      notifications.show("Error deleting template, please try again", {
        severity: "error",
        autoHideDuration: 5000,
      });
    },
  });
};

const useCreateTemplateMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const notifications = useNotifications();
  return useMutation({
    mutationFn: (templateName: string) =>
      apiClient.NotificationModuleApi.mNotificationControllerCreateTemplate({
        name: templateName,
        template: {
          type: "doc",
          content: [],
        },
      }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({
        queryKey: [
          apiClient.NotificationModuleApi
            .mNotificationControllerFindAllTemplatesPaginated.name,
        ],
      });
      navigate("/notifications-back-office/templates/" + data.id);
    },
    onError: () => {
      notifications.show("Error creating template, please try again", {
        severity: "error",
        autoHideDuration: 5000,
      });
    },
  });
};

// TODO move to a separate file
function TemplateCreationDialog({
  open,
  onClose,
}: DialogProps<undefined, string | null>) {
  const [isOpen, setIsOpen] = useState(open);
  const [templateName, setTemplateName] = useState<string>();
  const [isTemplateNameError, setIsTemplateNameError] = useState(false);
  const [helperText, setHelperText] = useState("");
  const { mutate: createTemplate, isPending } = useCreateTemplateMutation();
  const handleOk = async (value: string | undefined) => {
    if (!value) {
      setIsTemplateNameError(true);
      setHelperText("Template name is required");
    } else {
      createTemplate(value, {
        onSettled: () => {
          setIsOpen(false);
        },
      });
    }
  };
  return (
    <Dialog fullWidth open={isOpen} onClose={() => onClose(null)}>
      <DialogTitle>Create New Template</DialogTitle>
      <DialogContent>
        <TextField
          label="Template Name"
          fullWidth
          value={templateName}
          margin="normal"
          onChange={(event) => setTemplateName(event.currentTarget.value)}
          error={isTemplateNameError}
          helperText={helperText}
        />
      </DialogContent>
      <DialogActions>
        <LoadingButton
          loading={isPending}
          onClick={() => handleOk(templateName)}
        >
          Ok
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

const TemplateHome = () => {
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  });
  const [templateNameSearch, setTemplateNameSearch] = useState<string>("");
  const dialogs = useDialogs();
  const { mutate: deleteTemplate } = useDeleteTemplateMutation();

  const columns: GridColDef[] = [
    { field: "id", headerName: "Template ID", flex: 3 },
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
      field: "",
      headerName: "Actions",
      description: "This column has a value getter and is not sortable.",
      renderCell: ({ row }) => (
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-start"
          alignItems="center"
          height="100%"
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              navigate(`/notifications-back-office/templates/${row.id}`);
            }}
          >
            Info
          </Button>
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
                await deleteTemplate(row.id);
              }
            }}
          >
            Delete
          </Button>
        </Stack>
      ),
      width: 150,
    },
  ];

  const { data, isFetching, isError, refetch } = useTemplatePaginationQuery(
    { page: paginationModel.page, perPage: paginationModel.pageSize },
    { templateName: templateNameSearch }
  );

  const navigate = useNavigate();

  if (isError) {
    return (
      <Stack spacing={4} width="100%">
        <Alert severity="error">Error loading templates</Alert>
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
  return (
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
        pageSizeOptions={[5, 10, 20, 50, 100]}
        disableColumnMenu
        paginationMode="server"
        rowCount={data?.data.meta?.total}
        disableColumnSorting
        onRowDoubleClick={(row) => {
          navigate(`/notifications-back-office/templates/${row.id}`);
        }}
      />
    </Stack>
  );
};
export default TemplateHome;
