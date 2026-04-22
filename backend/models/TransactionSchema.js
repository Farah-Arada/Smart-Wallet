const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    },
    amount:{
        type:Number,
        required:true,
        min: [0.01, 'Amount must be greater than 0']
    },
    type:{
        type:String,
        enum:["CurrentBalance","income","expense","debt"],
        required:true
    },

    description:{
        type:String,
       
    },

    location:{
        type:String,
        
    }
})

module.exports = mongoose.model("transaction", transactionSchema)