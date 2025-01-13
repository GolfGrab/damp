import { ContentCopy, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Button,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDialogs, useNotifications } from "@toolpad/core";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../../api";
import useDebounce from "../../common/useDebounce";

const ApplicationInfo = () => {
  const { applicationId } = useParams();

  const theme = useTheme();
  const notifications = useNotifications();
  const dialogs = useDialogs();
  const queryClient = useQueryClient();
  const [applicationName, setApplicationName] = useState<string>("");
  const [applicationNameError, setApplicationNameError] = useState<
    string | undefined
  >("");
  const debouncedApplicationName = useDebounce(applicationName, 200);

  const [applicationDescription, setApplicationDescription] =
    useState<string>("");
  const [applicationDescriptionError, setApplicationDescriptionError] =
    useState<string | undefined>();
  const debouncedApplicationDescription = useDebounce(
    applicationDescription,
    500
  );

  const [isShowApiKey, setIsShowApiKey] = useState(false);

  const {
    data: application,
    isLoading: isApplicationLoading,
    isError: isApplicationError,
  } = useQuery({
    queryKey: [
      apiClient.ApplicationModuleApi.mApplicationControllerFindOneApplication
        .name,
      applicationId,
    ],
    queryFn: () => {
      return apiClient.ApplicationModuleApi.mApplicationControllerFindOneApplication(
        applicationId!
      ).then((res) => res.data);
    },
  });

  const { mutate: updateApplication } = useMutation({
    mutationKey: [
      apiClient.ApplicationModuleApi.mApplicationControllerUpdateApplication
        .name,
    ],
    mutationFn: () => {
      return apiClient.ApplicationModuleApi.mApplicationControllerUpdateApplication(
        applicationId!,
        {
          name: debouncedApplicationName,
          description: debouncedApplicationDescription,
        }
      ).then((res) => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          apiClient.ApplicationModuleApi
            .mApplicationControllerFindOneApplication.name,
          applicationId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          apiClient.ApplicationModuleApi
            .mApplicationControllerFindAllApplications.name,
        ],
      });
    },
  });

  const { mutate: rotateApiKey } = useMutation({
    mutationKey: [
      apiClient.ApplicationModuleApi.mApplicationControllerRotateApiKey.name,
    ],
    mutationFn: () => {
      return apiClient.ApplicationModuleApi.mApplicationControllerRotateApiKey(
        applicationId!
      ).then((res) => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          apiClient.ApplicationModuleApi
            .mApplicationControllerFindOneApplication.name,
          applicationId,
        ],
      });
      notifications.show("API key regenerated successfully", {
        severity: "success",
        autoHideDuration: 5000,
      });
    },
  });

  useEffect(() => {
    if (
      application &&
      debouncedApplicationName &&
      !applicationNameError &&
      debouncedApplicationName !== application?.name
    ) {
      updateApplication();
    }
  }, [
    debouncedApplicationName,
    applicationNameError,
    updateApplication,
    application,
  ]);

  useEffect(() => {
    if (
      application &&
      debouncedApplicationDescription &&
      !applicationDescriptionError &&
      debouncedApplicationDescription !== application?.description
    ) {
      updateApplication();
    }
  }, [
    debouncedApplicationDescription,
    applicationDescriptionError,
    updateApplication,
    application,
  ]);

  useEffect(() => {
    if (application && !applicationName && !applicationDescription) {
      setApplicationName(application.name);
      setApplicationDescription(application.description);
    }
  }, [
    application,
    applicationName,
    applicationDescription,
    setApplicationName,
    setApplicationDescription,
  ]);

  if (isApplicationLoading) {
    return <div>Loading...</div>;
  }

  if (isApplicationError) {
    return <div>Error</div>;
  }

  return (
    <Stack spacing={2}>
      <Stack spacing={1}>
        <Typography>Name</Typography>
        <TextField
          size="small"
          fullWidth
          required
          error={!!applicationNameError}
          helperText={applicationNameError}
          value={applicationName}
          onChange={(e) => {
            if (e.target.value.trim() === "") {
              setApplicationNameError("Application name is required");
            } else {
              setApplicationNameError(undefined);
            }

            setApplicationName(e.target.value);
          }}
        />
      </Stack>
      <Stack spacing={1}>
        <Typography>Description</Typography>
        <TextField
          size="small"
          fullWidth
          multiline
          required
          error={!!applicationDescriptionError}
          helperText={applicationDescriptionError}
          minRows={2}
          maxRows={4}
          value={applicationDescription}
          onChange={(e) => {
            if (e.target.value.trim() === "") {
              setApplicationDescriptionError("Description is required");
            } else {
              setApplicationDescriptionError(undefined);
            }

            setApplicationDescription(e.target.value);
          }}
        />
      </Stack>
      <Stack spacing={1}>
        <Typography>Application ID</Typography>
        <TextField
          size="small"
          fullWidth
          value={application?.id}
          disabled
          sx={{
            "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: theme.palette.text.primary,
            },
            "& .MuiInputBase-input": {
              backgroundColor: theme.palette.divider,
            },
          }}
          slotProps={{
            input: {
              endAdornment: (
                <Stack direction="row" spacing={1} marginLeft={1.5}>
                  <Tooltip title="Copy To Clipboard" arrow>
                    <IconButton
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(application?.id || "");
                        notifications.show(
                          "Application ID copied to clipboard",
                          {
                            severity: "success",
                            autoHideDuration: 2000,
                          }
                        );
                      }}
                    >
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ),
            },
          }}
        />
      </Stack>
      <Stack spacing={1}>
        <Typography>API key</Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            fullWidth
            value={application?.apiKey}
            disabled
            type={isShowApiKey ? "text" : "password"}
            sx={{
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: theme.palette.text.primary,
              },
              "& .MuiInputBase-input": {
                backgroundColor: theme.palette.divider,
              },
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <Stack direction="row" spacing={1} marginLeft={1.5}>
                    <Tooltip title="Toggle visibility" arrow>
                      <IconButton
                        size="small"
                        onClick={() => setIsShowApiKey((prev) => !prev)}
                      >
                        {isShowApiKey ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy To Clipboard" arrow>
                      <IconButton
                        size="small"
                        onClick={() => {
                          navigator.clipboard.writeText(application?.id || "");
                          notifications.show("API key copied to clipboard", {
                            severity: "success",
                            autoHideDuration: 2000,
                          });
                        }}
                      >
                        <ContentCopy />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ),
              },
            }}
          />
          <Button
            variant="outlined"
            color="error"
            onClick={async () => {
              const isConfirmed = await dialogs.confirm(
                "Are you sure you want to regenerate the API key? The old key will be invalidated.",
                {
                  okText: "Regenerate",
                  cancelText: "Cancel",
                  title: "Regenerate API key",
                }
              );
              if (!isConfirmed) return;

              rotateApiKey();
            }}
          >
            Regenerate
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ApplicationInfo;
