import { Account, DashboardLayout, PageContainer } from "@toolpad/core";
import NotificationAccountMenu from "./components/NotificationAccountMenu";

type NotificationCenterHomeLayoutProps = {
  children: React.ReactNode;
};

const NotificationCenterHomeLayout = ({
  children,
}: NotificationCenterHomeLayoutProps) => {
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
      <PageContainer maxWidth="xs">{children}</PageContainer>
    </DashboardLayout>
  );
};

export default NotificationCenterHomeLayout;
