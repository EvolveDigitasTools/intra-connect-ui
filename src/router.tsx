import { Route, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import HomeLayout from "./layouts/HomeLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import LandingPage from "./components/LandingPage";
import Ticket from "./features/tickets/Ticket";

export const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={<HomeLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="tickets" element={<Ticket />} />
            </Route>
        </Route>
      </>
    )
  )