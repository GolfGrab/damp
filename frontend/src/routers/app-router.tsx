import { createBrowserRouter } from "react-router-dom";
import { AppWithAuth } from "../App";
import SecuredRoute from "../auth/SecuredRoute";
import DashBoardLayout from "../layout/DashBoardLayout";
import About from "../pages/about/About";
import Login from "../pages/auth/Login";
import Callback from "../pages/auth/LoginCallback";
import Register from "../pages/auth/Register";
import City from "../pages/concerts/City";
import ConcertsHome from "../pages/concerts/ConcertsHome";
import Trending from "../pages/concerts/Trending";
import Home from "../pages/home/Home";
import NotificationsHome from "../pages/notifications/NotificationsHome";
import PreferenceSettings from "../pages/notifications/PreferenceSettings";
import home from "./typesafe-routes";

const appRouter = createBrowserRouter([
  {
    Component: AppWithAuth,
    children: [
      {
        Component: DashBoardLayout,
        children: [
          {
            Component: Home,
            path: home.$path(),
          },
          {
            Component: About,
            path: home.about.$path(),
          },
        ],
      },
      {
        children: [
          {
            Component: Login,
            path: home.auth.login.$path(),
          },
          {
            Component: Register,
            path: home.auth.register.$path(),
          },
          {
            Component: Callback,
            path: home.auth.callback.$path(),
          },
        ],
      },
      {
        Component: SecuredRoute,
        children: [
          {
            Component: ConcertsHome,
            path: home.concerts.home.$path(),
          },
          {
            Component: City,
            path: home.concerts.city.$path(),
          },
          {
            Component: Trending,
            path: home.concerts.trending.$path(),
          },
        ],
      },
      {
        Component: SecuredRoute,
        children: [
          {
            Component: NotificationsHome,

            path: home.notifications.home.$path(),
          },
          {
            Component: PreferenceSettings,
            path: home.notifications.preferenceSettings.$path(),
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
