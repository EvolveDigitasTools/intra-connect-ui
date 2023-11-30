import { ArrowUturnLeftIcon } from "@heroicons/react/20/solid";
import { Badge, Button, Spinner, Tooltip } from "flowbite-react";
import { MdAddTask } from "react-icons/md";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SpeedDialOption, Step, WorkflowDetail } from "../../interface";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import ReactFlow, { Background, Controls, Edge, EdgeMouseHandler, Node, NodeTypes, OnConnect, OnEdgesChange, OnNodesChange, addEdge, applyEdgeChanges, applyNodeChanges, isEdge, useEdgesState, useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';
import SpeedDial from "../../components/SpeedDial";
import Task from "./workflow-elements/Task";
import TaskModal from "./TaskModal";
import { EndNode, StartNode } from "./workflow-elements/EndPoint";

const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  task: Task
};


export default function WorkflowEditor() {
  const [workflow, setWorkflow] = useState<WorkflowDetail>({} as WorkflowDetail);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [taskModalState, setTaskModalState] = useState<'none' | 'new' | 'update'>('none');
  const auth = useSelector((state: RootState) => state.auth);
  const params = useParams();

  useEffect(() => {
    getWorkflow();
  }, [])

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const getWorkflow = async () => {
    try {
      const workflowId = params.workflowId;
      const workflowRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/workflow/${workflowId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
      const workflow: WorkflowDetail = workflowRes.data.data.workflow
      const updatedNodes: Node[] = workflow.steps;
      updatedNodes.forEach(updatedNode => {
        const node = nodes.find(node => node.id == updatedNode.id)
        if (node)
          updatedNode.position = node.position
      })
      setWorkflow(workflow)
      setNodes(updatedNodes)
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  const newTask = () => {
    setTaskModalState('new')
  }

  const addNewTask = async (task: string, description: string, assigneesDesignation: string): Promise<boolean> => {
    const formData = new FormData();

    formData.append("name", task);
    formData.append("description", description);
    formData.append("assigneesDesignation", assigneesDesignation);
    formData.append("type", 'task')

    const stepRes = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/step/${workflow.id}/new`, formData, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    setTaskModalState("none")
    if (stepRes.data.success) {
      getWorkflow()
      return true
    }
    return false
  }

  const deleteEdge: EdgeMouseHandler = (event, edge) => {
    setEdges((els) => els.filter(el => isEdge(el) && el.id !== edge.id));
  };

  const saveWorkflow = async () => {
    let loadStep: Step | undefined
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      loadStep = workflow.steps.find(loadStep => loadStep.id == node.id)
      if (loadStep?.position.x != node.position.x || loadStep?.position.y != node.position.y) {
        const formData = new FormData();

        formData.append("position_x", node.position.x+'');
        formData.append("position_y", node.position.y+'');

        const stepRes = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/step/${node.id}`, formData, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        })
      }
    }
    alert('updated')
  }

  const workflowAction: SpeedDialOption[] = [{
    tootip: 'New Task',
    icon: (iconClass: string) => {
      return <MdAddTask className={iconClass} />
    },
    action: newTask
  }]

  if (loading)
    return (<section className="w-full h-full flex justify-center items-center">
      <Spinner size="xl" />
    </section>)

  return (<section className="h-full w-full">
    <header className="flex h-[8vh] items-center border-b border-light-border dark:border-dark-border">
      <Link className="h-full flex justify-center items-center w-[5vh] border-r hover:bg-dark-secondry-button border-light-border dark:border-dark-border" to={'/dashboard/workflows'}><nav><ArrowUturnLeftIcon className="w-3 h-3" /></nav></Link>
      <Tooltip content={workflow.name}><h1 className="px-2">{workflow.name.length > 20 ? workflow.name.substring(0, 20) + "..." : workflow.name} - </h1></Tooltip>
      <Badge>{workflow.department.name}</Badge>
      <Button className="ml-auto mr-10 p-0" onClick={saveWorkflow}>Save</Button>
    </header>
    <section className="h-[82vh] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeDoubleClick={deleteEdge}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </section>
    <SpeedDial speedDialOptions={workflowAction} />
    <TaskModal taskModalState={taskModalState} taskModalAction={addNewTask} closeTaskModal={() => setTaskModalState('none')} />
  </section>)
}