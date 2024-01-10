import { PlusIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import { Badge, Button, FileInput, Label, ListGroup, Modal, TextInput, Textarea, Tooltip } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { Notification } from "../../interface";
import { addNotification } from "../notificationService/notificationSlice";
import { ListGroupItem } from "flowbite-react/lib/esm/components/ListGroup/ListGroupItem";
import MultiSelectAutoComplete from "../../components/MultiSelectAutoComplete";

export default function NewTicket({ getTickets }: { getTickets: () => void }) {
    const [newTicketOpen, setNewTicket] = useState(false);
    const [newTicketLoading, setNewTicketLoading] = useState(false);
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
    const [files, updateFiles] = useState<FileList | null>(null);
    const [assigneeInput, setAssigneeInput] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [allAssignees, setAllAssignees] = useState<string[]>([]);
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
            setAllAssignees(res.data.data.assignees);
        })
    }, [])

    const toggleNewTicketModal = () => {
        setNewTicket(!newTicketOpen);
    }

    const newTicket = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setNewTicketLoading(true)

        const formData = new FormData();

        formData.append("title", title);
        formData.append("description", description);
        formData.append("assignees", JSON.stringify(selectedAssignees));

        if (files)
            for (let i = 0; i < files.length; i++)
                formData.append("files", files[i]);
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/ticket/new`, formData, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        }).then(res => {
            setNewTicketLoading(false)
            setNewTicket(false)
            const notification: Notification = {
                id: new Date().getTime(),
                message: 'New Ticket created',
                type: 'success',
                timed: true
            }
            dispatch(addNotification(notification))
            getTickets()
        })
    }

    const handleRemoveAssignee = (person: string) => {
        setSelectedAssignees(selectedAssignees.filter(assignee => assignee !== person));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAssigneeInput(e.target.value);
        if (e.target.value) {
            const searchRegex = new RegExp(e.target.value, 'i');
            setSuggestions(allAssignees.filter(person => searchRegex.test(person.split('@')[0])));
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
        if (!selectedAssignees.includes(person)) {
            setSelectedAssignees([...selectedAssignees, person]);
        }
        setAssigneeInput('');
        setSuggestions([]);
        setListIndex(-1);
    };

    return (<>
        <Button onClick={toggleNewTicketModal} pill><PlusIcon className="w-3 h-3" /></Button>
        <Modal
            show={newTicketOpen}
            size="md"
            popup
            onClose={() => toggleNewTicketModal()}
        >
            <Modal.Header>Raise New Ticket</Modal.Header>
            <Modal.Body>
                <form onSubmit={newTicket}>
                    <div className="w-full p-2">
                        <div className="mb-2 block"><Label htmlFor="title" value="Problem Title" /></div>
                        <TextInput value={title} onChange={(e) => setTitle(e.target.value)} id="title" placeholder="Title for your problem" required />
                    </div>
                    <div className="w-full p-2">
                        <div className="mb-2 block"><Label htmlFor="description" value="Problem Description" /></div>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} id="description" placeholder="Describe your problem" required />
                    </div>
                    <div className="w-full p-2">
                        <div className="mb-2 block"><Label htmlFor="files" value="Add Attachments(optional)" /></div>
                        <FileInput
                            id="files"
                            multiple
                            onChange={(e) => updateFiles(e.target.files)}
                            helperText="Size of files should be less than 2 mb"
                        />
                    </div>
                    <div className="w-full p-2">
                        <div className="mb-2 block"><Label htmlFor="assignees" value="Add Assignees" /></div>
                        <MultiSelectAutoComplete
                            id="assignees"
                            value={selectedAssignees}
                            allItems={allAssignees}
                            onChange={items => setSelectedAssignees(items)}
                            rules={{
                                selectedItem: (item) => item.split('@')[0]
                            }}
                            required
                        />
                    </div>
                    <div className="w-full p-2">
                        <Button isProcessing={newTicketLoading} className="w-full" type="submit">Raise Ticket</Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    </>
    )
}