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

export const nodeTypes: NodeTypes = {
    start: StartNode,
    end: EndNode,
    task: Task
};