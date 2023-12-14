import { Button, Label, Modal, TextInput, Textarea } from "flowbite-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Notification, TaskDetails } from "../../interface";
import { addNotification } from "../notificationService/notificationSlice";
import MultiSelectAutoComplete from "../../components/MultiSelectAutoComplete";

interface NewTaskProps {
    existingAssignees: string[],
    taskModalState: 'none' | 'new' | 'update',
    closeTaskModal: () => void
    taskModalAction: (task: string, description: string, assigneesDesignation: string[]) => Promise<boolean>
    taskDetails?: TaskDetails
}

export default function TaskModal({ existingAssignees, taskModalState, closeTaskModal, taskModalAction, taskDetails }: NewTaskProps) {
    const [task, setTask] = useState('')
    const [description, setDescription] = useState('')
    const [assigneesDesignation, setAssigneesDesgnation] = useState<string[]>([])
    const [submitLoading, setSubmitLoading] = useState(false)
    const dispatch = useDispatch()

    useEffect(() => {
        setTask(taskDetails?.task ?? '')
        setDescription(taskDetails?.description ?? '')
        setAssigneesDesgnation(taskDetails?.assigneesDesignation ?? [])
    }, [taskDetails?.task, taskDetails?.description, taskDetails?.assigneesDesignation])

    const formSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitLoading(true)
        const isActionSuccessful = await taskModalAction(task, description, assigneesDesignation)
        if (!isActionSuccessful) {
            const notification: Notification = {
                id: new Date().getTime(),
                message: 'Some error occured please try again after sometime or contact admin',
                type: 'error',
                timed: false
            }
            dispatch(addNotification(notification))
        }
        setTask('')
        setDescription('')
        setAssigneesDesgnation([])
        setSubmitLoading(false)
    }

    return (<Modal show={taskModalState != 'none'} size="md" onClose={closeTaskModal} popup>
        <Modal.Header>{taskModalState == 'new' ? 'Add New Task' : 'Update Task'}</Modal.Header>
        <Modal.Body>
            <form onSubmit={formSubmit}>
                <div className="mb-2">
                    <div className="mb-1 block">
                        <Label htmlFor="task" value="Enter task name" />
                    </div>
                    <TextInput
                        id="task"
                        placeholder="Enter your task name here"
                        value={task}
                        onChange={(event) => setTask(event.target.value)}
                        required
                    />
                </div>
                <div className="w-full mb-2">
                    <div className="mb-1 block"><Label htmlFor="description" value="Task Description" /></div>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} id="description" placeholder="Describe your task" required />
                </div>
                <div className="mb-2">
                    <div className="mb-1 block">
                        <Label htmlFor="assignee" value="Enter assignees" />
                    </div>
                    <MultiSelectAutoComplete 
                        id="task"
                        placeholder="Enter your assignees name here"
                        value={assigneesDesignation}
                        allItems={existingAssignees}
                        onChange={(items) => setAssigneesDesgnation(items)}
                        newInput
                        required
                    />
                </div>
                <div className="w-full">
                    <Button isProcessing={submitLoading} className="w-full" type="submit">{taskModalState == 'new' ? 'Add New Task' : 'Update Task'}</Button>
                </div>
            </form>
        </Modal.Body>
    </Modal>
    );
}