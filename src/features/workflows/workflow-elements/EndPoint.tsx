import { Handle, Position } from "reactflow";

export default function EndPoint({ data, isConnectable }: {
    data: any;
    isConnectable: any;
}) {
    return (
        <div className="endPoint bg-green-500 p-2 rounded-2xl flex justify-center">
            {data.value == 'End' && <Handle type="target" position={Position.Left} isConnectable={isConnectable} />}
            <label htmlFor="text" className=" text-xs px-5">{data.value}</label>
            {data.value == 'Start' && <Handle type="source" position={Position.Right} isConnectable={isConnectable} />}
        </div>
    );
}
