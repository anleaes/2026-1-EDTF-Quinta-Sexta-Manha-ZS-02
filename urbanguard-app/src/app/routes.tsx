import { createBrowserRouter } from "react-router";
import { MobileApp } from "./pages/MobileApp";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MobileApp,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/cadastro",
    Component: Signup,
  },
]);
