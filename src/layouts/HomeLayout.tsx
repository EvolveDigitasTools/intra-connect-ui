import { Outlet } from "react-router-dom";
import Navbar from "../features/navbar/Navbar";
import { Flowbite } from "flowbite-react";

export default function HomeLayout() {
    return (<div className="bg-light-background dark:bg-dark-background">
        <Flowbite>
            <Navbar />
            <Outlet />
        </Flowbite>
    </div>)
}