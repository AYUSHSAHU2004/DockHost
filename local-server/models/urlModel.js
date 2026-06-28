const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({

    url: {
        type: String,
        unique: true,
        required: true
    },

    alive: {
        type: Boolean,
        default: false
    },

    statusCode: {
        type: Number,
        default: 0
    },

    message: {
        type: String,
        default: "UNKNOWN"
    },

    lastChecked: Date,

    lastUpdated: Date

}, {
    timestamps: true
});

module.exports = mongoose.model("Url", urlSchema);