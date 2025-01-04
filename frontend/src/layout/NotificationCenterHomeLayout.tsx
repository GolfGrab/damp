import { Account, DashboardLayout, PageContainer } from "@toolpad/core";
import { Outlet } from "react-router-dom";
import NotificationAccountMenu from "./components/NotificationAccountMenu";

const NotificationCenterHomeLayout = () => {
  return (
    <DashboardLayout
      defaultSidebarCollapsed
      hideNavigation
      branding={{
        homeUrl: "/notifications",
        title: "Notification Center",
      }}
      slots={{
        toolbarAccount: () => (
          <Account
            slots={{
              popoverContent: NotificationAccountMenu,
            }}
          />
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
