import { ArrowUturnLeftIcon } from "@heroicons/react/20/solid";
import { IoClose } from 'react-icons/io5';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import axios from "axios";
import { Badge, Button, Modal, Spinner, Tooltip } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../app/store";
import { TicketDetail } from "../../interface";
import { binaryStringToBlob, getMimeTypeFromFileName } from "../../utils";
import TicketChat from "./TicketChat";

export default function TicketDetailUI() {
    const auth = useSelector((state: RootState) => state.auth);
    const params = useParams()
    const [ticket, setTicket] = useState<TicketDetail | null>(null)
    const [closeTicketModalStatus, setCloseTicketModalStatus] = useState(false);
    const [files, setFiles] = useState<{ [key: number]: File } | null>(null)
    const [loading, setLoading] = useState(true);
    const [closeLoading, setCloseLoading] = useState(false)
    const navigate = useNavigate()

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
                const fileResponse = await axios.get(fileDetailsUrl, {
                    headers: {
                        Authorization: `Bearer ${auth.token}`
                    }
                });
                const file = await fileResponse?.data?.data?.file
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

    const closeTicket = async () => {
        setCloseLoading(true)
        const closeTicket = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/ticket/${ticket?.id}/close`, null, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        });
        setCloseTicketModalStatus(false)
        setCloseLoading(false)
        if (closeTicket.data.success) {
            navigate('/dashboard/tickets')
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
                <Tooltip content={ticket?.title}><h1 className="px-2">{ticket ? ticket.title.length > 20 ? ticket.title.substring(0, 20) + "..." : ticket.title : ""} - </h1></Tooltip>
                <Badge className="mr-auto">{ticket?.status}</Badge>
                {ticket?.status == 'open' && <Button
                    color="failure"
                    size="xs"
                    className="m-1"
                    outline
                    onClick={() => setCloseTicketModalStatus(true)}
                >
                    <IoClose className="h-4 w-4" />
                </Button>}
            </header>
            <section className="px-[5vh]">
                <article className="p-2">
                    {ticket?.description}
                </article>
                {ticket && ticket.files.length > 0 && <section className="flex p-2">
                    <label>Attachments: </label>
                    {ticket.files.map(file => <Badge key={file.id} className="m-1 cursor-pointer" onClick={() => viewAttachment(file.id)}>{file.fileName}</Badge>)}
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
        <Modal show={closeTicketModalStatus} size="md" onClose={() => setCloseTicketModalStatus(false)} popup>
            <Modal.Header />
            <Modal.Body>
                <div className="text-center">
                    <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        Are you sure you want to close this ticket?
                    </h3>
                    <div className="flex justify-center gap-4">
                        <Button color="failure" onClick={() => closeTicket()} isProcessing={closeLoading}>
                            {"Yes, I'm sure"}
                        </Button>
                        <Button color="gray" onClick={() => setCloseTicketModalStatus(false)}>
                            No, cancel
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    </section>)
}