import axios from "axios";
import { Button, Card } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { TicketBrief } from "../../interface";
import { Link } from "react-router-dom";
import NewTicket from "./NewTicket";

export default function Ticket() {
    const auth = useSelector((state: RootState) => state.auth);
    const [activeTickets, setActiveTickets] = useState<TicketBrief[]>([]);
    const [closedTickets, setClosedTickets] = useState<TicketBrief[]>([]);

    useEffect(() => {
        getTickets()
    }, []);

    const getTickets = () => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/ticket/all`, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        }).then(res => {
            const tickets: TicketBrief[] = res.data.data.tickets
            setActiveTickets(tickets.filter(ticket => ticket.status == "open"));
        })
    }

    return (<section className="h-full">
        <header className="flex h-[8vh] justify-between items-center">
            <h1>Tickets</h1>
            <NewTicket getTickets={getTickets} />
        </header>
        <section className="h-[72vh] overflow-y-scroll">
            {activeTickets.length > 0 && <section>
                <h2>Active Tickets</h2>
                <section className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {activeTickets.map(ticket => <Card className="w-[250px] m-auto my-2 sm:w-[300px]">
                        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            <p>
                                {ticket.title.length > 20 ? ticket.title.substring(0, 17) + "..." : ticket.title}
                            </p>
                        </h5>
                        <p className="font-normal text-gray-700 dark:text-gray-400">
                            <p>
                                {ticket.description.length > 50 ? ticket.description.substring(0, 47) + "..." : ticket.description}
                            </p>
                        </p>
                        <Link to={`${ticket.id}`}>
                            <Button>
                                <p>
                                    Open Ticket
                                </p>
                            </Button>
                        </Link>
                    </Card>
                    )}
                </section>
            </section>}
        </section>
    </section >)
}