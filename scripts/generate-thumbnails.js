// Updated scripts/generate-thumbnails.js
const { BlobServiceClient } = require('@azure/storage-blob');
const sharp = require('sharp');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load from .env.local for Next.js projects
dotenv.config({ path: '.env.local' });

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'photos';
const basePath = 'Final';
const thumbnailPrefix = 'thumbnails';
const thumbnailWidth = 400; // Width of thumbnail images

async function generateThumbnails() {
    try {
        // Initialize blob service client
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // Get all image blobs
        const blobsIterator = containerClient.listBlobsFlat({
            prefix: `${basePath}/`
        });

        let processedCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        // Process each image
        for await (const blob of blobsIterator) {
            // Check if it's an image file
            const fileName = blob.name.split('/').pop();
            const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

            if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(fileExt)) {
                try {
                    // Create thumbnail path
                    const pathParts = blob.name.split('/');
                    if (pathParts.length < 3) continue; // Skip if not in country/city structure

                    const country = pathParts[1];
                    const city = pathParts[2];
                    const thumbPath = `${thumbnailPrefix}/${country}/${city}/${fileName}`;

                    // Check if thumbnail already exists
                    const thumbBlobClient = containerClient.getBlobClient(thumbPath);

                    try {
                        const thumbProperties = await thumbBlobClient.getProperties();
                        console.log(`Thumbnail already exists for ${blob.name}`);
                        skippedCount++;
                        continue;
                    } catch (error) {
                        // Thumbnail doesn't exist, proceed to create it
                    }

                    console.log(`Generating thumbnail for ${blob.name}`);

                    // Download original image
                    const blobClient = containerClient.getBlobClient(blob.name);
                    const downloadResponse = await blobClient.download();
                    const imageBuffer = await streamToBuffer(downloadResponse.readableStreamBody);

                    // Resize image
                    const resizedBuffer = await sharp(imageBuffer)
                        .resize(thumbnailWidth)  // Resize to width, maintain aspect ratio
                        .jpeg({ quality: 80 })   // Convert to JPEG with 80% quality
                        .toBuffer();

                    // Upload thumbnail using the blockBlobClient
                    const blockBlobClient = containerClient.getBlockBlobClient(thumbPath);
                    await blockBlobClient.upload(resizedBuffer, resizedBuffer.length, {
                        blobHTTPHeaders: {
                            blobContentType: 'image/jpeg'
                        }
                    });

                    console.log(`✅ Created thumbnail: ${thumbPath}`);
                    processedCount++;
                } catch (imageError) {
                    console.error(`Error processing image ${blob.name}:`, imageError);
                    errorCount++;
                }
            }
        }

        console.log('Thumbnail generation complete!');
        console.log(`Processed: ${processedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);
    } catch (error) {
        console.error('Error generating thumbnails:', error);
    }
}

// Helper function to convert stream to buffer
async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on('error', reject);
    });
}

// Run the function
generateThumbnails().catch(console.error);