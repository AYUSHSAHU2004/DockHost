const amqp = require("amqplib");

let connection;
let channel;

async function connectRabbitMQ() {
    try {

        connection = await amqp.connect("amqp://myuser:mypassword@localhost:5672");

        channel = await connection.createChannel();

        console.log("RabbitMQ Connected");

    } catch (err) {

        console.error("RabbitMQ Connection Failed:", err);

        process.exit(1);

    }
}

function getChannel() {

    if (!channel) {
        throw new Error("RabbitMQ not initialized");
    }

    return channel;
}

module.exports = {
    connectRabbitMQ,
    getChannel
};