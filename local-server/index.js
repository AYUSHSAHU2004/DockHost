require('dotenv').config();  // 👈 MUST be first line
require("./config/db").connect();

const express = require('express');
const { exec } = require('child_process');
const cookieParser = require("cookie-parser");

// import prismaClient  from "../packages/db/src/index.js";
const { startConsumer } = require("./rabbitmq/consumer");
const { prismaClient } = require("../packages/db/src/index.js");
const cors = require("cors");
const auth = require("./middleware/auth");

const bodyParser = require('body-parser');
const BuyedDomain = require("./models/BuyedDomain");
const Domain = require('./models/DomainInfo');

const { connectRabbitMQ } = require("./rabbitmq/connection");
const { initialize } = require("./socket/socketManager");


const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;  // store securely, e.g., env variable
const app = express();
const http = require("http");
const server = http.createServer(app);
app.use(cookieParser());
app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.originalUrl} | cookies:`, Object.keys(req.cookies || {}));
    next();
});
const { Server } = require("socket.io");
const router = require("./routes/payement-routes");
const authRoutes = require('./routes/authRoutes');
const subscribeRoutes = require("./routes/subscribeRoutes");
const refreshRoutes = require("./routes/refreshRoutes");
const registerSocket = require("./socket/socketHandler");

app.use(express.json());

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});





const PORT = 8002; // Port for the server
const DOCKER_IMAGE = 'ayushsahu049/builder-image12345'; // Docker image name

// Middleware to parse JSON request bodies

app.use('/api', router);
app.use('/auth/', authRoutes); // <- NEW LINE

app.use("/subscribe", subscribeRoutes);

app.use("/refresh", refreshRoutes);
// Buy a domain
// Buy a domain with additional check in DomainInfo

app.post('/deploy', async (req, res) => {
    const { GIT_REPO_URL, PROJECT_ID, BUILD_COMMAND, FILE_LOCATION } = req.body;

    if (!GIT_REPO_URL || !PROJECT_ID || !BUILD_COMMAND || !FILE_LOCATION) {
        return res.status(400).json({ error: 'GIT_REPO_URL, PROJECT_ID, BUILD_COMMAND and FILE_LOCATION are required' });
    }

    const command = `docker run --rm \
        -e GIT_REPO_URL="${GIT_REPO_URL}" \
        -e PROJECT_ID="${PROJECT_ID}" \
        -e BUILD_COMMAND="${BUILD_COMMAND}" \
        -e FILE_LOCATION="${FILE_LOCATION}" \
        -e RG="${process.env.RG}" \
        -e AK="${process.env.AK}" \
        -e SAK="${process.env.SAK}" \
        website-dist-builder`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: error.message, stderr });
        }
        res.json({ message: 'Deployment successful', stdout });
    });
});
app.post('/buy-domain', async (req, res) => {
    const { domainName, userEmail } = req.body;

    if (!domainName || !userEmail) {
        return res.status(400).json({ message: 'Domain name and user email are required.' });
    }

    try {
        // Step 1: Check if the domain is already bought
        const buyedDomain = await BuyedDomain.findOne({ name: domainName });
        if (buyedDomain) {
            return res.status(400).json({
                status: 'unavailable',
                message: 'The SubDomain is already bought by someone else.',
            });
        }

        // Step 2: Check if the domain is in DomainInfo as currentDomain
        const domainInfo = await Domain.findOne({ currentDomain: domainName });
        if (domainInfo) {
            // Update the currentDomain to "Date.now()-name"
            if (domainInfo.email === userEmail) {
                // Delete the domain if the email matches
                await Domain.deleteOne({ _id: domainInfo._id });
            } else {
                // Update the currentDomain to "Date.now()-name"
                const updatedCurrentDomain = `${Date.now()}-${domainName}`;
                await Domain.updateOne(
                    { currentDomain: domainName },
                    { currentDomain: updatedCurrentDomain }
                );
            }
        }

        // Step 3: Insert into BuyedDomain
        const newBuyedDomain = new BuyedDomain({
            name: domainName,
            email: userEmail,
        });
        await newBuyedDomain.save();

        // Step 4: Insert into Domain as permanent
        const newDomain = new Domain({
            email: userEmail,
            permanentDomain: domainName,
            currentDomain: domainName,
        });
        await newDomain.save();

        return res.status(200).json({
            status: 'success',
            message: 'SubDomain successfully bought!',
        });
    } catch (error) {
        console.error('Error buying domain:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

app.get("/api/v1/websites", auth, async (req, res) => {
    try {
        const userId = req.user.email; // req.user comes from auth middleware now

        if (!userId) {
            return res.status(400).json({ message: "userId not found in token" });
        }

        const websites = await prismaClient.website.findMany({
            where: { userId, disabled: false },
            include: { ticks: true },
        });

        res.json({ websites });
    } catch (error) {
        console.error("Unexpected Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Get all current domains by email
app.get('/get-current-domains-by-email', auth, async (req, res) => {
    const email = req.user.email; // use authenticated user's email, ignore query param

    try {
        const buyedDomains = await BuyedDomain.find({}, 'name');
        const buyedDomainNames = buyedDomains.map(domain => domain.name);

        const domains = await Domain.find(
            { email, currentDomain: { $nin: buyedDomainNames } },
            'currentDomain'
        );

        if (!domains || domains.length === 0) {
            return res.status(404).json({ message: 'No domains found for the given email.' });
        }

        const currentDomains = domains.map(domain => domain.currentDomain);
        return res.status(200).json({ status: 'success', currentDomains });
    } catch (error) {
        console.error('Error fetching current domains by email:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

app.get("/me", auth, (req, res) => {
    res.json({ user: req.user });
});

app.post("/logout", (req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out" });
});


app.get('/get-Bdomains-by-email', auth, async (req, res) => {
    const email = req.user.email; // from auth middleware, not query param

    try {
        const domains = await BuyedDomain.find({ email });

        if (!domains || domains.length === 0) {
            return res.status(200).json({ status: "success", names: [] });
        }

        const domainNames = domains.map(domain => domain.name);
        return res.status(200).json({ status: 'success', names: domainNames });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/take-domain-temporarily', auth, async (req, res) => {
    const { domainName } = req.body;
    const userEmail = req.user.email; // trust token, not body

    if (!domainName) {
        return res.status(400).json({ message: 'Domain name is required.' });
    }

    try {
        const buyedDomain = await BuyedDomain.findOne({ name: domainName });
        if (buyedDomain) {
            return res.status(400).json({ status: 'unavailable', message: 'The Subdomain is already bought by someone else.' });
        }

        const domainInfo = await Domain.findOne({ currentDomain: domainName });
        if (domainInfo) {
            return res.status(400).json({ status: 'taken', message: 'The Subdomain is already taken temporarily.' });
        }

        const newDomain = new Domain({ email: userEmail, permanentDomain: domainName, currentDomain: domainName });
        await newDomain.save();

        return res.status(200).json({ status: 'success', message: 'SubDomain successfully taken temporarily!' });
    } catch (error) {
        console.error('Error taking domain temporarily:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

app.post('/check-domain', auth, async (req, res) => {
    console.log('Request received at /check-domain', req.body);
    const { domainName } = req.body;

    if (!domainName) {
        console.log('Missing parameters in request body');
        return res.status(400).json({ message: 'Domain name required.' });
    }

    try {
        const buyedDomain = await BuyedDomain.findOne({ name: domainName });
        console.log('BuyedDomain check:', buyedDomain);

        if (buyedDomain) {
            return res.status(200).json({
                status: 'unavailable',
                message: 'The Subdomain is already bought by someone else.',
            });
        }

        const tempDomain = await Domain.findOne({ currentDomain: domainName });
        console.log('TempDomain check:', tempDomain);

        if (tempDomain) {
            return res.status(200).json({
                status: 'taken-temporarily',
                message: 'The Subdomain is taken temporarily by someone. You can buy it to make it urs permanent.',
            });
        }

        return res.status(200).json({
            status: 'available',
            message: 'The Subdomain is not taken. You can take it temporarily for free or buy it permanently for 10 rupees',
        });
    } catch (error) {
        console.error('Error checking domain availability:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});


let dockerLoggedIn = false;

// Step 1: Check if Docker is logged in
const checkDockerLogin = () => {
    return new Promise((resolve, reject) => {
        exec('docker info', (error, stdout, stderr) => {
            if (error || stderr) {
                reject('Docker is not logged in. Please log in first.');
            } else {
                resolve('Docker is logged in.');
            }
        });
    });
};

// Step 2: Docker login (if not already logged in)
const dockerLogin = () => {
    return new Promise((resolve, reject) => {
        exec('docker login', (error, stdout, stderr) => {
            if (error || stderr) {
                reject('Error logging in to Docker.');
            } else {
                resolve('Logged in to Docker successfully.');
            }
        });
    });
};


async function runContainer(req, res) {
    const { name: PROJECT_ID, githubUrl: GIT_REPO_URL, buildCommand: BUILD_COMMAND, staticFolder: FILE_LOCATION } = req.body;

    // Validate input fields
    if (!PROJECT_ID || !GIT_REPO_URL || !BUILD_COMMAND || !FILE_LOCATION) {
        return res.status(400).json({ error: 'PROJECT_ID, GIT_REPO_URL, BUILD_COMMAND, and FILE_LOCATION are required.' });
    }

    try {
        // Check if the image exists locally
        const imageExists = await checkImageExists('ayushsahu049/builder-image12345');

        if (!imageExists) {
            try {
                // Build the image locally if it doesn't exist
                await buildDockerImage('Dockerfile', 'ayushsahu049/builder-image12345');
            } catch (buildError) {
                console.error('Error building Docker image:', buildError);
                return res.status(500).json({ error: 'Failed to build Docker image', details: buildError.message });
            }
        }

        // ... (Rest of the code for Docker login and running the container)
    } catch (error) {
        console.error('Error execution:', error);
        return res.status(500).json({ error: 'Server Error' });
    }
}

// Helper function to check if the image exists locally
async function checkImageExists(image_name) {
    try {
        await exec(`docker image inspect ${image_name}`, { timeout: 1000 });
        return true;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error("Docker command not found.");
            return false;
        }
        return false;
    }
}

// Helper function to build the Docker image
async function buildDockerImage(dockerfilePath, imageName) {
    try {
        await exec(`docker build -t ${imageName} .`, { cwd: path.dirname(dockerfilePath) });
    } catch (error) {
        throw error;
    }
}

// POST endpoint to handle requests
app.post('/run-container', runContainer);

// Step 6: Execute Docker command
//         exec(dockerCommand, (error, stdout, stderr) => {
//             if (error) {
//                 console.error(`Error: ${error.message}`);
//                 return res.status(500).json({ error: 'Failed to run the Docker container', details: error.message });
//             }
//             if (stderr) {
//                 console.warn(`Warnings: ${stderr}`);
//             }

//             console.log(`Output: ${stdout}`);
//             res.status(200).json({ message: 'Container ran successfully', output: stdout });
//         });
//     } catch (error) {
//         console.error('Error in Docker setup or execution:', error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// });


const { sendUrlForValidation } = require("./rabbitmq/producer");

app.post("/test", async (req, res) => {

    await sendUrlForValidation(req.body.url);

    res.json({
        message: "Sent"
    });

});


// Start the server
async function startServer() {

    await connectRabbitMQ();

    initialize(io);

    registerSocket(io);

    await startConsumer();

    server.listen(8002, () => {
        console.log("Server running on port 8002");
    });

}

startServer();