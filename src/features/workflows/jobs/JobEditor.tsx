import { ArrowUturnLeftIcon } from "@heroicons/react/20/solid";
import { Badge, Spinner, Tooltip } from "flowbite-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EdgeJSON, FieldValues, Step, WorkflowDetail, WorkflowStep } from "../../../interface";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import ReactFlow, { Background, Controls, Edge, Node, OnConnect, OnEdgesChange, OnNodesChange, addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow';
import 'reactflow/dist/style.css';
import { convertMinutes, getNodesFromUpdatedJob, getTimeDifference, getTimeDifferencefromNow, nodeTypes } from "../../../utils";
import { JobDetail } from "../../../interface";

export default function JobEditor() {
  const [job, setJob] = useState<JobDetail>({} as JobDetail)
  const [workflow, setWorkflow] = useState<WorkflowDetail>({} as WorkflowDetail);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [expectedWorkflowTime, setExpectedWorkflowTime] = useState(0)
  const [timeTaken, setTimeTaken] = useState(0)
  const [startWorkflowStep, setStartWorkflowStep] = useState<WorkflowStep | null>(null)
  const auth = useSelector((state: RootState) => state.auth);
  const params = useParams();

  useEffect(() => {
    getJob();
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (job.createdAt)
        setTimeTaken(getTimeDifferencefromNow(job.createdAt))
    }, 60000);

    const endNode = nodes.find(node => node.type == 'end')

    if (job.createdAt && endNode?.data.jobDetails.status == 'started') {
      clearInterval(intervalId)
      setTimeTaken(getTimeDifference(job.createdAt, endNode.data.jobDetails.startedAt))
    }
    else {
      if (job.createdAt)
        setTimeTaken(getTimeDifferencefromNow(job.createdAt))
    }
    return () => clearInterval(intervalId);
  }, [job.createdAt, nodes.find(node => node.type == 'end')?.data.jobDetails.status])

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
      const workflow = await getWorkflow(job.workflowId)
      const loadedEdges: Edge[] = workflow.edges.map(edge => {
        return {
          id: edge.id + '',
          source: edge.source + '',
          target: edge.target + ''
        }
      })
      const startWorkflowStep: WorkflowStep = createStepsAndGetStartStep(workflow.steps, workflow.edges, job.steps)
      workflow.steps.forEach(updatedNode => {
        if (updatedNode.type == 'start')
          updatedNode.data.jobDetails = {
            status: 'approved',
            statusMessage: '',
            approvedAt: job.createdAt,
            canPerformAction: false
          }
        updatedNode.data.mode = 'jobCompletion';
        const jobStep = job.steps.find(step => step.workflowStepId == Number(updatedNode.id))

        updatedNode.data.configDetails = {
          assignees: jobStep?.assignees ?? [],
          approvers: jobStep?.approvers ?? [],
          timeNeeded: jobStep?.timeNeeded ?? 0,
          timeUnit: jobStep?.timeUnit ?? 'minutes',
        }
        updatedNode.data.jobStepId = Number(jobStep?.id)
        updatedNode.data.jobId = Number(jobId)
        updatedNode.data.workflowDetail = workflow
        updatedNode.data.startWorkflowStep = startWorkflowStep
      })
      const calculatedNodes = await getNodesFromUpdatedJob(Number(jobId), workflow, auth)
      setExpectedWorkflowTime(calculateWorkflowTime(startWorkflowStep))
      setNodes(calculatedNodes)
      setStartWorkflowStep(startWorkflowStep)
      setWorkflow(workflow)
      setJob(job)
      setEdges(loadedEdges)
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  const getWorkflow = async (workflowId: number): Promise<WorkflowDetail> => {
    try {
      const workflowRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/workflow/${workflowId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      return workflowRes.data.data.workflow;
    } catch (error) {
      // Better error handling, potentially logging the error or notifying the user
      console.error('Error fetching workflow:', error);
      throw error;  // Re-throw the error to be handled by the calling function
    }
  };

  const calculateWorkflowTime = (startStep: WorkflowStep): number => {
    // Helper function to convert all time to a common unit, e.g., minutes
    function convertTimeToMinutes(time: number, unit: string): number {
      const unitToMinutes: { [key: string]: number } = {
        'minutes': 1,
        'hours': 60,
        'days': 1440,
        'weeks': 10080
      };
      return time * unitToMinutes[unit];
    }

    function calculateTime(step: WorkflowStep): number {
      if (step.type == 'end') return 0;

      let timeInMinutes = convertTimeToMinutes(step.timeNeeded, step.timeUnit) + 30;

      if (step.nextSteps.length === 0) return timeInMinutes; // If it's an end step

      // Calculate time for all parallel paths and take the maximum
      let maxTime = 0;
      for (const nextStep of step.nextSteps) {
        const pathTime = calculateTime(nextStep);
        maxTime = Math.max(maxTime, pathTime);
      }

      return timeInMinutes + maxTime;
    }

    return calculateTime(startStep);
  }

  const createStepsAndGetStartStep = (workflowSteps: Step[], workflowEdges: EdgeJSON[], jobSteps: Step[]): WorkflowStep => {
    const startStep: WorkflowStep = {
      workflowStepId: Number(workflowSteps.find(workflowStep => workflowStep.type == 'start')?.id ?? 0),
      type: 'start',
      nextSteps: [],
      previousSteps: [],
      timeNeeded: 0,
      timeUnit: 'minutes'
    }
    const workflowStepsProcess: { [key: number]: WorkflowStep } = {}
    workflowStepsProcess[startStep.workflowStepId] = startStep
    workflowEdges.forEach((workflowEdge) => {
      let sourceJobStep = workflowStepsProcess[workflowEdge.source]
      let targetJobStep = workflowStepsProcess[workflowEdge.target]
      if (!sourceJobStep) {
        const startJobStep = jobSteps.find(jobStep => jobStep.workflowStepId == workflowEdge.source)
        const startWorkflowStep = workflowSteps.find(workflowStep => Number(workflowStep.id) == workflowEdge.source)

        sourceJobStep = {
          workflowStepId: workflowEdge.source,
          type: startWorkflowStep?.type ?? 'task',
          assignees: startJobStep?.assignees,
          approvers: startJobStep?.approvers,
          timeNeeded: startJobStep?.timeNeeded ?? 0,
          timeUnit: startJobStep?.timeUnit ?? 'minutes',
          nextSteps: [],
          previousSteps: []
        }
        workflowStepsProcess[workflowEdge.source] = sourceJobStep
      }
      if (!targetJobStep) {
        const endJobStep = jobSteps.find(jobStep => jobStep.workflowStepId == workflowEdge.target)
        const endWorkflowStep = workflowSteps.find(workflowStep => Number(workflowStep.id) == workflowEdge.target)

        targetJobStep = {
          workflowStepId: workflowEdge.target,
          type: endWorkflowStep?.type ?? 'end',
          assignees: endJobStep?.assignees,
          approvers: endJobStep?.approvers,
          timeNeeded: endJobStep?.timeNeeded ?? 0,
          timeUnit: endJobStep?.timeUnit ?? 'minutes',
          nextSteps: [],
          previousSteps: []
        }
        workflowStepsProcess[workflowEdge.target] = targetJobStep
      }
      targetJobStep.previousSteps.push(sourceJobStep)
      sourceJobStep.nextSteps.push(targetJobStep)
    })
    return startStep
  }

  if (loading)
    return (<section className="w-full h-full flex justify-center items-center">
      <Spinner size="xl" />
    </section>)

  return (<section className="h-full w-full">
    <header className="flex h-[8vh] items-center border-b border-light-border dark:border-dark-border justify-between">
      <div className="flex items-center">
        <Link className="h-full flex justify-center items-center w-[5vh] border-r hover:bg-dark-secondry-button border-light-border dark:border-dark-border" to={'/dashboard/jobs'}><nav><ArrowUturnLeftIcon className="w-3 h-3" /></nav></Link>
        <Tooltip content={job.name}><h1 className="px-2">{job.name.length > 20 ? job.name.substring(0, 20) + "..." : job.name} - </h1></Tooltip>
        <Badge>{workflow.name}</Badge>
      </div>
      <div>
        Time Taken: {convertMinutes(timeTaken)} (Expected: {convertMinutes(expectedWorkflowTime)})
      </div>
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