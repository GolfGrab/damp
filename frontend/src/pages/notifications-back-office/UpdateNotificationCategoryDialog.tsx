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

const UpdateNotificationCategoryDialog: DialogComponent<
  {
    notificationCategoryId: string;
    oldNotificationCategoryName: string;
  },
  undefined
> = ({
  payload: { notificationCategoryId, oldNotificationCategoryName },
  open,
  onClose,
}) => {
  const notifications = useNotifications();
  const [notificationCategoryName, setNotificationCategoryName] = useState(
    oldNotificationCategoryName
  );
  const [notificationCategoryNameError, setNotificationCategoryNameError] =
    useState<string | undefined>();

  const queryClient = useQueryClient();

  const {
    mutate: updateNotificationCategory,
    isPending: isUpdatingNotificationCategory,
  } = useMutation({
    mutationKey: [
      apiClient.ApplicationModuleApi
        .mApplicationControllerUpdateNotificationCategory.name,
    ],
    mutationFn: () => {
      return apiClient.ApplicationModuleApi.mApplicationControllerUpdateNotificationCategory(
        notificationCategoryId,
        {
          name: notificationCategoryName,
        }
      ).then((res) => res.data);
    },
    onSuccess: () => {
      notifications.show("Notification category updated successfully", {
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

  const handleUpdateNotificationCategory = () => {
    if (notificationCategoryName.trim() === "") {
      setNotificationCategoryNameError(
        "Notification category name is required"
      );
    }

    if (notificationCategoryName.trim() === "") {
      return;
    }

    updateNotificationCategory();
  };

  return (
    <Dialog fullWidth open={open}>
      <DialogTitle>Edit notification category</DialogTitle>
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
          disabled={isUpdatingNotificationCategory}
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleUpdateNotificationCategory()}
          disabled={isUpdatingNotificationCategory}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateNotificationCategoryDialog;
