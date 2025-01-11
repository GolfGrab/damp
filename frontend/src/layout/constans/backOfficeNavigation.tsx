import {
  DocumentScannerOutlined,
  HomeOutlined,
  QueryStatsOutlined,
  WidgetsOutlined,
} from "@mui/icons-material";
import { Navigation } from "@toolpad/core";

export const backOfficeNavigation: Navigation = [
  {
    title: "Home",
    icon: <HomeOutlined />,
  },
  {
    title: "Applications",
    segment: "notifications-back-office/applications",
    icon: <WidgetsOutlined />,
    pattern: "notifications-back-office/applications{/:applicationId}*",
  },
  {
    title: "Templates",
    segment: "notifications-back-office/templates",
    icon: <DocumentScannerOutlined />,
    pattern: "notifications-back-office/templates{/:templateId}*",
  },
  {
    title: "Analytics",
    segment: "notifications-back-office/analytics",
    icon: <QueryStatsOutlined />,
  },
];
