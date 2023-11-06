import { useEffect, useState } from "react";
import NewBoard from "./NewBoard";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { Button, Card } from "flowbite-react";
import { Link } from "react-router-dom";

export default function BoardList() {
    const auth = useSelector((state: RootState) => state.auth);
    const [boards, setBoards] = useState<{ id: Number, title: string}[]>([]);

    useEffect(() => {
        getBoards()
    }, [])

    const getBoards = () => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/board/all`, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        }).then(res => setBoards(res.data.data.boards))
    }

    return (<section className="h-full px-[5vh]">
        <header className="flex h-[8vh] justify-between items-center">
            <h1>Boards</h1>
            <NewBoard getBoards={getBoards} />
        </header>
        <section className="h-[72vh] overflow-y-scroll">
            {boards.length > 0 && <section>
                <section className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {boards.map(board => <Card key={board.id+''} className="w-[250px] m-auto my-2 sm:w-[300px]">
                        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            <p>
                                {board.title.length > 20 ? board.title.substring(0, 17) + "..." : board.title}
                            </p>
                        </h5>
                        <Link to={`${board.id}`}>
                            <Button>
                                <p>
                                    View Board
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