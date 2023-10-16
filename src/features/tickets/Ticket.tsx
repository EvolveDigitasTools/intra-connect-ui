import { PlusIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import { Button, Checkbox, Label, Modal, TextInput, Textarea } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

export default function Ticket() {
    const [newTicketOpen, setNewTicket] = useState(false);
    const auth = useSelector((state: RootState) => state.auth);
    const [selectedAssignees, setSelectedAssignees] = useState([]);
    const [assigneeInput, setAssigneeInput] = useState('');
    let assignees = []

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/assignees`, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        }).then(res => {
            assignees = res.data.data.assignees;
        })
    }, []);

    const toggleNewTicketModal = () => {
        setNewTicket(!newTicketOpen);
    }
    return (<section>
        <header className="flex justify-between items-center mb-4">
            <h1>Tickets</h1>
            <Button onClick={toggleNewTicketModal} pill><PlusIcon className="w-3 h-3" /></Button>
        </header>
        <Modal
            show={newTicketOpen}
            size="md"
            popup
            onClose={() => toggleNewTicketModal()}
        >
            <Modal.Header>Raise New Ticket</Modal.Header>
            <Modal.Body>
                <form>
                    <div>
                        <Label htmlFor="title" value="Problem Title" />
                        <TextInput id="title" placeholder="Title for your problem" required />
                    </div>
                    <div>
                        <Label htmlFor="description" value="Problem Description" />
                        <Textarea id="description" placeholder="Describe your problem" required />
                    </div>
                    <div>
                        <Label htmlFor="assignees" value="Assignees" />
                        <TextInput id="assignees" placeholder="Mention assignees" required />
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            className="border border-gray-300 rounded-lg p-2 pl-8"
                            placeholder="Search..."
                        />
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                            <span className="bg-blue-500 text-white text-xs font-bold py-1 px-2 rounded-full">
                                Badge
                            </span>
                        </div>
                    </div>

                    <div className="w-full">
                        <Button type="submit">Raise Ticket</Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    </section>)
}