const createRazorpayInstance = require("../config/razorpay-config");
const BuyedDomain = require("../models/BuyedDomain");
const Domain = require("../models/DomainInfo");
const razorPayInstance = createRazorpayInstance();
const crypto = require("crypto");
exports.createOrder = async (req,res) => {
    const price = 10;
    const options = {
        amount:price*100,
        currency:"INR",
        receipt:"receipt_order_1",
    }
    try{
        razorPayInstance.orders.create(options, (err, order) => {
            if (err) {
                console.log("Error during order creation:", err);  // Log the error
                return res.status(500).json({
                    success: false,
                    message: err,
                });
            }
            return res.status(200).json(order);
        });

    }catch(error){
        return res.status(500).json({
            success:false,
            message:err,
        })
    }
}

exports.verifyPayment = async(req,res) => {
    const {order_id,payment_id,signature,domainName,userEmail} = req.body;
    const secreat = process.env.key_secret;
    const hmac = crypto.createHmac("sha256",secreat);
    hmac.update(order_id + "|" + payment_id);
    const generatedSignature = hmac.digest("hex");
    if(generatedSignature === signature){
        if (!domainName || !userEmail) {
            return res.status(400).json({ message: 'Domain name and user email are required.' });
        }
    
        try {
            // Step 1: Check if the domain is already bought
            const buyedDomain = await BuyedDomain.findOne({ name: domainName });
            if (buyedDomain) {
                return res.status(400).json({
                    status: 'unavailable',
                    message: 'The SubDomain is already bought by someone else.',
                });
            }
    
            // Step 2: Check if the domain is in DomainInfo as currentDomain
            const domainInfo = await Domain.findOne({ currentDomain: domainName });
            if (domainInfo) {
                // Update the currentDomain to "Date.now()-name"
                if (domainInfo.email === userEmail) {
                    // Delete the domain if the email matches
                    await Domain.deleteOne({ _id: domainInfo._id });
                } else {
                    // Update the currentDomain to "Date.now()-name"
                    const updatedCurrentDomain = `${Date.now()}-${domainName}`;
                    await Domain.updateOne(
                        { currentDomain: domainName },
                        { currentDomain: updatedCurrentDomain }
                    );
                }
            }
    
            // Step 3: Insert into BuyedDomain
            const newBuyedDomain = new BuyedDomain({
                name: domainName,
                email: userEmail,
            });
            await newBuyedDomain.save();
    
            // Step 4: Insert into Domain as permanent
            const newDomain = new Domain({
                email: userEmail,
                permanentDomain: domainName,
                currentDomain: domainName,
            });
            await newDomain.save();
    
            return res.status(200).json({
                status: 'success',
                message: 'SubDomain successfully bought!',
            });
        } catch (error) {
            console.error('Error buying domain:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        // return res.status(200).json({
        //     success:true,
        //     message:"Payment verified now",
        // })
    }else{
        return res.status(400).json({
            success:false,
            message:"Payement not verified",
        })
    }

}