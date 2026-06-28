const { getChannel } = require("./connection");

const STATUS_UPDATE_QUEUE = "status-update";
const { handleStatusUpdate } = require("../services/statusUpdateService");


async function startConsumer() {

    const channel = getChannel();

    await channel.assertQueue(STATUS_UPDATE_QUEUE, {
        durable: true
    });

    console.log("Waiting for status updates...");

    channel.consume(
        STATUS_UPDATE_QUEUE,
        async (msg) => {

            if (!msg) return;

            const message = JSON.parse(msg.content.toString());


            await handleStatusUpdate(message);
            channel.ack(msg);
        }
    );
}

module.exports = {
    startConsumer
};