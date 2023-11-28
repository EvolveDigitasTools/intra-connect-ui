import { ArrowUturnLeftIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import { Badge, Button, Spinner, Tooltip } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { RootState } from "../../app/store";
import { TicketDetail } from "../../interface";
import { binaryStringToBlob, getMimeTypeFromFileName } from "../../utils";
import TicketChat from "./TicketChat";

export default function TicketDetailUI() {
    const auth = useSelector((state: RootState) => state.auth);
    const params = useParams()
    const [ticket, setTicket] = useState<TicketDetail | null>(null)
    const [files, setFiles] = useState<{ [key: number]: File } | null>(null)
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        getTicket();

    }, [])

    const getTicket = async () => {
        try {
            const ticketId = params.ticketId;
            const ticketRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/ticket/${ticketId}`, {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            })
            const ticket: TicketDetail = ticketRes.data.data.ticket
            const files: { [key: number]: File } = {}
            for (let i = 0; i < ticket.files.length; i++) {
                const fileDetails = ticket.files[i]
                const fileDetailsUrl = `${process.env.REACT_APP_BACKEND_URL}/files/${fileDetails.id}`
                const fileResponse = await fetch(fileDetailsUrl);
                const fileJson = await fileResponse.json();
                const file = await fileJson?.data?.file
                let fileData = new File([binaryStringToBlob(file.fileContent, getMimeTypeFromFileName(file.fileName))], file.fileName, { type: getMimeTypeFromFileName(file.fileName) });
                files[fileDetails.id] = fileData
            }
            setFiles(files)
            setTicket(ticket)
            setLoading(false)
        } catch (error) {
            console.error(error)
        }
    }

    const viewAttachment = async (fileId: number) => {
        try {

            if (files) {
                const url = URL.createObjectURL(files[fileId]);
                window.open(url, "_blank");
                URL.revokeObjectURL(url);
            }
        }
        catch (error) {
            console.error(error)
        }
    }

    if (loading)
        return (<section className="w-full h-full flex justify-center items-center">
            <Spinner size="xl" />
        </section>)

    return (<section className="h-full flex sm:flex-row flex-col">
        <section className="sm:h-full sm:w-1/2 w-full">
            <header className="flex h-[8vh] items-center border-b border-light-border dark:border-dark-border">
                <Link className="h-full flex justify-center items-center w-[5vh] border-r hover:bg-dark-secondry-button border-light-border dark:border-dark-border" to={'/dashboard/tickets'}><nav><ArrowUturnLeftIcon className="w-3 h-3" /></nav></Link>
                <Tooltip content={ticket?.title}><h1 className="px-2">{ticket ? ticket.title.length > 20 ? ticket.title.substring(0, 20) + "..." : ticket.title: ""} - </h1></Tooltip>
                <Badge>{ticket?.status}</Badge>
            </header>
            <section className="px-[5vh]">
                <article className="p-2">
                    {ticket?.description}
                </article>
                {ticket && ticket.files.length > 0 && <section className="flex p-2">
                    <label>Attachments: </label>
                    {ticket.files.map(file => <Badge className="m-1 cursor-pointer" onClick={() => viewAttachment(file.id)}>{file.fileName}</Badge>)}
                </section>}
                <section className="flex p-2">
                    <label>Assignees: </label>
                    {ticket?.assignees.map(assignee => <Badge className="m-1 cursor-pointer">{assignee.email}</Badge>)}
                    {ticket?.assignedDepartments.map(department => <Badge className="m-1 cursor-pointer">{department.name}</Badge>)}
                </section>
                <section className="flex p-2">
                    <label>Created By: </label>
                    <Badge className="m-1 cursor-pointer">{ticket?.creator.email}</Badge>
                </section>
            </section>
        </section>
        <TicketChat />
    </section>)
}