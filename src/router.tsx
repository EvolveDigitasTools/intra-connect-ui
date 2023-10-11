import { Route, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import HomeLayout from "./layouts/HomeLayout";
import LandingPage from "./components/LandingPage";

export const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={<HomeLayout />}>
            <Route path="/" element={<LandingPage />} />
        </Route>
      </>
    )
  )