import { ChangeEvent, useState } from "react";
import { Handle, Position, useReactFlow, useStoreApi } from "reactflow";

export default function Task({ id, data, isConnectable }: {
    id: string,
    data: any;
    isConnectable: any;
}) {
    const [stepName, setStepName] = useState(data.name);
    const [assignees, setAssignees] = useState(data.assignees);
    const [approvers, setApprovers] = useState(data.approvers);

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setStepName(e.target.value);
    };

    const handleAssigneesChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAssignees(e.target.value);
    };

    const handleApproversChange = (e: ChangeEvent<HTMLInputElement>) => {
        setApprovers(e.target.value);
    };

    return (
        <div className="task bg-blue-500 p-2 rounded-md flex justify-center">
            {/* <input onChange={onChange} className="text-xs px-5" /> */}
            <div className="flow-step-content">
                <input type="text" value={stepName} onChange={handleNameChange} />
                <input value={assignees} onChange={handleAssigneesChange} placeholder="Assignees" />
                <input value={approvers} onChange={handleApproversChange} placeholder="Approvers" />
            </div>
            <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
            <Handle type="source" position={Position.Right} isConnectable={isConnectable} />

        </div>
    );
}
