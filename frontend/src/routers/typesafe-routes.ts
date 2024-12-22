import { route } from "react-router-typesafe-routes";

const home = route({
  path: "",
  children: {
    about: route({
      path: "about",
    }),
    auth: route({
      children: {
        login: route({
          path: "login",
        }),
        register: route({
          path: "register",
        }),
        callback: route({
          path: "auth/callback",
        }),
      },
    }),
    concerts: route({
      path: "concerts",
      children: {
        home: route({}),
        city: route({
          path: ":city",
        }),
        trending: route({}),
      },
    }),
    notifications: route({
      path: "notifications",
      children: {
        home: route({}),
        preferenceSettings: route({
          path: "preference-settings",
        }),
      },
    }),
  },
});

export default home;
