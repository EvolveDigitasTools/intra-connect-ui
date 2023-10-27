import { FileInput, Spinner, Textarea } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { FaTelegramPlane } from 'react-icons/fa';
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { PaperClipIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function TicketChat() {
    const [chatMessage, setChatMessage] = useState('');
    const [rows, setRows] = useState(1);
    const [sendLoading, updateSendLoading] = useState(false);
    const auth = useSelector((state: RootState) => state.auth)
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [files, updateFiles] = useState<FileList | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const params = useParams()
    const [messages, setMessages] = useState<{ message: string, createdAt: string, email: string, files: { id: number, fileName: string }[] }[]>([])

    useEffect(() => {
        const element = messagesContainerRef.current;
        if (element)
            element.scrollTop = element.scrollHeight;
    }, [messages]);

    useEffect(() => {
        const getmsgs = setInterval(() => {
            getMessages()
        }, 120000);
        getMessages()

        return () => {
            clearInterval(getmsgs);
        };
    }, [])

    const getMessages = () => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/ticket/${params.ticketId}/chat`, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        }).then(res => {
            console.log(res)
            const chats: { message: string, createdAt: string, email: string, files: { id: number, fileName: string }[] }[] = res.data.data.chats;
            setMessages(chats.map(chat => {
                const date = new Date(chat.createdAt);
                const ISTOffset = 330;  // IST offset UTC +5:30
                const ISTDate = new Date(date.getTime() + (ISTOffset * 60 * 1000));
                const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
                chat.createdAt = ISTDate.toLocaleTimeString('en-IN', options) + ', ' + ISTDate.getDate() + ' ' + ISTDate.toLocaleString('en-IN', { month: 'short' });
                return chat
            }))
        })
    }

    const updateChatMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.preventDefault()
        const message = e.target.value;
        updateRows(message)
        setChatMessage(message)
    }

    const updateRows = (message: string) => {
        setRows(Math.min(message.split('\n').length, 5))
    }

    const handleUploadClick = () => {
        fileInputRef?.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('called')
        const files = e.target.files;
        updateFiles(files)
    };

    const sendMessage = () => {
        updateSendLoading(true);

        const formData = new FormData();

        formData.append("message", chatMessage);

        if (files)
            for (let i = 0; i < files.length; i++)
                formData.append("files", files[i]);
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/ticket/${params.ticketId}/chat`, formData, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        }).then(res => {
            updateSendLoading(false)
            getMessages()
            setChatMessage('')
            setRows(1)
            updateFiles(null)
        })
    }

    return (<section className="sm:w-1/2 flex-grow w-full border-l border-light-border dark:border-dark-border flex flex-col">
        <header className="flex h-[8vh] items-center border-b border-light-border dark:border-dark-border">
            <h2 className="px-2">Ticket Chat</h2>
        </header>
        <section className="flex-grow flex w-full relative bg-light-background-secondry dark:bg-dark-background-secondry">
            <section className="w-full flex-grow overflow-y-auto p-4" ref={messagesContainerRef}>
                {messages.map(message =>
                    <div className={`message-container max-w-[80%] flex w-fit my-2 rounded-lg bg-light-background dark:bg-dark-background ${message.email == auth.user?.email ? 'ml-auto mine' : 'mr-auto other'}`}>
                        {message.email != auth.user?.email && <header className="text-xs text-dark-primary">{message.email.split('@')[0]}</header>}
                        <article className=" text-base whitespace-pre m-1">{message.message}</article>
                        <span className="text-[10px] mt-auto">{message.createdAt}</span>
                    </div>
                )}
            </section>
            <div className="bottom-0 w-full absolute bg-light-background dark:bg-dark-background p-2">
                <div>
                    <FileInput
                        id="files"
                        multiple
                        className={`${files && files.length > 0 ? 'pb-2' : ''}`}
                        ref={fileInputRef}
                        style={{ display: `${files && files.length > 0 ? 'block' : 'none'}` }}
                        onChange={handleFileChange}
                    />
                </div>
                <div className="flex items-center">
                    <Textarea
                        value={chatMessage}
                        onChange={(e) => updateChatMessage(e)}
                        className="w-10/12 resize-none"
                        rows={rows}
                    />
                    <PaperClipIcon
                        className="w-1/12 h-8 cursor-pointer hov:bg-trans py-1 rounded-lg hover:bg-opacity-50 hover:bg-dark-text mx-1"
                        onClick={handleUploadClick}
                    />
                    {sendLoading ?
                        <Spinner /> :
                        <FaTelegramPlane
                            className="w-1/12 h-8 cursor-pointer hov:bg-trans py-1 rounded-lg hover:bg-opacity-50 hover:bg-dark-text mx-1"
                            onClick={sendMessage}
                        />
                    }
                </div>
            </div>
        </section>
    </section>)
}