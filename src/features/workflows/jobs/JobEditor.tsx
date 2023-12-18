import { ArrowUturnLeftIcon } from "@heroicons/react/20/solid";
import { Badge, Spinner, Tooltip } from "flowbite-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EdgeJSON, FieldValues, Step, WorkflowDetail } from "../../../interface";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import ReactFlow, { Background, Controls, Edge, Node, OnConnect, OnEdgesChange, OnNodesChange, addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow';
import 'reactflow/dist/style.css';
import { convertMinutes, getTimeDifferencefromNow, nodeTypes } from "../../../utils";
import { JobDetail } from "../../../interface";

interface JobStep {
  workflowStepId: string,
  nextSteps: JobStep[],
  previousSteps: JobStep[],
  type: 'start' | 'end' | 'task',
  assignees?: string[],
  approvers?: string[],
  status?: 'incomplete' | 'done' | 'approved',
  completedAt?: string,
  timeNeeded: number,
  timeUnit: 'minutes' | 'hours' | 'days' | 'weeks'
}

export default function JobEditor() {
  const [job, setJob] = useState<JobDetail>({} as JobDetail)
  const [workflow, setWorkflow] = useState<WorkflowDetail>({} as WorkflowDetail);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [expectedWorkflowTime, setExpectedWorkflowTime] = useState(0)
  const [timeTaken, setTimeTaken] = useState(0)
  const auth = useSelector((state: RootState) => state.auth);
  const params = useParams();

  useEffect(() => {
    getJob();

    const intervalId = setInterval(() => {
      if (job.createdAt)
        setTimeTaken(getTimeDifferencefromNow(job.createdAt))
    }, 60000);
    return () => clearInterval(intervalId);
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
      setTimeTaken(getTimeDifferencefromNow(job.createdAt))
      getWorkflow(job)
      setJob(job)
    } catch (error) {
      console.error(error)
    }
  }

  const getWorkflow = async (job: JobDetail) => {
    try {
      const workflowRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/workflow/${job.workflowId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
      const workflow: WorkflowDetail = workflowRes.data.data.workflow
      const updatedNodes: Node[] = workflow.steps;
      updatedNodes.forEach(updatedNode => {
        updatedNode.data.isJobCompletion = true;
        const jobStep = job.steps.find(step => step.workflowStepId == Number(updatedNode.id))

        updatedNode.data.configDetails = {
          assignees: jobStep?.assignees,
          approvers: jobStep?.approvers,
          timeNeeded: jobStep?.timeNeeded,
          timeUnit: jobStep?.timeUnit,
          id: jobStep?.id,
        }
        updatedNode.data.myId = auth.user
      })
      const loadedEdges: Edge[] = workflow.edges.map(edge => {
        return {
          id: edge.id + '',
          source: edge.source + '',
          target: edge.target + ''
        }
      })
      const startStep: JobStep = createStepsAndGetStartStep(workflow.steps, workflow.edges, job.steps)
      startStep.completedAt = job.createdAt
      setExpectedWorkflowTime(calculateWorkflowTime(startStep))
      setWorkflow(workflow)
      setNodes(updateJobActions(updatedNodes, startStep))
      setEdges(loadedEdges)
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  const updateJobActions = (nodesToBeUpdated: Node[], startStep: JobStep): Node[] => {
    let stepsProcess = [startStep]
    while (stepsProcess.length > 0) {
      const updatedStepsProcess: JobStep[] = []
      stepsProcess.forEach(step => {
        if (step.status == 'approved')
          updatedStepsProcess.push(...step.nextSteps)
        else {
          if (step.status == 'incomplete') {
            let isReadyToStart = true
            step.previousSteps.forEach(previousStep => {
              if (previousStep.status != 'approved')
                isReadyToStart = false
            })
            if (isReadyToStart) {
              const nodeToBeUpdated = nodesToBeUpdated.find(node => node.id == step.workflowStepId)
              if(nodeToBeUpdated?.data)
              nodeToBeUpdated.data.jobDetails = {
                startedAt: step.previousSteps.map(previousStep => { return new Date(previousStep.completedAt ?? '') }).reduce((latest, current) => {
                  return latest > current ? latest : current;
                }),
                status: 'started'
              }
            }
          }
        }
      })
      stepsProcess = updatedStepsProcess
    }
    return nodesToBeUpdated
  }

  const calculateWorkflowTime = (startStep: JobStep): number => {
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

    function calculateTime(step: JobStep): number {
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

  const createStepsAndGetStartStep = (workflowSteps: Step[], workflowEdges: EdgeJSON[], jobSteps: Step[]): JobStep => {
    const startStep: JobStep = {
      workflowStepId: workflowSteps.find(workflowStep => workflowStep.type == 'start')?.id ?? '',
      type: 'start',
      status: 'approved',
      nextSteps: [],
      previousSteps: [],
      timeNeeded: 0,
      timeUnit: 'minutes'
    }
    const jobStepsProcess: JobStep[] = [startStep]
    workflowEdges.forEach((workflowEdge) => {
      let sourceJobStep = jobStepsProcess.find(jobStep => Number(jobStep.workflowStepId) == workflowEdge.source)
      let targetJobStep = jobStepsProcess.find(jobStep => Number(jobStep.workflowStepId) == workflowEdge.target)
      if (!sourceJobStep) {
        const startJob = jobSteps.find(jobStep => jobStep.workflowStepId == workflowEdge.source)
        const startWorkflow = workflowSteps.find(workflowStep => Number(workflowStep.id) == workflowEdge.source)
        sourceJobStep = {
          workflowStepId: workflowEdge.source + '',
          type: startWorkflow?.type ?? 'task',
          assignees: startJob?.assignees,
          approvers: startJob?.approvers,
          status: 'incomplete',
          timeNeeded: startJob?.timeNeeded ?? 0,
          timeUnit: startJob?.timeUnit ?? 'minutes',
          nextSteps: [],
          previousSteps: []
        }
        jobStepsProcess.push(sourceJobStep)
      }
      if (!targetJobStep) {
        const targetJob = jobSteps.find(jobStep => jobStep.workflowStepId == workflowEdge.target)
        const targetWorkflow = workflowSteps.find(workflowStep => Number(workflowStep.id) == workflowEdge.target)
        targetJobStep = {
          workflowStepId: workflowEdge.target + '',
          type: targetWorkflow?.type ?? 'end',
          assignees: targetJob?.assignees,
          approvers: targetJob?.approvers,
          status: 'incomplete',
          timeNeeded: targetJob?.timeNeeded ?? 0,
          timeUnit: targetJob?.timeUnit ?? 'minutes',
          nextSteps: [],
          previousSteps: []
        }
        jobStepsProcess.push(targetJobStep)
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