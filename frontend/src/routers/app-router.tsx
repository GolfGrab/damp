import { createBrowserRouter } from "react-router-dom";
import { AppWithAuth } from "../App";
import SecuredRoute from "../auth/SecuredRoute";
import DashBoardLayout from "../layout/DashBoardLayout";
import NotificationCenterHomeLayout from "../layout/NotificationCenterHomeLayout";
import Callback from "../pages/auth/LoginCallback";
import Home from "../pages/home/Home";
import NotificationDetails from "../pages/notifications/NotificationDetails";
import NotificationsHome from "../pages/notifications/NotificationsHome";
import PreferenceSettings from "../pages/notifications/PreferenceSettings";

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
            Component: NotificationCenterHomeLayout,
            children: [
              {
                Component: NotificationsHome,
                path: "notifications",
              },
            ],
          },
          {
            Component: NotificationDetails,
            path: "notifications/:notificationId",
          },
          {
            Component: PreferenceSettings,
            path: "notifications/preference-settings",
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
