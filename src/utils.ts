import { Node, NodeTypes } from "reactflow";
import { EndNode, StartNode } from "./features/workflows/workflow-elements/EndPoint";
import Task from "./features/workflows/workflow-elements/Task";
import { JobDetail, Step, WorkflowDetail, WorkflowStep } from "./interface";
import axios from "axios";
import { AuthState } from "./features/auth/authSlice";

export function getMimeTypeFromFileName(filename: string) {
    // Split the filename by dots to get the file extension
    const parts = filename.split('.');
    const extension = parts[parts.length - 1].toLowerCase();

    // Define a mapping of common file extensions to MIME types
    const mimeTypes: { [key: string]: string } = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        pdf: 'application/pdf',
        // Add more mappings as needed
    };

    // Look up the MIME type based on the file extension
    const mimeType = mimeTypes[extension] || 'application/octet-stream';

    return mimeType;
}

export function binaryStringToBlob(binaryString: string, mimeType: string) {
    // Step 1: Convert the binary string to an array of integers.
    const byteCharacters = atob(binaryString);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    // Step 2: Create a Uint8Array from the array of integers.
    const byteArray = new Uint8Array(byteNumbers);

    // Step 3: Create a Blob from the Uint8Array.
    return new Blob([byteArray], { type: mimeType });
}

export const getTimeDifferencefromNow = (startTimeStr: string): number => {
    const startTime = new Date(startTimeStr);
    const currentTime = new Date(); // Gets the current time

    // Calculate the difference in time in milliseconds
    const timeDifference = currentTime.getTime() - startTime.getTime();

    // Convert the time difference to minutes
    return Math.floor(timeDifference / 1000 / 60);
}

export const getTimeDifference = (startTimeStr: string, endTimeStr: string): number => {
    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr); // Gets the current time

    // Calculate the difference in time in milliseconds
    const timeDifference = endTime.getTime() - startTime.getTime();

    // Convert the time difference to minutes
    return Math.floor(timeDifference / 1000 / 60);
}

export const convertMinutes = (timeInMinutes: number): string => {
    const minutesPerWeek = 60 * 24 * 7;
    const minutesPerDay = 60 * 24;
    const minutesPerHour = 60;

    const weeks = Math.floor(timeInMinutes / minutesPerWeek);
    const days = Math.floor((timeInMinutes % minutesPerWeek) / minutesPerDay);
    const hours = Math.floor((timeInMinutes % minutesPerDay) / minutesPerHour);
    const minutes = timeInMinutes % minutesPerHour;

    let timeString = '';

    if (weeks > 0) timeString += `${weeks} wk${weeks > 1 ? 's' : ''}, `;
    if (days > 0) timeString += `${days} day${days > 1 ? 's' : ''}, `;
    if (hours > 0) timeString += `${hours} hr${hours > 1 ? 's' : ''}, `;
    if (minutes > 0) timeString += `${minutes} min${minutes > 1 ? 's' : ''}`;

    // Remove trailing comma and space if they exist
    return timeString.endsWith(', ') ? timeString.slice(0, -2) : timeString;
}

