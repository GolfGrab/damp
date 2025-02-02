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
import { apiClient } from "../../../api";

const ImportUsersDialog: DialogComponent<undefined, undefined> = ({
  open,
  onClose,
}) => {
  const notifications = useNotifications();
  const [csvInput, setCsvInput] = useState("");
  const [csvError, setCsvError] = useState<string | undefined>();

  const queryClient = useQueryClient();

  const { mutate: importUsers, isPending: isImportingUsers } = useMutation({
    mutationKey: [apiClient.UserModuleApi.mUserControllerUpsertManyUsers.name],
    mutationFn: async () => {
      const users = csvInput
        .split("\n")
        .map((line) => line.split(","))
        .filter(([id, email]) => id && email)
        .map(([id, email]) => ({ id: id.trim(), email: email.trim() }));

      if (users.length === 0) {
        throw new Error("No valid users found in the CSV input");
      }

      return apiClient.UserModuleApi.mUserControllerUpsertManyUsers({ users });
    },
    onSuccess: () => {
      notifications.show("Users imported successfully", {
        severity: "success",
        autoHideDuration: 5000,
      });
      queryClient.invalidateQueries({
        queryKey: [apiClient.UserModuleApi.mUserControllerFindAllUsers.name],
      });
      onClose(undefined);
    },
    onError: (error) => {
      notifications.show(
        error instanceof Error
          ? "Error: " +
              error.message +
              " Please check the CSV input and try again"
          : "Error importing users",
        {
          severity: "error",
          autoHideDuration: 5000,
        }
      );
      setCsvError("Error importing users");
    },
  });

  const handleImportUsers = () => {
    if (csvInput.trim() === "") {
      setCsvError("CSV input is required");
      return;
    }
    setCsvError(undefined);
    importUsers();
  };

  return (
    <Dialog fullWidth open={open} onClose={() => onClose(undefined)}>
      <DialogTitle>Import Users</DialogTitle>
      <DialogContent>
        <Stack spacing={2} paddingTop={2}>
          <TextField
            label="CSV Input"
            fullWidth
            multiline
            required
            error={!!csvError}
            helperText={csvError || "Provide CSV in format: id,email"}
            minRows={4}
            maxRows={8}
            value={csvInput}
            onChange={(e) => {
              setCsvError(undefined);
              setCsvInput(e.target.value);
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(undefined)} disabled={isImportingUsers}>
          Cancel
        </Button>
        <Button onClick={handleImportUsers} disabled={isImportingUsers}>
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportUsersDialog;
