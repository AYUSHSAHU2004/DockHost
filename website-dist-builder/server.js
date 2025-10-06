const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();
const mime = require('mime-types');



const PROJECT_ID = process.env.PROJECT_ID;
const BUILD_COMMAND = process.env.BUILD_COMMAND;
const FILE_LOCATION = process.env.FILE_LOCATION;
const s3Client = new S3Client({
    region:process.env.RG,
    credentials: {
        accessKeyId:process.env.AK,
        secretAccessKey:process.env.SAK
    }
});


async function build() {

    const buildPath = path.join(__dirname, 'output');

    const p = exec(`cd ${buildPath} && npm install && ${BUILD_COMMAND}`);

    p.stdout.on('data', async function (data) {
        console.log(data.toString());
    });

    p.stdout.on('error', async function (data) {
        console.error(data.toString());
    });

    p.on('close', async function (code) {
        if (code !== 0) {
            console.error(`Build process failed with code ${code}`);
            process.exit(1); // Exit with an error code if build fails
        }

        console.log("BUILD COMPLETE");
        const distPath = path.join(__dirname, 'output',`${FILE_LOCATION}` ); 
        const distFolderContents = fs.readdirSync(distPath, { recursive: true });

        try {
            for (const file of distFolderContents) {
                const filePath = path.join(distPath, file);
                if (fs.lstatSync(filePath).isDirectory()) continue;

                const command = new PutObjectCommand({
                    Bucket: 'host-my-domain', 
                    Key: `__outputs/${PROJECT_ID}/${file}`,
                    Body: fs.createReadStream(filePath),
                    ContentType: mime.lookup(filePath)
                });

                await s3Client.send(command);
                console.log(`Uploaded to S3`);
            }
            console.log("All files uploaded to S3. Stopping the container.");
            process.exit(0); 
        } catch (err) {
            console.error("Error during S3 upload:", err);
            process.exit(1); // Exit with an error code if upload fails
        }
    });
}

build();
