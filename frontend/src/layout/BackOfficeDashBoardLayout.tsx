import { DashboardLayout, PageContainer } from "@toolpad/core";
import { backOfficeNavigation } from "./constant/backOfficeNavigation";

type BackOfficeDashBoardLayoutProps = {
  children: React.ReactNode;
};

const BackOfficeDashBoardLayout = ({
  children,
}: BackOfficeDashBoardLayoutProps) => {
  return (
    <DashboardLayout
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
