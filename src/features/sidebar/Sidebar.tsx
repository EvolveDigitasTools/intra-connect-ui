import { Sidebar } from "flowbite-react";
import { HiArrowSmRight, HiChartPie, HiInbox, HiShoppingBag, HiTable, HiUser, } from 'react-icons/hi';
import { BsFillTicketDetailedFill, BsFillCaretLeftSquareFill, BsClipboardDataFill } from 'react-icons/bs';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SidebarLeft({ isOpen, onClose }: SidebarProps) {
    return (<aside className={`absolute w-full sm:w-64 h-[90vh] transition-transform duration-300 ${isOpen ? 'transform translate-x-0' : 'transform -translate-x-full'}`}>
        <button className="fixed right-0 mt-4 text-light-background dark:text-dark-secondry-button" onClick={() => onClose()}><BsFillCaretLeftSquareFill className="w-5 h-5" /></button>
        <Sidebar className="w-full sm:w-64">
            <Sidebar.Items>
                <Sidebar.ItemGroup>
                    <Sidebar.Item
                        href="/dashboard"
                        icon={HiChartPie}
                    >
                        <p>
                            Dashboard
                        </p>
                    </Sidebar.Item>
                    <Sidebar.Item
                        href='/dashboard/tickets'
                        icon={BsFillTicketDetailedFill}
                    >
                        <p>
                            Tickets
                        </p>
                    </Sidebar.Item>
                    <Sidebar.Item
                        href='/dashboard/boards'
                        icon={BsClipboardDataFill}
                    >
                        <p>
                            Boards
                        </p>
                    </Sidebar.Item>
                    {/* <Sidebar.Collapse
                        icon={HiShoppingBag}
                        label="E-commerce"
                    >
                        <Sidebar.Item href="#">
                            Products
                        </Sidebar.Item>
                        <Sidebar.Item href="#">
                            Sales
                        </Sidebar.Item>
                        <Sidebar.Item href="#">
                            Refunds
                        </Sidebar.Item>
                        <Sidebar.Item href="#">
                            Shipping
                        </Sidebar.Item>
                    </Sidebar.Collapse>
                    <Sidebar.Item
                        href="#"
                        icon={HiInbox}
                    >
                        <p>
                            Inbox
                        </p>
                    </Sidebar.Item>
                    <Sidebar.Item
                        href="#"
                        icon={HiUser}
                    >
                        <p>
                            Users
                        </p>
                    </Sidebar.Item>
                    <Sidebar.Item
                        href="#"
                        icon={HiShoppingBag}
                    >
                        <p>
                            Products
                        </p>
                    </Sidebar.Item>
                    <Sidebar.Item
                        href="#"
                        icon={HiArrowSmRight}
                    >
                        <p>
                            Sign In
                        </p>
                    </Sidebar.Item>
                    <Sidebar.Item
                        href="#"
                        icon={HiTable}
                    >
                        <p>
                            Sign Up
                        </p>
                    </Sidebar.Item> */}
                </Sidebar.ItemGroup>
            </Sidebar.Items>
        </Sidebar>
    </aside>)
}