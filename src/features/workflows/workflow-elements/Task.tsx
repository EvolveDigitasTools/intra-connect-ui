import { Card, Tooltip } from "flowbite-react";
import { ChangeEvent, useState } from "react";
import { Handle, Position, useReactFlow, useStoreApi } from "reactflow";

export default function Task({ id, data, isConnectable }: {
    id: string,
    data: any;
    isConnectable: any;
}) {

    return (<div>
        {/* <Tooltip content={data.description}> */}
        <div className="bg-light-background dark:bg-dark-background-secondry border-white border-[1px] max-w-sm rounded overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 ease-in-out">
            <div className="p-2 text-center">
                <div className="font-bold content-center text-sm mb-1">{data.name}</div>
                <p className="text-xs">
                    {data.assignees}
                </p>
            </div>
        </div>
        {/* </Tooltip> */}
        <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
        <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
    </div>
    );
}
