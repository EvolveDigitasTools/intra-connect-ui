import { PlusIcon } from "@heroicons/react/20/solid";
import { Badge, Button, Label, ListGroup, Modal, TextInput, Tooltip } from "flowbite-react";
import { ListGroupItem } from "flowbite-react/lib/esm/components/ListGroup/ListGroupItem";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import axios from "axios";
import { Notification } from "../../interface";
import { addNotification } from "../notificationService/notificationSlice";

export default function NewBoard() {
    const [newBoardModalOpen, updateNewBoardModalOpen] = useState(false);
    const [newBoardLoading, setNewBoardLoading] = useState(false);
    const [title, setTitle] = useState('')
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);;
    const [memberInput, setMemberInput] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [allMembers, setAllMembers] = useState<string[]>([]);
    const [listIndex, setListIndex] = useState(-1);
    const listClearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const auth = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch()

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/assignees`, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        }).then(res => {
            setAllMembers(res.data.data.assignees);
        })
    }, [])

    const toggleNewBoardModal = () => {
        updateNewBoardModalOpen(!newBoardModalOpen);
    }

    const newBoard = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setNewBoardLoading(true)

        const formData = new FormData();

        formData.append("title", title);
        formData.append("members", JSON.stringify(selectedMembers));
        
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/board/new`, formData, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        }).then(res => {
            console.log(res)
            setNewBoardLoading(false);
            updateNewBoardModalOpen(false);
            const notification: Notification = {
                id: new Date().getTime(),
                message: 'New Modal created',
                type: 'success',
                timed: true
            }
            dispatch(addNotification(notification))
        })
    }

    const handleRemoveMember = (person: string) => {
        setSelectedMembers(selectedMembers.filter(member => member !== person));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMemberInput(e.target.value);
        if (e.target.value) {
            const searchRegex = new RegExp(e.target.value, 'i');
            setSuggestions(allMembers.filter(person => searchRegex.test(person.split('@')[0])));
            setListIndex(-1)
        } else {
            setSuggestions([]);
            setListIndex(-1)
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown')
            setListIndex((listIndex + 1) % suggestions.length);
        else if (e.key === 'ArrowUp')
            setListIndex((listIndex + suggestions.length - 1) % suggestions.length);
        else if (e.key === 'Enter' && listIndex >= 0) {
            e.preventDefault()
            handleSuggestionClick(suggestions[listIndex])
        }
    };

    const handleSuggestionClick = (person: string) => {
        if (listClearTimeoutRef.current)
            clearTimeout(listClearTimeoutRef.current);
        if (!selectedMembers.includes(person)) {
            setSelectedMembers([...selectedMembers, person]);
        }
        setMemberInput('');
        setSuggestions([]);
        setListIndex(-1);
    };

    return (<>
        <Button onClick={toggleNewBoardModal} pill><PlusIcon className="w-3 h-3" /></Button>
        <Modal
            show={newBoardModalOpen}
            size="md"
            popup
            onClose={() => toggleNewBoardModal()}
        >
            <Modal.Header>Add New Board</Modal.Header>
            <Modal.Body>
                <form onSubmit={newBoard}>
                    <div className="w-full p-2">
                        <div className="mb-2 block"><Label htmlFor="title" value="Board Title" /></div>
                        <TextInput value={title} onChange={(e) => setTitle(e.target.value)} id="title" placeholder="Title for board" required />
                    </div>
                    <div className="w-full p-2">
                        <div className="mb-2 block"><Label htmlFor="assignees" value="Add Assignees" /></div>
                        <TextInput
                            id="members"
                            addon={selectedMembers.map((member, index) => (
                                <Tooltip key={index} content={member}>
                                    <Badge className="hover:cursor-pointer border" onClick={() => handleRemoveMember(member)}>
                                        {member.split('@')[0].replace(' ', '')}
                                    </Badge>
                                </Tooltip>
                            ))}
                            theme={{ addon: "max-w-[60%] min-w-[60%] flex-wrap inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400" }}
                            placeholder="Search Members" type="text"
                            value={memberInput}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onBlur={() => {
                                listClearTimeoutRef.current = setTimeout(() => {
                                    setMemberInput(''); setSuggestions([]); setListIndex(-1);
                                }, 500);
                            }}
                            autoComplete="off"
                            required={selectedMembers.length == 0}
                        />
                        {suggestions.length > 0 && (
                            <ListGroup>
                                {suggestions.map((suggestion, index) => (
                                    <ListGroupItem key={index} tabIndex={index} active={index == listIndex} onClick={() => handleSuggestionClick(suggestion)}>{suggestion}</ListGroupItem>
                                ))}
                            </ListGroup>
                        )}
                    </div>
                    <div className="w-full p-2">
                        <Button isProcessing={newBoardLoading} className="w-full" type="submit">Create Board</Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    </>
    )
}