export const getNodesFromUpdatedJob = async (jobId: number, workflow: WorkflowDetail, auth: AuthState): Promise<Node[]> => {
    const updatedNodes = workflow.steps, userEmail = auth.user?.email;
    const jobRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/job/${jobId}`, {
        headers: {
            Authorization: `Bearer ${auth.token}`
        }
    })
    const job: JobDetail = jobRes.data.data.job
    updatedNodes.filter(updatedNode => updatedNode.type != 'start').forEach(updatedNode => {
        const jobStep = job.steps.find(step => Number(step.id) == updatedNode.data.jobStepId)
        const lastAction = jobStep?.stepActions.sort((a, b) => b.id - a.id)[0]
        const jobStatus = getJobStatus(lastAction?.actionType)
        updatedNode.data.jobDetails = {
            status: jobStatus,
            statusMessage: lastAction?.actionMessage ?? '',
            completedAt: jobStep?.stepActions.filter(stepAction => stepAction.actionType == 'done').sort((a, b) => b.id - a.id)[0]?.actionTime,
            approvedAt: jobStep?.stepActions.find(stepAction => stepAction.actionType == 'approved')?.actionTime,
            canPerformAction: checkCanPerformAction(jobStatus, userEmail, jobStep?.assignees ?? [], jobStep?.approvers ?? [])
        }
    })
    let stepsProcess = [...updatedNodes[0].data.startWorkflowStep.nextSteps]
    while (stepsProcess.length > 0) {
        const updatedStepsProcess: WorkflowStep[] = []
        stepsProcess.forEach(step => {
            const nodeToBeUpdated = updatedNodes.find(node => Number(node.id) == step.workflowStepId)
            if (nodeToBeUpdated?.data.jobDetails.status == 'approved') {
                nodeToBeUpdated.data.jobDetails = {
                    ...nodeToBeUpdated.data.jobDetails,
                    startedAt: step.previousSteps.map(previousStep => {
                        const previousNode = updatedNodes.find(node => Number(node.id) == previousStep.workflowStepId)
                        return new Date(previousNode?.data.jobDetails.approvedAt ?? '')
                    }).reduce((latest, current) => {
                        return latest > current ? latest : current;
                    }).toString(),
                }
                updatedStepsProcess.push(...step.nextSteps)
            }
            else {
                if (nodeToBeUpdated?.data.jobDetails.status == 'incomplete') {
                    let isReadyToStart = true
                    step.previousSteps.forEach(previousStep => {
                        const previousNode = updatedNodes.find(node => Number(node.id) == previousStep.workflowStepId)
                        if (previousNode?.data.jobDetails.status != 'approved')
                            isReadyToStart = false
                    })
                    if (isReadyToStart) {
                        if (nodeToBeUpdated?.data)
                            nodeToBeUpdated.data.jobDetails = {
                                ...nodeToBeUpdated.data.jobDetails,
                                startedAt: step.previousSteps.map(previousStep => {
                                    const previousNode = updatedNodes.find(node => Number(node.id) == previousStep.workflowStepId)
                                    return new Date(previousNode?.data.jobDetails.approvedAt ?? '')
                                }).reduce((latest, current) => {
                                    return latest > current ? latest : current;
                                }).toString(),
                                status: 'started',
                                canPerformAction: checkCanPerformAction('started', userEmail, step?.assignees ?? [], step?.approvers ?? [])
                            }
                    }
                }
            }
        })
        stepsProcess = updatedStepsProcess
    }
    return updatedNodes.map(n => n)
}

const checkCanPerformAction = (jobStatus: 'incomplete' | 'started' | 'fix' | 'done' | 'approved', userEmail: string, assignees: string[], approvers: string[]): boolean => {
    if (['started', 'fix'].includes(jobStatus))
        return assignees.includes(userEmail)
    if (jobStatus == 'done')
        return approvers.includes(userEmail)
    return false
}

const getJobStatus = (lastActionType: 'done' | 'approved' | 'declined' | undefined): 'done' | 'approved' | 'fix' | 'incomplete' => {
    switch (lastActionType) {
        case "done":
            return "done"
        case "approved":
            return "approved"
        case "declined":
            return "fix"
        default:
            return "incomplete"
    }
}

export const minifyTimeUnit = (timeUnit: 'minutes' | 'hours' | 'days' | 'weeks'): string => {
    switch (timeUnit) {
        case 'minutes':
            return 'mins';
        case 'hours':
            return 'hrs';
        case 'days':
            return 'days';
        case 'weeks':
            return 'wks';
        default:
            return ''
    }
}

export const getNextAvailableId = (items: { id: string | number }[]): number => {
    if (items.length === 0) {
        return 1; // Return 1 if the list is empty
    }

    const ids = items
        .map(item => Number(item.id)) // Convert all IDs to numbers
        .filter(id => !isNaN(id) && id > 0) // Filter out invalid IDs
        .sort((a, b) => a - b); // Sort IDs in ascending order

    if (ids.length === 0) {
        return 1; // Return 1 if no valid IDs are found
    }

    let nextId = 1;
    for (const id of ids) {
        if (id > nextId) {
            break; // Found a gap in the sequence
        }
        nextId = id + 1;
    }

    return nextId;
}

export const nodeTypes: NodeTypes = {
    start: StartNode,
    end: EndNode,
    task: Task
};