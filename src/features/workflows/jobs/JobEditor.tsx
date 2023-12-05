import { ArrowUturnLeftIcon } from "@heroicons/react/20/solid";
import { Badge, Spinner, Tooltip } from "flowbite-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { WorkflowDetail } from "../../../interface";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import ReactFlow, { Background, Controls, Edge, Node, OnConnect, OnEdgesChange, OnNodesChange, addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes } from "../../../utils";
import { JobDetail } from "../../../interface";

export default function JobEditor() {
  const [job, setJob] = useState<JobDetail>({} as JobDetail)
  const [workflow, setWorkflow] = useState<WorkflowDetail>({} as WorkflowDetail);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const auth = useSelector((state: RootState) => state.auth);
  const params = useParams();

  useEffect(() => {
    getJob();
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

  const getJob = async () => {
    try {
      const jobId = params.jobId;
      const jobRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/job/${jobId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
      const job: JobDetail = jobRes.data.data.job
      getWorkflow(job.workflowId)
      setJob(job)
    } catch (error) {
      console.error(error)
    }
  }

  const getWorkflow = async (workflowId: number) => {
    try {
      const workflowRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/workflow/${workflowId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
      const workflow: WorkflowDetail = workflowRes.data.data.workflow
      const updatedNodes: Node[] = workflow.steps;
      updatedNodes.forEach(updatedNode => {
        updatedNode.data.isJobCompletion = true;
        updatedNode.data.configDetails = {
          assignees: null,
          approvers: null,
          timeNeeded: null,
          timeUnit: null
        }
      })
      const loadedEdges: Edge[] = workflow.edges.map(edge=> {
        return {
          id: edge.id + '',
          source: edge.source + '',
          target: edge.target + ''
        }
      })
      setWorkflow(workflow)
      setNodes(updatedNodes)
      setEdges(loadedEdges)
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  if (loading)
    return (<section className="w-full h-full flex justify-center items-center">
      <Spinner size="xl" />
    </section>)

  return (<section className="h-full w-full">
    <header className="flex h-[8vh] items-center border-b border-light-border dark:border-dark-border">
      <Link className="h-full flex justify-center items-center w-[5vh] border-r hover:bg-dark-secondry-button border-light-border dark:border-dark-border" to={'/dashboard/jobs'}><nav><ArrowUturnLeftIcon className="w-3 h-3" /></nav></Link>
      <Tooltip content={workflow.name}><h1 className="px-2">{workflow.name.length > 20 ? job.name.substring(0, 20) + "..." : job.name} - </h1></Tooltip>
      <Badge>{workflow.name}</Badge>
    </header>
    <section className="h-[82vh] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </section>
  </section>)
}