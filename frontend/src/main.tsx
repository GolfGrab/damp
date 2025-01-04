import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import appRouter from "./routers/app-router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={appRouter} />
  </StrictMode>
);
