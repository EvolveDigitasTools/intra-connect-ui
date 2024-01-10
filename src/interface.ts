export interface TicketBrief {
    id: number,
    title: string,
    description: string,
    status: 'open' | 'closed'
}

export interface TicketDetail {
    id: number,
    title: string,
    description: string,
    status: 'open' | 'closed',
    files: FileBrief[],
    assignees: { email: string }[],
    assignedDepartments: { name: string }[],
    creator: { email: string }
}

export interface FileBrief {
    id: number,
    fileName: string
}

export interface Notification {
    id: number;
    message: string;
    type: 'success' | 'info' | 'error';
    timed: boolean;
}

export interface BoardDetail {
    id: number,
    title: string,
    lists: List[],
    listOrder: string,
    cards: Card[]
}

export interface List {
    id: number,
    cardOrder: string,
    title: string
}

export interface Card {
    id: number,
    mainId?: number,
    title: string
}

export interface WorkflowDetail {
    id: number,
    name: string,
    description: string,
    departments: {
        name: string
    }[],
    steps: Step[],
    edges: EdgeJSON[]
}

export interface Step {
    id: string,
    position: {
        x: number,
        y: number
    },
    type: 'start' | 'end' | 'task',
    data: StepData
}

export interface StepData {
    name: string,
    description: string,
    assigneesDesignation: string,
    mode: 'jobCompletion' | 'newJob',
    isConfigDone?: boolean,
    configDetails: StepDataConfigDetails,
    jobDetails: StepDataJobDetails,
    startWorkflowStep: WorkflowStep,
    jobStepId: number,
    isModalActive?: boolean,
    jobId: number,
    workflowDetail: WorkflowDetail,
    assignees?: string,
    tempAssignees?: FieldValues
}

export interface StepDataConfigDetails {
    assignees: string[],
    approvers: string[],
    timeNeeded: number,
    timeUnit: 'minutes' | 'hours' | 'days' | 'weeks'
}

export interface StepDataJobDetails {
    status: 'incomplete' | 'started' | 'fix' | 'done' | 'approved',
    startedAt?: string,
    completedAt?: string,
    approvedAt?: string,
    statusMessage: string,
    canPerformAction: boolean
}
export interface SpeedDialOption {
    tootip: string,
    icon: (iconClass: string) => JSX.Element,
    action: () => void
}

export interface EdgeJSON {
    id: number,
    source: number,
    target: number
}

export interface JobMin {
    id: number,
    name: string
}

export interface JobDetail {
    id: number,
    name: string,
    workflowId: number,
    steps: Step[],
    createdAt: string
}

export interface Step {
    approvers: string[],
    assignees: string[],
    timeNeeded: number,
    timeUnit: 'minutes' | 'hours' | 'days' | 'weeks',
    workflowStepId: number,
    stepActions: {
        actionMessage: string,
        actionTime: string,
        actionType: 'done' | 'approved' | 'declined',
        id: number
    }[]
}

export interface TaskDetails {
    id: string,
    task: string,
    description: string,
    assigneesDesignation: string[]
}

export interface FieldValues {
    [key: string]: string[]
}

export interface WorkflowStep {
    workflowStepId: number,
    nextSteps: WorkflowStep[],
    previousSteps: WorkflowStep[],
    type: 'start' | 'end' | 'task',
    assignees?: string[],
    approvers?: string[],
    timeNeeded: number,
    timeUnit: 'minutes' | 'hours' | 'days' | 'weeks'
}