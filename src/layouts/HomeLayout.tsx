import { Outlet } from "react-router-dom";
import Navbar from "../features/navbar/Navbar";
import { Flowbite } from "flowbite-react";

export default function HomeLayout() {
    return (<div className="bg-light-background dark:bg-dark-background text-light-main-text dark:text-dark-main-text prose">
        <Flowbite>
            <Navbar />
            <Outlet />
        </Flowbite>
    </div>)
}