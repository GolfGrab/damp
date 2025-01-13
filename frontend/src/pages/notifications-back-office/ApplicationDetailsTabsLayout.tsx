import { Box, Tab, Tabs } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../api";
import BackOfficeGenericLayout from "../../layout/BackOfficeGenericLayout";

const ApplicationDetailsTabsLayout = () => {
  const navigate = useNavigate();
  const { applicationId, tab } = useParams();

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

  if (isApplicationLoading) {
    return (
      <BackOfficeGenericLayout title="">Loading...</BackOfficeGenericLayout>
    );
  }

  if (isApplicationError) {
    return <BackOfficeGenericLayout title="">Error</BackOfficeGenericLayout>;
  }

  return (
    <BackOfficeGenericLayout title={"Application : " + application?.name}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={
            {
              info: 0,
              "notification-categories": 1,
              "notification-logs": 2,
            }[tab ?? "info"]
          }
          onChange={(event) => {
            console.log(event);
          }}
        >
          <Tab
            label="Info"
            onClick={() => {
              navigate(
                `/notifications-back-office/applications/${applicationId}/info`
              );
            }}
          />
          <Tab
            label="Notification Categories"
            onClick={() => {
              navigate(
                `/notifications-back-office/applications/${applicationId}/notification-categories`
              );
            }}
          />
          <Tab
            label="Notification Logs"
            onClick={() => {
              navigate(
                `/notifications-back-office/applications/${applicationId}/notification-logs`
              );
            }}
          />
        </Tabs>
      </Box>
      <Outlet />
    </BackOfficeGenericLayout>
  );
};
export default ApplicationDetailsTabsLayout;
