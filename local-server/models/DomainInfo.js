const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true, // Ensures the email field is mandatory
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format'], // Validates email format
    },
    permanentDomain: {
        type: String,
        required: true, // Ensures the permanentDomain field is mandatory
        trim: true,
    },
    currentDomain: {
        type: String,
        required: true, // Ensures the buyedDomain field is mandatory
        trim: true,
    },
});

const Domain = mongoose.model('Domain', domainSchema);

module.exports = Domain;
