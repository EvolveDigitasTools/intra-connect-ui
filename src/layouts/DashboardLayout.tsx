import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../app/store";
import SidebarLeft from "../features/sidebar/Sidebar";
import { useEffect, useState } from "react";
import { BsFillCaretRightSquareFill } from 'react-icons/bs';


export default function DashboardLayout() {
    const auth = useSelector((state: RootState) => state.auth);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    useEffect(() => {
        if(window.innerWidth < 640)
        setIsSidebarOpen(false)
    }, [])

    if (auth.isAuthenticated)
        return (<section className="flex h-[90vh]">
            <SidebarLeft isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className={`transition-all duration-300 h-full ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)] sm:block hidden' : 'w-full'}`}>
                {!isSidebarOpen && <button className="fixed left-0 text-light-navbar dark:text-dark-secondry-button" onClick={() => setIsSidebarOpen(true)}><BsFillCaretRightSquareFill className="w-5 h-5" /></button>}
                <Outlet />
            </main>
        </section>)
    else
        return (<div>
            <Navigate to='/' />
        </div>)
}