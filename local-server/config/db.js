const mongoose=require('mongoose')
require("dotenv").config();
const MONGO_URL=process.env.MONGO_URL;
exports.connect=()=>{
mongoose.connect(MONGO_URL, {
   
} ).then(() => console.log('MongoDB connected successfully'))
.catch((err) => {console.error('MongoDB connection error:', err);
    console.log(err);
    process.exit(1)
   }) }

   
