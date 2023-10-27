import NewBoard from "./NewBoard";

export default function BoardList() {
    return (<section className="h-full px-[5vh]">
        <header className="flex h-[8vh] justify-between items-center">
            <h1>Boards</h1>
            <NewBoard />
        </header>
        <section className="h-[72vh] overflow-y-scroll">
            {/* {activeTickets.length > 0 && <section>
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
            </section>} */}
        </section>
    </section >)
}