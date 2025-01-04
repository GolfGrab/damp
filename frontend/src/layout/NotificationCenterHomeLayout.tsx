import { Typography } from "@mui/material";
import { DashboardLayout, PageContainer } from "@toolpad/core";
import { Outlet } from "react-router-dom";

const NotificationCenterHomeLayout = () => {
  return (
    <DashboardLayout
      defaultSidebarCollapsed
      hideNavigation
      slots={{
        appTitle: () => (
          <Typography variant="h6">Notification Center</Typography>
        ),
      }}
    >
      <PageContainer maxWidth="xs">
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
};

export default NotificationCenterHomeLayout;
