import { DashboardLayout, PageContainer } from "@toolpad/core";
import { Outlet } from "react-router-dom";

const NotificationCenterHomeLayout = () => {
  return (
    <DashboardLayout
      defaultSidebarCollapsed
      hideNavigation
      slotProps={{
        appTitle: {
          branding: {
            title: "Notification Center",
          },
        },
      }}
    >
      <PageContainer maxWidth="xs">
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
};

export default NotificationCenterHomeLayout;
