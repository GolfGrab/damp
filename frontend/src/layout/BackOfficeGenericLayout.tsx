import { DashboardLayout, PageContainer } from "@toolpad/core";
import { backOfficeNavigation } from "./constant/backOfficeNavigation";

type BackOfficeGenericLayoutProps = {
  title?: string;
  children: React.ReactNode;
};

const BackOfficeGenericLayout = ({
  title,
  children,
}: BackOfficeGenericLayoutProps) => {
  return (
    <DashboardLayout
      branding={{
        title: "Notification Back Office",
        homeUrl: "/",
      }}
      navigation={backOfficeNavigation}
    >
      <PageContainer title={title}>{children}</PageContainer>
    </DashboardLayout>
  );
};

export default BackOfficeGenericLayout;
