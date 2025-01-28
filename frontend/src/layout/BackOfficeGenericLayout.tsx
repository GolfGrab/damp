import { DashboardLayout, PageContainer } from "@toolpad/core";
import { useAuth } from "react-oidc-context";
import { backOfficeNavigation } from "./constant/backOfficeNavigation";

type BackOfficeGenericLayoutProps = {
  title?: string;
  children: React.ReactNode;
};

const BackOfficeGenericLayout = ({
  title,
  children,
}: BackOfficeGenericLayoutProps) => {
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

  console.log(allowedNavigation);

  return (
    <DashboardLayout
      branding={{
        title: "Notification Back Office",
        homeUrl: "/",
      }}
      navigation={allowedNavigation}
    >
      <PageContainer title={title}>{children}</PageContainer>
    </DashboardLayout>
  );
};

export default BackOfficeGenericLayout;
