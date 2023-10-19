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
    files: FileBrief[]
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