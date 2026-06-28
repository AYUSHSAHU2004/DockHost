const Url = require("../models/urlModel");
const Subscription = require("../models/subscriptionModel");
const { getIO } =
    require("../socket/socketManager");

async function handleStatusUpdate(message) {

    const url = await Url.findOneAndUpdate(
        { url: message.url },
        {
            alive: message.alive,
            statusCode: message.statusCode,
            message: message.message,
            lastChecked: new Date(),
            lastUpdated: new Date()
        },
        {
            new: true
        }
    );

    const subscriptions = await Subscription.find({
        urlId: url._id
    });


    console.log("Subscribers:", subscriptions.length);

    console.log(message);

    console.log(url);

    console.log(subscriptions);
    const io = getIO();

    for (const subscription of subscriptions) {

        io.to(
            subscription.userId.toString()
        ).emit(
            "status-update",
            url
        );

    }

}

module.exports = {
    handleStatusUpdate
};