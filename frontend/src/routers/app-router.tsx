import { createBrowserRouter } from "react-router-dom";
import { AppWithAuth } from "../App";
import SecuredRoute from "../auth/SecuredRoute";
import DashBoardLayout from "../layout/DashBoardLayout";
import About from "../pages/about/About";
import Callback from "../pages/auth/LoginCallback";
import City from "../pages/concerts/City";
import ConcertsHome from "../pages/concerts/ConcertsHome";
import Trending from "../pages/concerts/Trending";
import Home from "../pages/home/Home";
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
              {
                Component: About,
                path: "/about",
              },
            ],
          },

          {
            Component: ConcertsHome,
            path: "/concerts",
          },
          {
            Component: City,
            path: "/concerts/:city",
          },
          {
            Component: Trending,
            path: "/concerts/trending",
          },
          {
            Component: NotificationsHome,

            path: "notifications",
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
