import { BlobServiceClient } from '@azure/storage-blob';

/**
 * Debug endpoint to test Azure Blob Storage connection
 */
export async function GET(request) {
    try {
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

        // Check if connection string is set
        if (!connectionString) {
            return Response.json({
                status: 'error',
                message: 'AZURE_STORAGE_CONNECTION_STRING environment variable is not set',
                suggestion: 'Make sure you have created .env.local file with the correct connection string'
            }, { status: 500 });
        }

        // Try to create the blob service client
        let blobServiceClient;
        try {
            blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        } catch (error) {
            return Response.json({
                status: 'error',
                message: 'Failed to create BlobServiceClient',
                error: error.message,
                suggestion: 'Check if your connection string is valid'
            }, { status: 500 });
        }

        // Get account information
        const accountName = blobServiceClient.accountName;

        // List containers
        const containersList = [];
        const containersIterator = blobServiceClient.listContainers();
        for await (const container of containersIterator) {
            containersList.push(container.name);
        }

        // Check for the specific container
        const containerName = 'photos';
        if (!containersList.includes(containerName)) {
            return Response.json({
                status: 'warning',
                message: `Container '${containerName}' not found in storage account`,
                accountName,
                availableContainers: containersList,
                suggestion: `Make sure container '${containerName}' exists in the storage account`
            }, { status: 200 });
        }

        // Check for the Final directory
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const finalPath = 'Final/';
        const blobs = [];
        const blobsIterator = containerClient.listBlobsByHierarchy('/', { prefix: finalPath });

        for await (const blob of blobsIterator) {
            blobs.push({
                name: blob.name,
                kind: blob.kind
            });
        }

        if (blobs.length === 0) {
            return Response.json({
                status: 'warning',
                message: `No blobs found with prefix '${finalPath}'`,
                accountName,
                containerName,
                suggestion: `Make sure the '${finalPath}' directory exists and contains your country folders`
            }, { status: 200 });
        }

        // Success
        return Response.json({
            status: 'success',
            message: 'Azure Blob Storage connection is working',
            accountName,
            containerName,
            blobs: blobs.slice(0, 10), // Just show first 10 to avoid large responses
            totalBlobs: blobs.length
        }, { status: 200 });

    } catch (error) {
        return Response.json({
            status: 'error',
            message: 'Failed to test Azure Blob Storage connection',
            error: error.message
        }, { status: 500 });
    }
}