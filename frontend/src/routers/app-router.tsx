import { createBrowserRouter } from "react-router-dom";
import { AppWithAuth } from "../App";
import SecuredRoute from "../auth/SecuredRoute";
import DashBoardLayout from "../layout/DashBoardLayout";
import Callback from "../pages/auth/LoginCallback";
import Home from "../pages/home/Home";
import AccountSettings from "../pages/notifications/AccountSettings";
import NotificationDetails from "../pages/notifications/NotificationDetails";
import NotificationsHome from "../pages/notifications/NotificationsHome";
import UserPreferences from "../pages/notifications/UserPreferences";

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
                Component: UserPreferences,
                path: "user-preferences",
              },
              {
                Component: AccountSettings,
                path: "accounts",
              },
              {
                Component: NotificationDetails,
                path: ":notificationId",
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
