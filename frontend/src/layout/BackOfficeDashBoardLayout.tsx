import { DashboardLayout, PageContainer } from "@toolpad/core";
import { useAuth } from "react-oidc-context";
import { backOfficeNavigation } from "./constant/backOfficeNavigation";

type BackOfficeDashBoardLayoutProps = {
  children: React.ReactNode;
};

const BackOfficeDashBoardLayout = ({
  children,
}: BackOfficeDashBoardLayoutProps) => {
  const auth = useAuth();

  const allowedNavigation = backOfficeNavigation.filter((navItem) => {
    if (!navItem.roles) {
      return true;
    }
    return navItem.roles.some((role) =>
      ((auth?.user?.profile?.groups as string[] | undefined) ?? []).includes(
        role
      )
    );
  });

  return (
    <DashboardLayout
      branding={{
        title: "Notification Back Office",
        homeUrl: "/",
      }}
      navigation={allowedNavigation}
    >
      <PageContainer>{children}</PageContainer>
    </DashboardLayout>
  );
};

export default BackOfficeDashBoardLayout;
