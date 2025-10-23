import { randomUUID } from "crypto";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import nacl_util from "tweetnacl-util";
import WebSocket from "ws";
import "dotenv/config";


const CALLBACKS = {};

let validatorId = null;

async function main() {
    const keypair = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(process.env.PRIVATE_KEY))
    );
    const ws = new WebSocket("ws://localhost:8081");

    ws.on("message", async (message) => {
        const data = JSON.parse(message.toString());
        if (data.type === "signup") {
            if (CALLBACKS[data.data.callbackId]) {
                CALLBACKS[data.data.callbackId](data.data);
                delete CALLBACKS[data.data.callbackId];
            }
        } else if (data.type === "validate") {
            await validateHandler(ws, data.data, keypair);
        }
    });

    ws.on("open", async () => {
        const callbackId = randomUUID();
        CALLBACKS[callbackId] = (data) => {
            validatorId = data.validatorId;
        };
        const signedMessage = await signMessage(`Signed message for ${callbackId}, ${keypair.publicKey}`, keypair);

        ws.send(JSON.stringify({
            type: "signup",
            data: {
                callbackId,
                ip: "127.0.0.1",
                publicKey: keypair.publicKey,
                signedMessage,
            },
        }));
    });

    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
    });

    ws.on("close", () => {
        console.log("WebSocket connection closed");
    });
}

async function validateHandler(ws, { url, callbackId, websiteId }, keypair) {
    console.log(`Validating ${url}`);
    const startTime = Date.now();
    const signature = await signMessage(`Replying to ${callbackId}`, keypair);

    try {
        const response = await fetch(url);
        const endTime = Date.now();
        const latency = endTime - startTime;
        const status = response.status;

        console.log(url);
        console.log(status);
        ws.send(JSON.stringify({
            type: "validate",
            data: {
                callbackId,
                status: status === 200 ? "Good" : "Bad",
                latency,
                websiteId,
                validatorId,
                signedMessage: signature,
            },
        }));
    } catch (error) {
        ws.send(JSON.stringify({
            type: "validate",
            data: {
                callbackId,
                status: "Bad",
                latency: 1000,
                websiteId,
                validatorId,
                signedMessage: signature,
            },
        }));
        console.error(error);
    }
}

async function signMessage(message, keypair) {
    const messageBytes = nacl_util.decodeUTF8(message);
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey);

    return JSON.stringify(Array.from(signature));
}

main();

setInterval(async () => {
    // Keep alive or periodic tasks
}, 10000);