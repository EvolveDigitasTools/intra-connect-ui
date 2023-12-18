import { NodeTypes } from "reactflow";
import { EndNode, StartNode } from "./features/workflows/workflow-elements/EndPoint";
import Task from "./features/workflows/workflow-elements/Task";

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
export const nodeTypes: NodeTypes = {
    start: StartNode,
    end: EndNode,
    task: Task
};