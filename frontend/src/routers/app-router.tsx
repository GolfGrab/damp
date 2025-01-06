import { createBrowserRouter, useParams } from "react-router-dom";
import { AppWithAuth } from "../App";
import SecuredRoute from "../auth/SecuredRoute";
import DashBoardLayout from "../layout/DashBoardLayout";
import NotificationCenterGenericLayout from "../layout/NotificationCenterGenericLayout";
import Callback from "../pages/auth/LoginCallback";
import Home from "../pages/home/Home";
import Accounts from "../pages/notifications/Accounts";
import Applications from "../pages/notifications/Applications";
import ApplicationUserPreferences from "../pages/notifications/ApplicationUserPreferences";
import ConfigureAccount from "../pages/notifications/ConfigureAccount";
import ConnectAccount from "../pages/notifications/ConnectAccount";
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
            Component: DashBoardLayout,
            children: [
              {
                Component: Home,
                path: "/",
              },
            ],
          },
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
                    parentPath={`/notifications`}
                  >
                    <Applications />
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
                    <ApplicationUserPreferences />
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
