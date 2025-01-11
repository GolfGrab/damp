import { DashboardLayout, PageContainer } from "@toolpad/core";
import { backOfficeNavigation } from "./constans/backOfficeNavigation";

type BackOfficeDashBoardLayoutProps = {
  children: React.ReactNode;
};

const BackOfficeDashBoardLayout = ({
  children,
}: BackOfficeDashBoardLayoutProps) => {
  return (
    <DashboardLayout
      defaultSidebarCollapsed
      branding={{
        title: "Notification Back Office",
        homeUrl: "/",
      }}
      navigation={backOfficeNavigation}
    >
      <PageContainer>{children}</PageContainer>
    </DashboardLayout>
  );
};

export default BackOfficeDashBoardLayout;
