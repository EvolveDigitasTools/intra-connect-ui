import { ArrowUturnLeftIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import { Spinner, Tooltip } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { RootState } from "../../app/store";
import { BoardDetail } from "../../interface";

export default function TicketDetailUI() {
    const auth = useSelector((state: RootState) => state.auth);
    const params = useParams()
    const [board, setBoard] = useState<BoardDetail | null>(null)
    const [files, setFiles] = useState<{ [key: number]: File } | null>(null)
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        getBoard();

    }, [])

    const getBoard = async () => {
        try {
            const boardId = params.boardId;
            const boardRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/board/${boardId}`, {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            })
            const board: BoardDetail = boardRes.data.data.board
            setBoard(board)
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

    return (<section className="h-full flex">
        <section className="h-full w-full">
            <header className="flex h-[8vh] items-center border-b border-light-border dark:border-dark-border">
                <Link className="h-full flex justify-center items-center w-[5vh] border-r hover:bg-dark-secondry-button border-light-border dark:border-dark-border" to={'/dashboard/tickets'}><nav><ArrowUturnLeftIcon className="w-3 h-3" /></nav></Link>
                <Tooltip content={board?.title}><h1 className="px-2">{board ? board.title.length > 20 ? board.title.substring(0, 20) + "..." : board.title: ""}</h1></Tooltip>
            </header>
            <section className="px-[5vh]">

            </section>
        </section>
    </section>)
}