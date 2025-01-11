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
    segment: "applications",
    icon: <WidgetsOutlined />,
    pattern: "applications{/:applicationId}*",
  },
  {
    title: "Templates",
    segment: "templates",
    icon: <DocumentScannerOutlined />,
    pattern: "templates{/:templateId}*",
  },
  {
    title: "Analytics",
    segment: "analytics",
    icon: <QueryStatsOutlined />,
  },
];
