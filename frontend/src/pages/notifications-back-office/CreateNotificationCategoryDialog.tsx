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

const CreateNotificationCategoryDialog: DialogComponent<
  {
    applicationId: string;
  },
  undefined
> = ({ payload: { applicationId }, open, onClose }) => {
  const notifications = useNotifications();
  const [notificationCategoryName, setNotificationCategoryName] = useState("");
  const [notificationCategoryNameError, setNotificationCategoryNameError] =
    useState<string | undefined>();

  const queryClient = useQueryClient();

  const {
    mutate: createNotificationCategory,
    isPending: isCreatingNotificationCategory,
  } = useMutation({
    mutationKey: [
      apiClient.ApplicationModuleApi
        .mApplicationControllerCreateNotificationCategory.name,
    ],
    mutationFn: () => {
      return apiClient.ApplicationModuleApi.mApplicationControllerCreateNotificationCategory(
        applicationId,
        {
          name: notificationCategoryName,
        }
      ).then((res) => res.data);
    },
    onSuccess: () => {
      notifications.show("Notification category created successfully", {
        severity: "success",
        autoHideDuration: 5000,
      });
      queryClient.invalidateQueries({
        queryKey: [
          apiClient.ApplicationModuleApi
            .mApplicationControllerFindAllNotificationCategoriesByApplicationId
            .name,
        ],
      });
      onClose(undefined);
    },
  });

  const handleCreateNotificationCategory = () => {
    if (notificationCategoryName.trim() === "") {
      setNotificationCategoryNameError(
        "Notification category name is required"
      );
    }

    if (notificationCategoryName.trim() === "") {
      return;
    }

    createNotificationCategory();
  };

  return (
    <Dialog fullWidth open={open}>
      <DialogTitle>Create notification category</DialogTitle>
      <DialogContent>
        <Stack spacing={2} paddingTop={2}>
          <TextField
            label="Notification category name"
            fullWidth
            required
            error={!!notificationCategoryNameError}
            helperText={notificationCategoryNameError}
            value={notificationCategoryName}
            onChange={(e) => {
              if (e.target.value.trim() === "") {
                setNotificationCategoryNameError(
                  "Notification category name is required"
                );
              } else {
                setNotificationCategoryNameError(undefined);
              }

              setNotificationCategoryName(e.target.value);
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => onClose(undefined)}
          disabled={isCreatingNotificationCategory}
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleCreateNotificationCategory()}
          disabled={isCreatingNotificationCategory}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateNotificationCategoryDialog;
