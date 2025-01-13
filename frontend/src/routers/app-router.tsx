import { OpenInNew } from "@mui/icons-material";
import { Button } from "@mui/material";
import { createBrowserRouter, useParams } from "react-router-dom";
import { AppWithAuth } from "../App";
import SecuredRoute from "../auth/SecuredRoute";
import DashBoardLayout from "../layout/BackOfficeDashBoardLayout";
import BackOfficeGenericLayout from "../layout/BackOfficeGenericLayout";
import NotificationCenterGenericLayout from "../layout/NotificationCenterGenericLayout";
import Callback from "../pages/auth/LoginCallback";
import Home from "../pages/home/Home";
import ApplicationDetailsTabsLayout from "../pages/notifications-back-office/ApplicationDetailsTabsLayout";
import ApplicationInfo from "../pages/notifications-back-office/ApplicationInfo";
import ApplicationNotificationCategories from "../pages/notifications-back-office/ApplicationNotificationCategories";
import ServerSideGridWithReactQuery from "../pages/notifications-back-office/ApplicationNotificationTasks";
import Applications from "../pages/notifications-back-office/Applications";
import Accounts from "../pages/notifications/Accounts";
import ConfigureAccount from "../pages/notifications/ConfigureAccount";
import ConnectAccount from "../pages/notifications/ConnectAccount";
import NotificationApplications from "../pages/notifications/NotificationApplications";
import NotificationApplicationUserPreferences from "../pages/notifications/NotificationApplicationUserPreferences";
import NotificationDetails from "../pages/notifications/NotificationDetails";
import NotificationsHome from "../pages/notifications/NotificationsHome";
import VerifyAccount from "../pages/notifications/VerifyAccount";

const appRouter = createBrowserRouter([
  {
    Component: AppWithAuth,
    children: [
      {
        Component: SecuredRoute,
        children: [
          {
            Component: () => (
              <DashBoardLayout>
                <Home />
              </DashBoardLayout>
            ),
            path: "/",
          },
          // Notification Center
          {
            path: "notifications",
            children: [
              {
                Component: NotificationsHome,
                index: true,
              },
              {
                Component: () => (
                  <NotificationCenterGenericLayout
                    title="Preferences Settings"
                    parentPath="/notifications"
                  >
                    <NotificationApplications />
                  </NotificationCenterGenericLayout>
                ),
                path: "applications",
              },
              {
                Component: NotificationDetails,
                path: ":notificationId",
              },
              {
                Component: () => (
                  <NotificationCenterGenericLayout
                    title="User Preferences"
                    parentPath="/notifications/applications"
                  >
                    <NotificationApplicationUserPreferences />
                  </NotificationCenterGenericLayout>
                ),
                path: "applications/:applicationId/user-preferences",
              },
              {
                Component: () => (
                  <NotificationCenterGenericLayout
                    title="Account Settings"
                    parentPath="/notifications"
                  >
                    <Accounts />
                  </NotificationCenterGenericLayout>
                ),
                path: "accounts",
              },
              {
                Component: () => {
                  const { channelType } = useParams();
                  return (
                    <NotificationCenterGenericLayout
                      title={`Connect ${channelType} account`}
                      parentPath="/notifications/accounts"
                    >
                      <ConnectAccount />
                    </NotificationCenterGenericLayout>
                  );
                },
                path: "accounts/connect/:channelType",
              },
              {
                Component: () => {
                  const { channelType } = useParams();
                  return (
                    <NotificationCenterGenericLayout
                      title={`Verify ${channelType} account`}
                      parentPath={`/notifications/accounts/connect/${channelType}`}
                    >
                      <VerifyAccount />
                    </NotificationCenterGenericLayout>
                  );
                },
                path: "accounts/verify/:channelType",
              },
              {
                Component: () => {
                  const { channelType } = useParams();
                  return (
                    <NotificationCenterGenericLayout
                      title={`Configure  ${channelType}`}
                      parentPath="/notifications/accounts"
                    >
                      <ConfigureAccount />
                    </NotificationCenterGenericLayout>
                  );
                },
                path: "accounts/configure/:channelType",
              },
            ],
          },
          // Notification Back Office
          {
            path: "notifications-back-office",
            children: [
              {
                path: "applications",
                children: [
                  {
                    Component: () => (
                      <BackOfficeGenericLayout title="Applications">
                        <Applications />
                      </BackOfficeGenericLayout>
                    ),
                    index: true,
                  },
                  {
                    path: ":applicationId/:tab",
                    Component: () => {
                      return <ApplicationDetailsTabsLayout />;
                    },
                    children: [
                      {
                        Component: () => {
                          const { tab } = useParams();

                          switch (tab) {
                            case "info":
                              return <ApplicationInfo />;
                            case "notification-categories":
                              return <ApplicationNotificationCategories />;
                            case "notification-logs":
                              return <ServerSideGridWithReactQuery />;
                            default:
                              return null;
                          }
                        },
                        index: true,
                      },
                    ],
                  },
                ],
              },
              {
                path: "templates",
                children: [
                  {
                    Component: () => (
                      <BackOfficeGenericLayout title="Templates">
                        templates
                      </BackOfficeGenericLayout>
                    ),
                    index: true,
                  },
                  {
                    Component: () => {
                      const { templateId } = useParams();
                      return (
                        <BackOfficeGenericLayout
                          title={"Template Details" + templateId}
                        >
                          template details {templateId}
                        </BackOfficeGenericLayout>
                      );
                    },
                    path: ":templateId",
                  },
                ],
              },
              {
                Component: () => (
                  <BackOfficeGenericLayout title="Analytics">
                    analytics
                  </BackOfficeGenericLayout>
                ),
                path: "analytics",
              },
              {
                path: "api-documentation",
                children: [
                  {
                    Component: () => (
                      <BackOfficeGenericLayout title="Swagger API Documentation">
                        <Button
                          variant="contained"
                          color="primary"
                          href={import.meta.env.VITE_API_SWAGGER_DOCS_URL}
                          target="_blank"
                          endIcon={<OpenInNew />}
                        >
                          Open in new tab
                        </Button>
                        <iframe
                          src={import.meta.env.VITE_API_SWAGGER_DOCS_URL}
                          style={{ width: "100%", height: "100%" }}
                          title="Swagger"
                        />
                      </BackOfficeGenericLayout>
                    ),
                    path: "swagger",
                  },
                  {
                    Component: () => (
                      <BackOfficeGenericLayout title="Stoplight API Documentation">
                        <Button
                          variant="contained"
                          color="primary"
                          href={import.meta.env.VITE_API_STOPLIGHT_DOCS_URL}
                          target="_blank"
                          endIcon={<OpenInNew />}
                        >
                          Open in new tab
                        </Button>
                        <iframe
                          src={import.meta.env.VITE_API_STOPLIGHT_DOCS_URL}
                          style={{ width: "100%", height: "100%" }}
                          title="Stoplight"
                        />
                      </BackOfficeGenericLayout>
                    ),
                    path: "stoplight",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        children: [
          {
            Component: Callback,
            path: "auth/callback",
          },
        ],
      },
      {
        Component: () => (
          <div
            style={{
              color: "red",
              fontSize: "2em",
            }}
          >
            404
          </div>
        ),
        path: "*",
      },
    ],
  },
]);

export default appRouter;
