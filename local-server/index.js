const express = require('express');
const { exec } = require('child_process');
// import prismaClient  from "../packages/db/src/index.js";
const {prismaClient} = require("../packages/db/src/index.js");
const cors = require("cors");
const bodyParser = require('body-parser');
const BuyedDomain = require("./models/BuyedDomain");
const Domain = require('./models/DomainInfo');
require("./config/db").connect();

const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;  // store securely, e.g., env variable
const app = express();
const router = require("./routes/payement-routes");
const authRoutes = require('./routes/authRoutes');

app.use(express.json());
app.use(cors());

require('dotenv').config();





const PORT = 8002; // Port for the server
const DOCKER_IMAGE = 'ayushsahu049/builder-image12345'; // Docker image name

// Middleware to parse JSON request bodies

app.use('/api',router);
app.use('/auth/', authRoutes); // <- NEW LINE


// Buy a domain
// Buy a domain with additional check in DomainInfo
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

app.get("/api/v1/websites", async (req, res) => {
  console.log("=== START /api/v1/websites REQUEST ===");
  console.log("Headers:", req.headers);

  try {
    // 1️⃣ Get Authorization header
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      console.log("❌ Authorization header missing");
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("❌ Token missing");
      return res.status(401).json({ message: "Token missing" });
    }

    // 3️⃣ Verify token
    let decoded;

    try {
     console.log("sk: ",secretKey);
      decoded = jwt.verify(token, secretKey);
      console.log("✅ Decoded token:", decoded);
    } catch (err) {
      console.log("❌ Token verification failed:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // 4️⃣ Extract userId from decoded payload
    const userId = decoded.email;
    if (!userId) {
        console.log("❌ userId not found in token");
        return res.status(400).json({ message: "userId not found in token" });
    }
    console.log("userId : ", userId);

    // 5️⃣ Fetch websites for that user
    const websites = await prismaClient.website.findMany({
      where: {
        userId,
        disabled: false,
      },
      include: {
        ticks: true,
      },
    });

    console.log("✅ Found websites:", websites?.length);

    // 6️⃣ Return response
    res.json({ websites });
  } catch (error) {
    console.error("❌ Unexpected Error:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("=== END REQUEST ===\n");
  }
});

app.get("/api/v1/website", async (req, res) => {
    const {userId} = req.body;

    const websites = await prismaClient.website.findMany({
        where: {
            userId,
            disabled: false
        },
        include: {
            ticks: true
        }
    });

    res.json({
        websites
    });
});

// Get all current domains by email
app.get('/get-current-domains-by-email', async (req, res) => {
    const { email } = req.query; // Extract email from query parameters

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        // Step 1: Fetch all `name` fields from the BuyedDomain model
        const buyedDomains = await BuyedDomain.find({}, 'name');
        const buyedDomainNames = buyedDomains.map(domain => domain.name);

        // Step 2: Find all `currentDomain` fields in the Domain model for the given email
        // that are not in the buyedDomainNames array
        const domains = await Domain.find(
            { email, currentDomain: { $nin: buyedDomainNames } },
            'currentDomain' // Fetch only the currentDomain field
        );

        if (!domains || domains.length === 0) {
            return res.status(404).json({
                message: 'No domains found for the given email.',
            });
        }

        // Step 3: Map the currentDomain values
        const currentDomains = domains.map(domain => domain.currentDomain);

        return res.status(200).json({
            status: 'success',
            currentDomains,
        });
    } catch (error) {
        console.error('Error fetching current domains by email:', error);
        return res.status(500).json({
            message: 'Internal server error.',
        });
    }
});



app.get('/get-Bdomains-by-email', async (req, res) => {
  console.log("=== START REQUEST ===");
  console.log("1. Query params:", req.query);
  console.log("2. Headers:", req.headers);
  
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers['authorization'];
    console.log("3. Authorization header:", authHeader);
    
    if (!authHeader) {
      console.log("4. ERROR: Authorization header missing");
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    console.log("5. Extracted token:", token);
    
    if (!token) {
      console.log("6. ERROR: Token missing after split");
      return res.status(401).json({ message: 'Token missing' });
    }

    // 2. Verify token and decode payload
    let decoded;
    try {
      decoded = jwt.verify(token, secretKey);
      console.log("7. Decoded token payload:", decoded);
    } catch (err) {
      console.log("8. ERROR: Token verification failed:", err.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // 3. Extract email from token payload
    const email = decoded.email;
    console.log("9. Email from decoded token:", email);
    
    if (!email) {
      console.log("10. ERROR: Email not found in token payload");
      return res.status(400).json({ message: 'Email not found in token' });
    }

    // 4. Query database with this email
    console.log("11. Querying database for email:", email);
    const domains = await BuyedDomain.find({ email });
    console.log("12. Domains found in database:", domains);
    console.log("13. Number of domains:", domains ? domains.length : 0);

    if (!domains || domains.length === 0) {
      console.log("14. No domains found for user");
      return res.status(404).json({ message: 'No domains found for the user' });
    }

    // 5. Respond with domain names
    const domainNames = domains.map(domain => domain.name);
    console.log("15. Domain names to return:", domainNames);
    
    console.log("16. Sending success response");
    return res.status(200).json({ status: 'success', names: domainNames });

  } catch (error) {
    console.error('17. CATCH BLOCK ERROR:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    console.log("=== END REQUEST ===\n");
  }
});


// Take a domain temporarily
app.post('/take-domain-temporarily', async (req, res) => {
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
                message: 'The Subdomain is already bought by someone else.',
            });
        }

        // Step 2: Check if the domain is already taken temporarily
        const domainInfo = await Domain.findOne({ currentDomain: domainName });
        if (domainInfo) {
            return res.status(400).json({
                status: 'taken',
                message: 'The Subdomain is already taken temporarily.',
            });
        }

        // Step 3: Insert the domain as temporary in the Domain model
        const newDomain = new Domain({
            email: userEmail,
            permanentDomain: domainName,
            currentDomain: domainName,
        });
        await newDomain.save();

        return res.status(200).json({
            status: 'success',
            message: 'SubDomain successfully taken temporarily!',
        });
    } catch (error) {
        console.error('Error taking domain temporarily:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});


app.post('/check-domain', async (req, res) => {
    console.log('Request received at /check-domain', req.body);
    const { domainName, userEmail } = req.body;

    if (!domainName || !userEmail) {
        console.log('Missing parameters in request body');
        return res.status(400).json({ message: 'Domain name and user email are required.' });
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



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
