import { ArrowBackOutlined } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { DashboardLayout, PageContainer } from "@toolpad/core";
import { Outlet, useNavigate } from "react-router-dom";

const NotificationDetailLayout = () => {
  const navigate = useNavigate();
  return (
    <DashboardLayout
      defaultSidebarCollapsed
      hideNavigation
      branding={{
        title: "",
        logo: (
          <IconButton
            size="large"
            edge="start"
            color="primary"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => navigate(-1)}
          >
            <ArrowBackOutlined />
          </IconButton>
        ),
      }}
    >
      <PageContainer maxWidth="xs">
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
};

export default NotificationDetailLayout;
