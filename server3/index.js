import express from "express";
import { authMiddleware } from "./middleware.js";
import prismaClient  from "../packages/db/src/index.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { Transaction, SystemProgram, Connection } from "@solana/web3.js";

// const connection = new Connection("https://api.mainnet-beta.solana.com");
const app = express();

app.use(cors());
app.use(express.json());

const secretKey = process.env.JWT_SECRET;  // store securely, e.g., env variable
// app.post("/api/v1/website", async (req, res) => {
    
//     const { userId,url } = req.body;

//     const data = await prismaClient.website.create({
//         data: {
//             userId,
//             url
//         }
//     });

//     res.json({
//         id: data.id
//     });
// });
app.post("/api/v1/website", async (req, res) => {
  console.log("=== START /api/v1/website REQUEST ===");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

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

    // 5️⃣ Get URL from body
    const { url } = req.body;
    if (!url) {
      console.log("❌ url missing in body");
      return res.status(400).json({ message: "url missing" });
    }

    // 6️⃣ Create entry in DB
    const data = await prismaClient.website.create({
      data: { userId, url },
    });

    console.log("✅ Website created successfully:", data);

    // 7️⃣ Respond success
    res.json({ id: data.id });
  } catch (error) {
    console.error("❌ Unexpected Error:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("=== END REQUEST ===\n");
  }
});

app.get("/api/v1/website/status", async (req, res) => {
    const websiteId = req.query.websiteId;
    const userId = req.userId;

    const data = await prismaClient.website.findFirst({
        where: {
            id: websiteId,
            userId,
            disabled: false
        },
        include: {
            ticks: true
        }
    });

    res.json(data);
});

// app.get("/api/v1/websites", async (req, res) => {
//     const {userId} = req.body;

//     const websites = await prismaClient.website.findMany({
//         where: {
//             userId,
//             disabled: false
//         },
//         include: {
//             ticks: true
//         }
//     });

//     res.json({
//         websites
//     });
// });

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

    console.log("✅ Found websites:", websites.length);

    // 6️⃣ Return response
    res.json({ websites });
  } catch (error) {
    console.error("❌ Unexpected Error:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("=== END REQUEST ===\n");
  }
});


app.delete("/api/v1/website/", authMiddleware, async (req, res) => {
    const websiteId = req.body.websiteId;
    const userId = req.userId;

    await prismaClient.website.update({
        where: {
            id: websiteId,
            userId
        },
        data: {
            disabled: true
        }
    });

    res.json({
        message: "Deleted website successfully"
    });
});

app.post("/api/v1/payout/:validatorId", async (req, res) => {
   // TODO: Implement payout logic
});

app.listen(8080, () => {
    console.log("API server running on port 8080");
});