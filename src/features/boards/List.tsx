import { Card, List } from "../../interface"
import { BsThreeDots, BsPlus } from 'react-icons/bs'
import CardUI from "./Card"
import { Draggable, Droppable } from "@hello-pangea/dnd"
import { useState } from "react"

interface ListProps {
    list: List,
    cards: Card[], 
    index: number, 
    addNewCard: (listId: number, cardText: string) => void,
    updateCardText: (cardId: number, updatedText: string) => void
}

export default function ListUI({ list, cards, index, addNewCard, updateCardText }: ListProps) {
    const [isNewOpen, setNewOpen] = useState(false)

    const newCard = (newCardText: string) => {
        addNewCard(list.id, newCardText)
        setNewOpen(false)
    }

    return <Draggable draggableId={list.boardListId + ''} index={index}>
        {provided => (
            <div
                className="bg-light-list text-black dark:text-white dark:bg-dark-list rounded-xl shadow min-w-[270px] mx-2 h-fit"
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                ref={provided.innerRef}
            >
                <header {...provided.dragHandleProps} className="flex gap-x-1 p-2 relative flex-grow-0 flex-shrink-0 justify-between items-start flex-wrap">
                    <h3 className=" text-sm px-2 py-1">{list?.title}</h3>
                    <button className="p-2"><BsThreeDots /></button>
                </header>
                <Droppable droppableId={'list-' + list?.boardListId} type="card">
                    {(provided, snapshot) => (
                        <ol
                            className={`flex flex-col mx-1 px-1 gap-y-2 ${isNewOpen ? '' : 'min-h-[10px]'}`}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {cards.map((card, index) => (
                                <CardUI
                                    key={card.boardCardId}
                                    id={'card-' + card.boardCardId}
                                    index={index}
                                    title={card?.title}
                                    edit={false}
                                    onSave={(newTitle) => updateCardText(card.boardCardId, newTitle)}
                                    cancel={() => setNewOpen(false)}
                                />
                            ))}
                            {provided.placeholder}
                        </ol>
                    )}
                </Droppable>
                <div className="flex items-center p-2 justify-between">
                    {isNewOpen ? <div className="w-full">
                        <div className="flex flex-col w-full">
                            <CardUI
                                id={'0'}
                                index={0}
                                edit={true}
                                onSave={newCard}
                                cancel={() => setNewOpen(false)}
                            />
                        </div>
                    </div> : <button onClick={() => setNewOpen(true)} className="px-2 py-1 flex items-center text-sm hover:bg-light-list-action-hover dark:hover:bg-dark-list-action-hover rounded-lg w-full"><BsPlus className="mr-2" />Add a card</button>}
                </div>
            </div>
        )}
    </Draggable>
}