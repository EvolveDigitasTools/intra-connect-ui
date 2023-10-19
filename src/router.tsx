import { Route, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import HomeLayout from "./layouts/HomeLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import LandingPage from "./components/LandingPage";
import Ticket from "./features/tickets/Ticket";
import TicketDetailUI from "./features/tickets/TicketDetail";

export const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={<HomeLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="tickets" element={<Ticket />} />
              <Route path="tickets/:ticketId" element={<TicketDetailUI />} />
            </Route>
        </Route>
      </>
    )
  )