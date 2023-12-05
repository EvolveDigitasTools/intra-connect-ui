import { Handle, Position, useReactFlow, useStoreApi } from "reactflow";
import AttachedDialog from "../../../components/AttachedDialog";
import AddJobConfig from "../jobs/AddJobConfig";

export default function Task({ id, data, isConnectable, updateNode }: {
    id: string;
    data: any;
    isConnectable: any;
    updateNode?: (nodeId: string, assignees: string[], approvers: string[], timeNeeded: number, timeUnit: string) => void
}) {
    const { setNodes } = useReactFlow();
    const store = useStoreApi();

    const completeJobConfig = (assignees: string[], approvers: string[], timeNeeded: number, timeUnit: string) => {
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
                        assignees,
                        approvers,
                        timeNeeded,
                        timeUnit
                    }
                }
            };
            setNodes(nodesToBeUpdated.map(n => n.id === id ? updatedNode : n));
        }
    }

    const taskUI = <div className={`${data.isNewJob ? data.isConfigDone ? 'bg-green-500 ' : 'bg-red-400 ' : "bg-light-background dark:bg-dark-background-secondry "}border-white border-[1px] text-white max-w-sm rounded overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 ease-in-out`}>
        <div className="p-2 text-center">
            <div className="font-bold content-center text-sm mb-1">{data.name}</div>
            <p className="text-xs">
                {data.assignees}
            </p>
        </div>
    </div>

    let taskModal
    if (data.isNewJob)
        taskModal = <AddJobConfig assigneesDesignation={data.assignees} completeJobConfig={completeJobConfig} />

    return (<div>
        {data.isNewJob ?
            <AttachedDialog dialogContent={taskModal} defaultState={data.isModalActive}>
                {taskUI}
            </AttachedDialog> : taskUI
        }
        <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
        <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
    </div>
    );
}
