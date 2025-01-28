import {
  DocumentScannerOutlined,
  HomeOutlined,
  IntegrationInstructionsOutlined,
  SmartToyOutlined,
  WidgetsOutlined,
} from "@mui/icons-material";
import { NavigationItem } from "@toolpad/core";
import { BackOfficeRole } from "./backOffiecRole";

export const backOfficeNavigation: (NavigationItem & {
  roles?: BackOfficeRole[];
})[] = [
  {
    title: "Home",
    icon: <HomeOutlined />,
  },
  {
    title: "Users",
    segment: "notifications-back-office/users",
    icon: <WidgetsOutlined />,
    roles: [BackOfficeRole.Admin],
  },
  {
    title: "Applications",
    segment: "notifications-back-office/applications",
    icon: <WidgetsOutlined />,
    pattern: "notifications-back-office/applications{/:applicationId}*",
    roles: [BackOfficeRole.Admin, BackOfficeRole.Developer],
  },
  {
    title: "Templates",
    segment: "notifications-back-office/templates",
    icon: <DocumentScannerOutlined />,
    pattern: "notifications-back-office/templates{/:templateId}*",
    roles: [BackOfficeRole.Admin, BackOfficeRole.Developer],
  },
  {
    title: "Api Documentation Swagger",
    segment: "notifications-back-office/api-documentation/swagger",
    icon: <IntegrationInstructionsOutlined />,
    roles: [BackOfficeRole.Admin, BackOfficeRole.Developer],
  },
  {
    title: "Api Documentation Stoplight",
    segment: "notifications-back-office/api-documentation/stoplight",
    icon: <SmartToyOutlined />,
    roles: [BackOfficeRole.Admin, BackOfficeRole.Developer],
  },
];
