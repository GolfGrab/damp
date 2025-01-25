import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DialogComponent, useNotifications } from "@toolpad/core";
import { useState } from "react";
import { apiClient } from "../../api";

const CreateApplicationDialog: DialogComponent<undefined, undefined> = ({
  open,
  onClose,
}) => {
  const notifications = useNotifications();
  const [applicationName, setApplicationName] = useState("");
  const [applicationNameError, setApplicationNameError] = useState<
    string | undefined
  >();
  const [applicationDescription, setApplicationDescription] = useState("");
  const [applicationDescriptionError, setApplicationDescriptionError] =
    useState<string | undefined>();

  const queryClient = useQueryClient();

  const { mutate: createApplication, isPending: isCreatingApplication } =
    useMutation({
      mutationKey: [
        apiClient.ApplicationModuleApi.mApplicationControllerCreateApplication
          .name,
      ],
      mutationFn: () => {
        return apiClient.ApplicationModuleApi.mApplicationControllerCreateApplication(
          {
            name: applicationName,
            description: applicationDescription,
          }
        ).then((res) => res.data);
      },
      onSuccess: () => {
        notifications.show("Application created successfully", {
          severity: "success",
          autoHideDuration: 5000,
        });
        queryClient.invalidateQueries({
          queryKey: [
            apiClient.ApplicationModuleApi
              .mApplicationControllerFindAllApplications,
          ],
        });
        onClose(undefined);
      },
      onError: () => {
        notifications.show("Error creating application, please try again", {
          severity: "error",
          autoHideDuration: 5000,
        });
      },
    });

  const handleCreateApplication = () => {
    if (applicationName.trim() === "") {
      setApplicationNameError("Application name is required");
    }

    if (applicationDescription.trim() === "") {
      setApplicationDescriptionError("Description is required");
    }

    if (applicationName.trim() === "" || applicationDescription.trim() === "") {
      return;
    }

    createApplication();
  };

  return (
    <Dialog fullWidth open={open}>
      <DialogTitle>Create application</DialogTitle>
      <DialogContent>
        <Stack spacing={2} paddingTop={2}>
          <TextField
            label="Application name"
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
          <TextField
            label="Description"
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
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => onClose(undefined)}
          disabled={isCreatingApplication}
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleCreateApplication()}
          disabled={isCreatingApplication}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateApplicationDialog;
