import { Route, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import HomeLayout from "./layouts/HomeLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import LandingPage from "./components/LandingPage";
import Ticket from "./features/tickets/Ticket";
import TicketDetailUI from "./features/tickets/TicketDetail";
import Dashboard from "./features/dashboard/Dashboard";
import BoardList from "./features/boards/BoardList";
import Board from "./features/boards/Board";
import Workflow from "./features/workflows/Workflow";
import WorkflowEditor from "./features/workflows/WorkflowEditor";
import Job from "./features/workflows/jobs/Job";
import NewJob from "./features/workflows/jobs/NewJob";
import JobConfig from "./features/workflows/jobs/JobConfig";
import JobEditor from "./features/workflows/jobs/JobEditor";
import Documentation from "./features/documentation/Documentation";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<HomeLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="tickets" element={<Ticket />} />
          <Route path="tickets/:ticketId" element={<TicketDetailUI />} />
          <Route path="boards" element={<BoardList />} />
          <Route path="boards/:boardId" element={<Board />} />
          <Route path="workflows" element={<Workflow />} />
          <Route path="workflow/:workflowId" element={<WorkflowEditor />} />
          <Route path="jobs" element={<Job />} />
          <Route path="jobs/new" element={<NewJob />} />
          <Route path="jobs/new/:workflowId" element={<JobConfig />} />
          <Route path="job/:jobId" element={<JobEditor />} />
          <Route path="docs" element={<Documentation />} />
        </Route>
      </Route>
    </>
  )
)