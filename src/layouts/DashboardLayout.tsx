import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";import { RootState } from "../app/store";
;

export default function DashboardLayout() {
    const auth = useSelector((state: RootState) => state.auth);

    if(auth.isAuthenticated)
    return (<div>
        <Outlet />
    </div>)
    else
    return (<div>
        <Navigate to='/' />
    </div>)
}