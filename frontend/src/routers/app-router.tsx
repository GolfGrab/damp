import { Route, Routes } from "react-router";
import SecuredRoute from "../auth/SecuredRoute";
import About from "../pages/about/About";
import AuthLayout from "../pages/auth/AuthLayout";
import Login from "../pages/auth/Login";
import Callback from "../pages/auth/LoginCallback";
import Register from "../pages/auth/Register";
import City from "../pages/concerts/City";
import ConcertsHome from "../pages/concerts/ConcertsHome";
import Trending from "../pages/concerts/Trending";
import Home from "../pages/home/Home";
import home from "./typesafe-routes";

const AppRouter = () => {
  return (
    <Routes>
      <Route path={home.$path()} element={<Home />} />
      <Route path={home.about.$path()} element={<About />} />

      <Route element={<AuthLayout />}>
        <Route path={home.auth.login.$path()} element={<Login />} />
        <Route path={home.auth.register.$path()} element={<Register />} />
        <Route path={home.auth.callback.$path()} element={<Callback />} />
      </Route>

      <Route element={<SecuredRoute />}>
        <Route path={home.concerts.$path()}>
          <Route path={home.concerts.home.$path()} element={<ConcertsHome />} />
          <Route path={home.concerts.city.$path()} element={<City />} />
          <Route path={home.concerts.trending.$path()} element={<Trending />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <div
            style={{
              color: "red",
              fontSize: "2em",
            }}
          >
            404
          </div>
        }
      />
    </Routes>
  );
};

export default AppRouter;
