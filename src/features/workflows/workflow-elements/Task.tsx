import { Handle, Position, useReactFlow, useStoreApi } from "reactflow";
import AttachedDialog from "../../../components/AttachedDialog";
import AddJobConfig from "../jobs/AddJobConfig";
import { FieldValues, StepData } from "../../../interface";
import { useEffect, useState } from "react";
import Tooltip from "../../../components/Tooltip";
import TaskJobAction from "../jobs/TaskJobActions";
import { Button, Label, TextInput } from "flowbite-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { getNodesFromUpdatedJob } from "../../../utils";

export default function Task({ id, data, isConnectable }: {
    id: string;
    data: StepData;
    isConnectable: any;
}) {
    const [open, setOpen] = useState<boolean>(false);
    const [remarks, setRemarks] = useState('');
    const [updateJobLoading, setUpdateJobLoading] = useState(false);
    const { setNodes } = useReactFlow();
    const auth = useSelector((state: RootState) => state.auth);
    const store = useStoreApi();

    useEffect(() => {
        setOpen(data.isModalActive ?? false)
    }, [data.isModalActive])

    const completeJobConfig = (assigneesDesignationValues: FieldValues, approvers: string[], timeNeeded: number, timeUnit: string) => {
        const { nodeInternals } = store.getState();
        const nodesToBeUpdated = Array.from(nodeInternals.values())
        const node = nodesToBeUpdated.find(node => node.id == id)
        if (node) {
            const updatedNode = {
                ...node,
                data: {
                    ...node.data,
                    isConfigDone: true,
                    isModalActive: false,
                    configDetails: {
                        assignees: Array.from(new Set(Object.values(assigneesDesignationValues).flat())),
                        approvers,
                        timeNeeded,
                        timeUnit,
                        assigneesDesignationValues
                    },
                }
            };
            setNodes(nodesToBeUpdated.map(n => n.id === id ? updatedNode : n));
        }
        setOpen(false)
    }

    const taskModalAction = () => {
        setOpen(!open)
    }

    const updateJob: React.FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault()
        setUpdateJobLoading(true)
        const submitter = (e.nativeEvent as any).submitter as HTMLButtonElement;
        const action = submitter.value;

        const formData = new FormData();

        formData.append("remarks", remarks);

        axios.post(`${process.env.REACT_APP_BACKEND_URL}/job/${data.jobStepId}/${action}`, formData, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        }).then(res => {
            setUpdateJobLoading(false)
            setOpen(false)
            getNodesFromUpdatedJob(data.jobId, data.workflowDetail, auth).then(updatedNodes => setNodes(updatedNodes))
        })
    }

    const taskUI = <Tooltip content={data.description}>
        <div onClick={() => data.mode == 'newJob' && setOpen(!open)} className={`${data.mode == 'newJob' ? data.isConfigDone ? 'bg-green-500 ' : 'bg-red-400 ' : "bg-light-background dark:bg-dark-background-secondry "}border-white border-[1px] text-white max-w-sm rounded overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 ease-in-out`}>
            <div className="p-2 text-center">
                <div className="font-bold content-center text-sm mb-1">{data.name}</div>
                {['started', 'fix', 'done', 'approved'].includes(data.jobDetails?.status) ?
                    <TaskJobAction configDetails={data.configDetails} jobDetails={data.jobDetails} taskModalAction={taskModalAction} />
                    :
                    (data.mode != 'jobCompletion' && <p className="text-xs">
                        {JSON.parse(data.assignees ?? '').map((assignee: string) => assignee).join(", ")}
                    </p>)
                }
            </div>
        </div>
    </Tooltip>

    let taskModal
    if (data.mode == 'newJob')
        taskModal = <AddJobConfig assigneesDesignation={data.assignees ?? ''} tempAssignees={data.tempAssignees ?? {}} configDetails={data.configDetails} completeJobConfig={completeJobConfig} />
    else if (['done', 'started', 'fix'].includes(data.jobDetails?.status))
        taskModal = <form className="flex w-60 flex-col gap-1" onSubmit={updateJob}>
            <div>
                <div className="mb-1 block">
                    <Label htmlFor="remarks" value='Remarks' />
                </div>
                <TextInput value={remarks} sizing='sm' onChange={(e) => setRemarks(e.target.value)} className="mb-1" required />
            </div>
            {['started', 'fix'].includes(data.jobDetails?.status) && <Button isProcessing={updateJobLoading} name="action" value="done" size="xs" type="submit">Submit</Button>}
            {data.jobDetails.status == 'done' && <div className="w-full flex justify-between">
                <Button isProcessing={updateJobLoading} name="action" value="approve" className='w-[48%]' type="submit" size="xs">Approve</Button>
                <Button isProcessing={updateJobLoading} name="action" value="reject" className="w-[48%]" type="submit" size="xs" color="failure">Reject</Button>
            </div>}
        </form >
    return (<div>
        {(data.mode == 'newJob' || ['done', 'started', 'fix'].includes(data.jobDetails?.status)) ?
            <AttachedDialog dialogContent={taskModal} open={open}>
                {taskUI}
            </AttachedDialog> : taskUI
        }
        <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
        <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
    </div>
    );
}
