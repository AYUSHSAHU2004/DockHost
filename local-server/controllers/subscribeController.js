const Url = require("../models/urlModel");
const Subscription = require("../models/subscriptionModel");
const { sendUrlForValidation } = require("../rabbitmq/producer");

async function subscribe(req, res) {

    try {

        const userId = req.user._id;
        let { url } = req.body;

        if (!url) {
            return res.status(400).json({
                message: "URL is required"
            });
        }

        url = url.trim().toLowerCase();

        let urlDoc = await Url.findOne({ url });

        if (urlDoc) {

            console.log("URL already exists");

        } else {

            urlDoc = await Url.create({

                url,

                alive: false,

                statusCode: 0,

                message: "UNKNOWN"

            });

            await sendUrlForValidation(url);

            console.log("URL added and sent to Java");
        }

        await Subscription.findOneAndUpdate(

            {
                userId,
                urlId: urlDoc._id
            },

            {
                userId,
                urlId: urlDoc._id
            },

            {
                upsert: true,
                new: true
            }

        );

        res.json({

            success: true,

            url: urlDoc

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }

}

async function getSubscriptions(req, res) {

    try {

        const userId = req.user._id;

        const subscriptions = await Subscription.find({
            userId
        }).populate("urlId");

        const urls = subscriptions.map(
            sub => sub.urlId
        );

        res.json({
            success: true,
            urls
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }

}

module.exports = {
    subscribe,
    getSubscriptions
};