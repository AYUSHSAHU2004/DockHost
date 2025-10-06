const mongoose = require('mongoose');

const buyedDomainSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Ensures the name field is mandatory
        trim: true, // Removes whitespace from the beginning and end
    },
    email: {
        type: String,
        required: true, // Ensures the email field is mandatory
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format'], // Validates email format
    },
});

const BuyedDomain = mongoose.model('BuyedDomain', buyedDomainSchema);

module.exports = BuyedDomain;
