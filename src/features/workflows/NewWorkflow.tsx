import { PlusIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import { Button, Label, Modal, TextInput, Textarea } from "flowbite-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { Notification } from "../../interface";
import { addNotification } from "../notificationService/notificationSlice";
import { useNavigate } from "react-router-dom";
import MultiSelectAutoComplete from "../../components/MultiSelectAutoComplete";

const departments = ['All', 'Client Servicing', 'Creative', 'Digital Marketing', 'E Commerce', 'Finance', 'Human Resources', 'IT']

export default function NewWorkflow() {
    const [newWorkflowModal, setNewWorkflowModal] = useState(false);
    const [newWorkflowLoading, setNewWorkflowLoading] = useState(false);
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const auth = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const toggleNewWorkflowModal = () => {
        setNewWorkflowModal(!newWorkflowModal);
    }

    const newWorkflow = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setNewWorkflowLoading(true)

        const formData = new FormData();

        formData.append("name", name);
        formData.append("description", description);
        formData.append("departments", JSON.stringify(selectedDepartments));

        axios.post(`${process.env.REACT_APP_BACKEND_URL}/workflow/new`, formData, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        }).then(res => {
            setNewWorkflowLoading(false)
            setNewWorkflowModal(false)
            setName('')
            setDescription('')
            const notification: Notification = {
                id: new Date().getTime(),
                message: 'New Workflow created',
                type: 'success',
                timed: true
            }
            dispatch(addNotification(notification))
            navigate(`/dashboard/workflow/${res.data.data.workflow.id}`)
        })
    }

    return (<>
        <Button onClick={toggleNewWorkflowModal} pill><PlusIcon className="w-3 h-3" /></Button>
        <Modal
            show={newWorkflowModal}
            size="md"
            popup
            onClose={() => toggleNewWorkflowModal()}
        >
            <Modal.Header>Create New Workflow</Modal.Header>
            <Modal.Body>
                <form onSubmit={newWorkflow}>
                    <div className="w-full p-2">
                        <div className="mb-2 block"><Label htmlFor="name" value="Name" /></div>
                        <TextInput value={name} onChange={(e) => setName(e.target.value)} id="name" placeholder="Name of your workflow" required />
                    </div>
                    <div className="w-full p-2">
                        <div className="mb-2 block"><Label htmlFor="description" value="Description" /></div>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} id="description" placeholder="Describe your workflow" required />
                    </div>
                    <div className="w-full p-2">
                        <div className="mb-2 block"><Label htmlFor="department" value="Department" /></div>
                        <MultiSelectAutoComplete 
                            id="departments"
                            required
                            value={selectedDepartments}
                            allItems={departments}
                            onChange={items => setSelectedDepartments(items)}
                        />
                    </div>
                    <div className="w-full p-2">
                        <Button isProcessing={newWorkflowLoading} className="w-full" type="submit">Create Workflow</Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    </>
    )
}