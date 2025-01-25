import {
  Alert,
  Button,
  ListItemText,
  MenuItem,
  MenuList,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api";

const NotificationApplications = () => {
  const navigate = useNavigate();
  const {
    data: applications,
    isLoading: isApplicationsLoading,
    isError: isApplicationsError,
    refetch: refetchApplications,
  } = useQuery({
    queryKey: [
      apiClient.ApplicationModuleApi.mApplicationControllerFindAllApplications,
    ],
    queryFn: async () => {
      return await apiClient.ApplicationModuleApi.mApplicationControllerFindAllApplications().then(
        (response) => response.data
      );
    },
  });

  if (isApplicationsLoading) {
    return (
      <Stack spacing={4}  width="100%">
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
      </Stack>
    );
  }

  if (isApplicationsError) {
    return (
      <Stack spacing={4} width="100%">
        <Alert severity="error">Error loading applications</Alert>
        <Stack spacing={2}>
          <Button variant="contained" onClick={() => refetchApplications()}>
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
      <Typography variant="body1">
        Select the applications to configure your notification preferences.
      </Typography>
      {applications && applications.length > 0 ? (
        <MenuList>
          {applications.map((application) => (
            <MenuItem
              key={application.id}
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                my: 1,
              }}
              onClick={() =>
                navigate(
                  `/notifications/applications/${application.id}/user-preferences`
                )
              }
            >
              <ListItemText>{application.name}</ListItemText>
            </MenuItem>
          ))}
        </MenuList>
      ) : (
        <Alert severity="warning">No application found</Alert>
      )}
    </Stack>
  );
};

export default NotificationApplications;
