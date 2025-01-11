import {
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
  const navigation = useNavigate();
  const {
    data: applications,
    isLoading: isApplicationsLoading,
    isError: isApplicationsError,
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
      <Stack spacing={4}>
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
      </Stack>
    );
  }

  if (isApplicationsError) {
    return (
      <Typography variant="body1">
        Error loading applications. Please try again later.
      </Typography>
    );
  }

  return (
    <Stack>
      <Typography variant="body1">
        Select the applications to configure your notification preferences.
      </Typography>
      <MenuList>
        {[
          ...(applications ?? []),
          {
            id: "1",
            name: "Apple",
          },
          {
            id: "2",
            name: "Banana",
          },
          {
            id: "3",
            name: "Cherry",
          },
          {
            id: "4",
            name: "Durian",
          },
          {
            id: "5",
            name: "Eggplant",
          },
          {
            id: "6",
            name: "Fig",
          },
          {
            id: "7",
            name: "Grape",
          },
          {
            id: "8",
            name: "Honeydew",
          },
          {
            id: "9",
            name: "Ice Cream",
          },
          {
            id: "10",
            name: "Jalapeno",
          },
        ]?.map((application) => (
          <MenuItem
            key={application.id}
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              my: 1,
            }}
            onClick={() =>
              navigation(
                `/notifications/applications/${application.id}/user-preferences`
              )
            }
          >
            <ListItemText>{application.name}</ListItemText>
          </MenuItem>
        ))}
      </MenuList>
    </Stack>
  );
};

export default NotificationApplications;
