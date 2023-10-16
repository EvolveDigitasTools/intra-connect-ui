import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import "./DashboardLayout.css";
import { RootState } from "../app/store";
import SidebarLeft from "../features/sidebar/Sidebar";
import { useState } from "react";
import { BsFillCaretRightSquareFill } from 'react-icons/bs';


export default function DashboardLayout() {
    const auth = useSelector((state: RootState) => state.auth);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    if (auth.isAuthenticated)
        return (<section className="flex h-[90vh]">
            <SidebarLeft isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className={`p-4 transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-full' : 'w-full'}`}>
                {!isSidebarOpen && <button className="fixed left-0 text-light-navbar dark:text-dark-secondry-button" onClick={() => setIsSidebarOpen(true)}><BsFillCaretRightSquareFill className="w-5 h-5" /></button>}
                <Outlet />
            </main>
        </section>)
    else
        return (<div>
            <Navigate to='/' />
        </div>)
}