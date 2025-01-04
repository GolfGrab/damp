import { ArrowBackIos } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { DashboardLayout, PageContainer } from "@toolpad/core";
import { useNavigate } from "react-router-dom";

type NotificationCenterGenericLayoutProps = {
  title: string;
  children: React.ReactNode;
};

const NotificationCenterGenericLayout = ({
  title,
  children,
}: NotificationCenterGenericLayoutProps) => {
  const navigate = useNavigate();
  return (
    <DashboardLayout
      defaultSidebarCollapsed
      hideNavigation
      branding={{
        title,
        homeUrl: "/notifications",
        logo: (
          <IconButton
            size="medium"
            color="primary"
            aria-label="menu"
            onClick={() => navigate(-1)}
          >
            <ArrowBackIos />
          </IconButton>
        ),
      }}
    >
      <PageContainer maxWidth="xs">{children}</PageContainer>
    </DashboardLayout>
  );
};

export default NotificationCenterGenericLayout;
