import {
  DocumentScannerOutlined,
  HomeOutlined,
  IntegrationInstructionsOutlined,
  SmartToyOutlined,
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
    title: "Api Documentation Swagger",
    segment: "notifications-back-office/api-documentation/swagger",
    icon: <IntegrationInstructionsOutlined />,
  },
  {
    title: "Api Documentation Stoplight",
    segment: "notifications-back-office/api-documentation/stoplight",
    icon: <SmartToyOutlined />,
  },
];
