import { Draggable } from "@hello-pangea/dnd"
import { XMarkIcon, PencilIcon } from "@heroicons/react/20/solid"
import { Button, Label, Modal, TextInput, Textarea } from "flowbite-react"
import { useEffect, useState } from "react"

interface CardProps {
    id: string,
    index: number,
    title?: string | undefined,
    edit: boolean,
    onSave: (newTitle: string) => void,
    cancel: () => void,
    deleteCard?: () => void
}
export default function CardUI({ id, index, title = '', edit, onSave, cancel, deleteCard }: CardProps) {
    const [hover, setHover] = useState(false)
    const [editToggle, setEditToggle] = useState(false)
    const [newCardText, setNewCardText] = useState('')
    const [cardDetailModal, setCardDetailModel] = useState(false)
    const [description, setDescription] = useState('')

    useEffect(() => {
        setNewCardText(title)
    }, [title])

    const save = () => {
        setEditToggle(false)
        onSave(newCardText)
    }

    if (edit || editToggle)
        return <div>
            <input
                className="bg-light-card dark:bg-dark-card rounded-lg px-3 py-2 min-h-[24px] cursor-pointer text-sm shadow w-full"
                value={newCardText}
                onChange={(e) => setNewCardText(e.target.value)}
                onKeyDown={e => (e.key == 'Enter' && newCardText.length > 0) ? save() : e}
            />
            <div className="flex items-center w-full mt-2">
                <Button className="rounded-sm text-sm" size='xs' onClick={() => newCardText.length > 0 ? save() : ''}>
                    {editToggle ? 'Save' : 'Add Card'}
                </Button>
                <XMarkIcon className="w-5 h-5 ml-2 cursor-pointer" onClick={() => editToggle ? setEditToggle(false) : cancel} />
            </div>
        </div>
    else
        return <>
            <Draggable
                draggableId={id}
                index={index}
            >
                {(provided, snapshot) => (
                    <li
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        className="bg-light-card dark:bg-dark-card rounded-lg px-3 py-2 min-h-[24px] cursor-pointer text-sm shadow hover:border-blue-500 hover:border-2 p-2 relative"
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        onClick={() => setCardDetailModel(true)}
                    >
                        {title}
                        {hover && <PencilIcon className="w-3 h-3 top-2 right-1 cursor-pointer absolute" onClick={(e) => { e.stopPropagation(); setEditToggle(true) }} />}
                    </li>
                )}
            </Draggable>
            <Modal show={cardDetailModal} size="4xl" onClose={() => setCardDetailModel(false)} popup>
                <Modal.Header>{title}</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="description" value="Your description" />
                            </div>
                            <Textarea
                                id="description"
                                placeholder="Add your description here"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <Button onClick={deleteCard}>Delete Card</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
}
