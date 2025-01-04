import { ArrowBackIos } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { Account, DashboardLayout, PageContainer } from "@toolpad/core";
import { useNavigate } from "react-router-dom";
import NotificationAccountMenu from "./components/NotificationAccountMenu";

type NotificationCenterGenericLayoutProps = {
  title: string;
  parentPath: string;
  children: React.ReactNode;
};

const NotificationCenterGenericLayout = ({
  title,
  parentPath,
  children,
}: NotificationCenterGenericLayoutProps) => {
  const navigate = useNavigate();
  return (
    <DashboardLayout
      defaultSidebarCollapsed
      hideNavigation
      branding={{
        homeUrl: "",
        title,
        logo: (
          <IconButton
            size="medium"
            color="primary"
            aria-label="menu"
            onClick={() => navigate(parentPath)}
          >
            <ArrowBackIos />
          </IconButton>
        ),
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

export default NotificationCenterGenericLayout;
