import { DashboardLayout, PageContainer } from "@toolpad/core";
import { Outlet } from "react-router-dom";

const DashBoardLayout = () => {
  return (
    <DashboardLayout defaultSidebarCollapsed>
      <PageContainer>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
};

export default DashBoardLayout;
