const { getChannel } = require("./connection");

const URL_VALIDATION_QUEUE = "url-validation";

async function sendUrlForValidation(url) {

    const channel = getChannel();

    await channel.assertQueue(URL_VALIDATION_QUEUE, {
        durable: true
    });

    channel.sendToQueue(
        URL_VALIDATION_QUEUE,
        Buffer.from(url),
        {
            persistent: true
        }
    );
    console.log("Sent ->", url);
}

module.exports = {
    sendUrlForValidation
};