import { ArrowUturnLeftIcon } from "@heroicons/react/20/solid";
import { Badge, Button, Spinner, Tooltip } from "flowbite-react";
import { MdAddTask } from "react-icons/md";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Notification, SpeedDialOption, Step, TaskDetails, WorkflowDetail } from "../../interface";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import ReactFlow, { Background, Controls, Edge, EdgeMouseHandler, Node, NodeMouseHandler, OnConnect, OnEdgesChange, OnNodesChange, addEdge, applyEdgeChanges, applyNodeChanges, isEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import SpeedDial from "../../components/SpeedDial";
import TaskModal from "./TaskModal";
import { nodeTypes } from "../../utils";
import { addNotification } from "../notificationService/notificationSlice";

export default function WorkflowEditor() {
  const [workflow, setWorkflow] = useState<WorkflowDetail>({} as WorkflowDetail);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [existingAssignees, setExistingAssignees] = useState<string[]>([])
  const [taskModalState, setTaskModalState] = useState<'none' | 'new' | 'update'>('none');
  const [selectedTask, setSelectedTask] = useState<TaskDetails | undefined>(undefined)
  const [saveState, setSaveState] = useState<'hidden' | 'loading' | 'visible'>('hidden')
  const auth = useSelector((state: RootState) => state.auth);
  const params = useParams();
  const dispatch = useDispatch()

  useEffect(() => {
    getWorkflow();
  }, [])

  useEffect(() => {
    const updatedExtistingAssignees: string[] = []
    nodes.forEach(node => {
      // if (node.data.assignees)
      //   updatedExtistingAssignees.push(node.data.assignees)
      if (node.data.assignees)
        updatedExtistingAssignees.push(...JSON.parse(node.data.assignees))
    })
    setExistingAssignees(updatedExtistingAssignees)
  }, [nodes])

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      setSaveState('visible');
    },
    [setNodes]
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds))
      setSaveState('visible');
    },
    [setEdges]
  );
  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((eds) => addEdge(connection, eds))
      setSaveState('visible');
    },
    [setEdges]
  );

  const getWorkflow = async (updateParams: any = null) => {
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
      const loadedEdges: Edge[] = workflow.edges.map(edge => {
        return {
          id: edge.id + '',
          source: edge.source + '',
          target: edge.target + ''
        }
      })
      setWorkflow(workflow)
      setNodes(updatedNodes)
      if (!updateParams || updateParams.updateEdge)
        setEdges(loadedEdges)
      setLoading(false)
      if (!updateParams)
        setSaveState('hidden')
    } catch (error) {
      console.error(error)
    }
  }

  const newTask = () => {
    setTaskModalState('new')
    setSelectedTask(undefined)
  }

  const taskModalAction = async (task: string, description: string, assigneesDesignation: string[]): Promise<boolean> => {
    if (taskModalState == 'new')
      return await addNewTask(task, description, assigneesDesignation)
    else if (taskModalState == 'update')
      return await updateTask(task, description, assigneesDesignation)
    return false
  }

  const addNewTask = async (task: string, description: string, assigneesDesignation: string[]): Promise<boolean> => {
    const formData = new FormData();

    formData.append("name", task);
    formData.append("description", description);
    formData.append("assigneesDesignation", JSON.stringify(assigneesDesignation));
    formData.append("type", 'task')

    const stepRes = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/step/${workflow.id}/new`, formData, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    setTaskModalState("none")
    if (stepRes.data.success) {
      getWorkflow({ updateEdge: false })
      return true
    }
    return false
  }

  const updateTask = async (task: string, description: string, assigneesDesignation: string[]): Promise<boolean> => {
    const formData = new FormData();

    formData.append("name", task);
    formData.append("description", description);
    formData.append("assigneesDesignation", JSON.stringify(assigneesDesignation));

    const stepRes = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/step/${selectedTask?.id}`, formData, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    setTaskModalState("none")
    if (stepRes.data.success) {
      getWorkflow({ updateEdge: false })
      return true
    }
    return false
  }

  const deleteEdge: EdgeMouseHandler = (event, edge) => {
    setEdges((els) => els.filter(el => isEdge(el) && el.id !== edge.id));
  };

  const deleteTask = async () => {
    const stepRes = await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/step/${selectedTask?.id}`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    setTaskModalState("none")
    if (stepRes.data.success) {
      getWorkflow({ updateEdge: false })
      return true
    }
    return false
  }

  const saveWorkflow = async () => {
    try {
      setSaveState('loading')
      let loadStep: Step | undefined
      let loadEdges = workflow.edges
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        loadStep = workflow.steps.find(loadStep => loadStep.id == node.id)
        if (loadStep?.position.x != node.position.x || loadStep?.position.y != node.position.y) {
          const formData = new FormData();

          formData.append("position_x", node.position.x + '');
          formData.append("position_y", node.position.y + '');

          await axios.put(`${process.env.REACT_APP_BACKEND_URL}/step/${node.id}`, formData, {
            headers: {
              Authorization: `Bearer ${auth.token}`
            }
          })
        }
      }
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const edgeExist = workflow.edges.find(workflowEdge => workflowEdge.source == Number(edge.source) && workflowEdge.target == Number(edge.target))
        if (edgeExist)
          loadEdges = loadEdges.filter(loadEdge => loadEdge.id != edgeExist.id)
        else {
          const formData = new FormData();

          formData.append("source", edge.source);
          formData.append("target", edge.target);

          await axios.post(`${process.env.REACT_APP_BACKEND_URL}/edges/${workflow.id}`, formData, {
            headers: {
              Authorization: `Bearer ${auth.token}`
            }
          })
        }
      }
      for (let i = 0; i < loadEdges.length; i++) {
        const loadEdge = loadEdges[i];
        await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/edges/${loadEdge.id}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        })
      }
      const saveNotification: Notification = {
        id: 1,
        message: 'Saved Successfully',
        type: 'success',
        timed: true
      }
      dispatch(addNotification(saveNotification))
      setSaveState('hidden')
    } catch (error) {
      const errorNotification: Notification = {
        id: 1,
        message: 'Some error occured while saving please try again after some time',
        type: 'error',
        timed: false
      }
      dispatch(addNotification(errorNotification))
      setSaveState('visible')
    }
  }

  const editNode: NodeMouseHandler = (e, node) => {
    const selectedTask: TaskDetails = {
      id: node.id,
      task: node.data.name,
      description: node.data.description,
      assigneesDesignation: JSON.parse(node.data.assignees)
      // assigneesDesignation: [node.data.assignees]
    }
    setTaskModalState('update')
    setSelectedTask(selectedTask)
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
      <Badge>{workflow.departments.map(department => department.name).join(", ")}</Badge>
      {saveState != 'hidden' && <Button isProcessing={saveState == 'loading'} className="ml-auto mr-10 p-0" onClick={saveWorkflow}>Save</Button>}
    </header>
    <section className="h-[82vh] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDoubleClick={editNode}
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
    <TaskModal
      existingAssignees={existingAssignees}
      taskModalState={taskModalState}
      taskDetails={selectedTask}
      taskModalAction={taskModalAction}
      deleteTask={deleteTask}
      closeTaskModal={() => { setTaskModalState('none'); setSelectedTask(undefined) }}
    />
  </section>)
}