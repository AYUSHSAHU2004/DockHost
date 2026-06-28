const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({

    userId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "social-login",

        required: true

    },

    urlId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Url",

        required: true

    }

}, {
    timestamps: true
});

subscriptionSchema.index(
    {
        userId: 1,
        urlId: 1
    },
    {
        unique: true
    }
);

module.exports =
    mongoose.model(
        "Subscription",
        subscriptionSchema
    );