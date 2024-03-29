import { PlusIcon, XMarkIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import { Button, Spinner, TextInput, Tooltip } from "flowbite-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "../../app/store";
import { BoardDetail, Card, List, Notification } from "../../interface";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import ListUI from "./List";
import { getNextAvailableId } from "../../utils";
import { addNotification } from "../notificationService/notificationSlice";

export default function BoardUI() {
    const auth = useSelector((state: RootState) => state.auth);
    const params = useParams()
    const [addListPromptOpen, setListPromptOpen] = useState(false)
    const [listName, setListName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [editBoard, setEditBoard] = useState(false)
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [board, setBoard] = useState<BoardDetail>({
        id: 0,
        title: 'Board',
        lists: [],
        listOrder: '[]',
        cards: []
    })
    const dispatch = useDispatch()

    useEffect(() => {
        getBoard();
    }, []);

    useEffect(() => {
        if (!isInitialLoad) {
            setEditBoard(true);
        }
    }, [board])

    console.log('board', board)

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
            setEditBoard(false)
            setIsInitialLoad(false)
            setLoading(false)
        } catch (error) {
            console.error(error)
        }
    }

    const onDragEnd = (result: any) => {
        const { destination, source, draggableId, type } = result;

        if (!destination) {
            return;
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        if (type === 'list') {
            const newListOrder = JSON.parse(board.listOrder);
            newListOrder.splice(Number(source.index), 1);
            newListOrder.splice(Number(destination.index), 0, Number(draggableId));

            const newBoardData: BoardDetail = {
                ...board,
                listOrder: JSON.stringify(newListOrder),
            };
            setBoard(newBoardData);
            return;
        }

        const homeListIndex = board.lists.findIndex(list => list.id === Number(source.droppableId.split('-')[1]))
        const foreignListIndex = board.lists.findIndex(list => list.id === Number(destination.droppableId.split('-')[1]))

        if (!(homeListIndex >= 0 && foreignListIndex >= 0))
            return

        const updatedLists = board.lists.slice();
        if (homeListIndex == foreignListIndex) {
            const cardOrder = JSON.parse(updatedLists[homeListIndex].cardOrder)
            cardOrder.splice(Number(source.index), 1);
            cardOrder.splice(Number(destination.index), 0, Number(draggableId.split('-')[1]));
            updatedLists[homeListIndex].cardOrder = JSON.stringify(cardOrder)
        }
        else {
            const homeListCardOrder = JSON.parse(updatedLists[homeListIndex].cardOrder)
            const foreignListCardOrder = JSON.parse(updatedLists[foreignListIndex].cardOrder)
            homeListCardOrder.splice(Number(source.index), 1);
            foreignListCardOrder.splice(Number(destination.index), 0, Number(draggableId.split('-')[1]));
            updatedLists[homeListIndex].cardOrder = JSON.stringify(homeListCardOrder)
            updatedLists[foreignListIndex].cardOrder = JSON.stringify(foreignListCardOrder)
        }

        const updatedBoardData: BoardDetail = {
            ...board,
            lists: updatedLists
        };

        setBoard(updatedBoardData);
    }

    const addAnother = () => {
        const newListName = listName;
        if (newListName.length == 0)
            return
        const updatedLists = board.lists.slice();
        const listOrder = JSON.parse(board.listOrder)
        const newList: List = {
            id: getNextAvailableId(board.lists),
            title: newListName,
            cardOrder: '[]',
        }
        listOrder.push(newList.id);
        updatedLists.push(newList)
        const updatedBoardData: BoardDetail = {
            ...board,
            lists: updatedLists,
            listOrder: JSON.stringify(listOrder)
        }
        setBoard(updatedBoardData)
        setListName('')
        setListPromptOpen(false)
    }

    const addNewCard = (listId: number, newCardText: string) => {
        const updatedLists = board.lists.slice();
        const updatedCards = board.cards.slice();
        const listIndex = board.lists.findIndex((list) => list.id == listId)
        const cardOrder = JSON.parse(board.lists[listIndex].cardOrder)
        const newCard: Card = {
            id: getNextAvailableId(board.cards),
            title: newCardText
        }
        cardOrder.push(newCard.id);
        updatedCards.push(newCard)
        updatedLists[listIndex].cardOrder = JSON.stringify(cardOrder)
        const updatedBoardData: BoardDetail = {
            ...board,
            cards: updatedCards,
            lists: updatedLists
        }
        setBoard(updatedBoardData)
    }

    const updateCardText = (cardId: number, updatedText: string) => {
        const updatedCards = board.cards.slice();
        const cardIndex = updatedCards.findIndex(card => card.id == cardId);
        if (cardIndex !== -1)
            updatedCards[cardIndex].title = updatedText;

        const updatedBoardData: BoardDetail = {
            ...board,
            cards: updatedCards
        }
        setBoard(updatedBoardData)
    }

    const deleteList = (listId: number) => {
        const updatedLists = board.lists.slice();
        const listOrder: number[] = JSON.parse(board.listOrder)
        listOrder.splice(listOrder.findIndex(listId => listId == listId), 1)
        updatedLists.slice(updatedLists.findIndex(list => list.id == listId), 1)
        const updatedBoardData: BoardDetail = {
            ...board,
            lists: updatedLists,
            listOrder: JSON.stringify(listOrder)
        }
        setBoard(updatedBoardData)
    }

    const deleteCard = (cardId: number, listId: number) => {
        const updatedLists = board.lists.slice();
        const listIndex = updatedLists.findIndex(list => list.id == listId)
        const cardOrder: number[] = JSON.parse(updatedLists[listIndex].cardOrder)
        cardOrder.splice(cardOrder.findIndex(id => id == cardId), 1)
        updatedLists[listIndex].cardOrder = JSON.stringify(cardOrder)
        const updatedBoardData: BoardDetail = {
            ...board,
            lists: updatedLists
        }
        setBoard(updatedBoardData)
    }

    const saveBoard = () => {
        setSaveLoading(true)
        const formData = new FormData();

        const lists: {
            boardListId: number,
            cardOrder: string,
            title: string
        }[] = board.lists.map(list => {
            return {
                boardListId: list.id,
                cardOrder: list.cardOrder,
                title: list.title
            }
        })

        const cards: {
            boardCardId: number,
            id: number,
            title: string
        }[] = board.cards.map(card => {
            return {
                boardCardId: card.id,
                id: card.mainId ?? 0,
                title: card.title
            }
        })

        formData.append("listOrder", board.listOrder);
        formData.append("lists", JSON.stringify(lists));
        formData.append("cards", JSON.stringify(cards));

        axios.post(`${process.env.REACT_APP_BACKEND_URL}/board/${board.id}`, formData, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        }).then(res => {
            setSaveLoading(false)
            setEditBoard(false)
            const notification: Notification = {
                id: new Date().getTime(),
                message: 'Saved',
                type: 'success',
                timed: true
            }
            dispatch(addNotification(notification))
        })
    }

    if (loading)
        return (<section className="w-full h-full flex justify-center items-center">
            <Spinner size="xl" />
        </section>)

    return (<section className="h-full flex">
        <section className="h-full w-full">
            <header className="flex h-[8vh] p-3 items-center border-b border-light-border dark:border-dark-border justify-between">
                <Tooltip content={board?.title}><h1 className="px-2">{board ? board.title.length > 20 ? board.title.substring(0, 20) + "..." : board.title : ""}</h1></Tooltip>
                {editBoard && <Button size='xs' isProcessing={saveLoading} onClick={() => saveBoard()}>Save Board</Button>}
            </header>
            <DragDropContext
                onDragEnd={onDragEnd}
            >
                <Droppable
                    droppableId="all-lists"
                    direction="horizontal"
                    type="list"
                >
                    {provided => (
                        <section
                            className="p-[5vh] inline-flex w-full h-[calc(100%-8vh)] overflow-scroll"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            <ol className="inline-flex" style={{ minWidth: `${286 * JSON.parse(board.listOrder).length}px` }}>
                                {JSON.parse(board.listOrder).map((listId: number, index: number) => {
                                    let list = board.lists.find(list => list.id == listId);
                                    if (!list)
                                        list = { id: 0, cardOrder: '[]', title: 'Error List' }
                                    const cards = JSON.parse(list.cardOrder).map((cardId: number) => board.cards.find(card => card.id == cardId) as Card)
                                    return (
                                        <ListUI
                                            key={list.id}
                                            list={list}
                                            cards={cards}
                                            index={index}
                                            addNewCard={addNewCard}
                                            updateCardText={updateCardText}
                                            deleteList={deleteList}
                                            deleteCard={deleteCard}
                                        />
                                    );
                                })}
                            </ol>
                            {addListPromptOpen ?
                                <div className="min-w-[270px] h-fit p-2 bg-light-list text-black dark:text-white dark:bg-dark-list rounded-xl shadow mx-2">
                                    <div className="flex items-center">
                                        <TextInput
                                            placeholder="Enter List Title ..."
                                            className="w-full"
                                            theme={{
                                                field: {
                                                    input: {
                                                        base: "!rounded-none !rounded-sm w-full h-8"
                                                    }
                                                }
                                            }}
                                            onKeyDown={e => e.key == 'Enter' ? addAnother() : e}
                                            value={listName}
                                            onChange={e => setListName(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center w-full mt-2">
                                        <Button className="rounded-sm text-sm" size='xs' onClick={addAnother}>
                                            Add List
                                        </Button>
                                        <XMarkIcon className="w-5 h-5 ml-2 cursor-pointer" onClick={() => setListPromptOpen(false)} />
                                    </div>
                                </div> :
                                <div className="min-w-[270px]">
                                    <Button
                                        className="w-full p-0"
                                        onClick={() => setListPromptOpen(true)}
                                    ><PlusIcon className="h-4 mr-1" />Add Another List</Button>
                                </div>
                            }
                            {provided.placeholder}
                        </section>
                    )}
                </Droppable>
            </DragDropContext>
        </section>
    </section>)
}