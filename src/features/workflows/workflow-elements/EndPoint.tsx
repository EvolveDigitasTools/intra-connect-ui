import { Handle, Position } from "reactflow";

export function EndPoint({ data, isConnectable, type }: {
    data: any;
    isConnectable: any;
    type: 'start' | 'end'
}) {
    return (
        <div className="endPoint bg-green-500 p-2 rounded-2xl flex justify-center">
            {type == 'end' && <Handle type="target" position={Position.Left} isConnectable={isConnectable} />}
            <label htmlFor="text" className=" text-xs px-5">{type.charAt(0).toUpperCase() + type.slice(1)}</label>
            {type == 'start' && <Handle type="source" position={Position.Right} isConnectable={isConnectable} />}
        </div>
    );
}

export function StartNode({ data, isConnectable }: {
    data: any;
    isConnectable: any;
}) {
    return (<EndPoint data={data} isConnectable={isConnectable} type='start' />)
}

export function EndNode({ data, isConnectable }: {
    data: any;
    isConnectable: any;
}) {
    return (<EndPoint data={data} isConnectable={isConnectable} type='end' />)
}