import { useEffect, useState } from "react";
import { Notification, WorkflowDetail } from "../../../interface";
import ReactFlow, { Background, Controls, Edge, Node, useEdgesState, useNodesState } from "reactflow";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button, Spinner, TextInput } from "flowbite-react";
import { ArrowUturnLeftIcon } from "@heroicons/react/20/solid";
import { nodeTypes } from "../../../utils";
import { addNotification } from "../../notificationService/notificationSlice";

export default function JobConfig() {
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [jobConfigStatus, setJobConfigStatus] = useState(false)
  const [jobName, setJobName] = useState('')
  const [newJobLoading, setNewJobLoading] = useState(false)
  const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null);
  const auth = useSelector((state: RootState) => state.auth);
  const params = useParams();
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    getWorkflow();
  }, [])

  useEffect(() => {
    const nodesToBeUpdated = nodes
    const trueNode = nodesToBeUpdated.find(node => node.data.isModalActive == true)
    if (!trueNode && nodes.length > 0) {
      const nextIncompletedNode = nodesToBeUpdated.find(node => node.type == 'task' && node.data.isConfigDone == false)
      if (nextIncompletedNode) {
        const updatedNode = {
          ...nextIncompletedNode,
          data: {
            ...nextIncompletedNode.data,
            isModalActive: true
          }
        };
        setNodes(nodesToBeUpdated.map(n => n.id === nextIncompletedNode.id ? updatedNode : n));
      }
      else {
        setJobConfigStatus(true)
      }
    }
  }, [nodes])

  const getWorkflow = async () => {
    try {
      const workflowId = params.workflowId;
      const workflowRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/workflow/${workflowId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
      const workflowLoad: WorkflowDetail = workflowRes.data.data.workflow
      const updatedNodes: Node[] = workflowLoad.steps;
      updatedNodes.forEach(updatedNode => {
        updatedNode.data.isNewJob = true;
        updatedNode.data.isConfigDone = false;
        updatedNode.data.isModalActive = false;
        updatedNode.data.configDetails = {
          assignees: null,
          approvers: null,
          timeNeeded: null,
          timeUnit: null
        }
      })
      let firstIncompletedNode = updatedNodes.find(node => node.type == 'task')
      if (firstIncompletedNode)
        firstIncompletedNode.data.isModalActive = true;
      const loadedEdges: Edge[] = workflowLoad.edges.map(edge => {
        return {
          id: edge.id + '',
          source: edge.source + '',
          target: edge.target + ''
        }
      })
      setWorkflow(workflowLoad)
      setNodes(updatedNodes)
      setEdges(loadedEdges)
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  const createJob = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setNewJobLoading(true)

    const formData = new FormData();

    formData.append("name", jobName);
    const jobStepNodes = nodes.filter(node => node.type == 'task').map(node => {
      return {
        workflowStepId: Number(node.id),
        assignees: node.data.configDetails.assignees,
        approvers: node.data.configDetails.approvers,
        timeNeeded: node.data.configDetails.timeNeeded,
        timeUnit: node.data.configDetails.timeUnit
      }
    })
    formData.append("nodes", JSON.stringify(jobStepNodes));

    axios.post(`${process.env.REACT_APP_BACKEND_URL}/job/${workflow?.id}/new`, formData, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    }).then(res => {
      if (res.data.success) {
        setNewJobLoading(false)
        const notification: Notification = {
          id: new Date().getTime(),
          message: 'New Job created',
          type: 'success',
          timed: true
        }
        dispatch(addNotification(notification))
        navigate(`/dashboard/jobs`)
      }
    })
  }

  if (loading)
    return (<section className="w-full h-full flex justify-center items-center">
      <Spinner size="xl" />
    </section>)

  return (<section className="h-full w-full">
    <header className="flex h-[8vh] items-center border-b border-light-border dark:border-dark-border">
      <Link className="h-full flex justify-center items-center w-[5vh] border-r hover:bg-dark-secondry-button border-light-border dark:border-dark-border" to={'/dashboard/jobs/new'}><nav><ArrowUturnLeftIcon className="w-3 h-3" /></nav></Link>
      <h1 className="px-2">Please enter assignees and approver of each step</h1>
      {jobConfigStatus && <form className="ml-auto mr-10 p-0 flex items-center" onSubmit={createJob}>
        <TextInput sizing='sm' className="mr-2" value={jobName} onChange={(e) => setJobName(e.target.value)} placeholder="Job Name" required />
        <Button isProcessing={newJobLoading} size='sm' type="submit">Create Job</Button>
      </form>}
    </header>
    <section className="h-[82vh] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        fitView
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </section>
  </section>)
}