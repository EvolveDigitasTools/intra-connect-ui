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
    boardListId: number,
    cardOrder: string,
    title: string
}

export interface Card {
    id: number,
    boardCardId: number,
    title: string
}

export interface WorkflowDetail {
    id: number,
    name: string,
    description: string,
    department: string
}

export interface Step {
    id: number,
    task: string,
}

export interface SpeedDialOption {
    tootip: string,
    icon: (iconClass: string) => JSX.Element,
    action: () => void
}