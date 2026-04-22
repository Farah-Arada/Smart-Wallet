const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
        unique:true},


        otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    }
})
   

userSchema.pre("save", async function() {
    this.email = this.email.toLowerCase();
    
    if (!this.isModified("password")) {
        return;
    }
    
    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("user", userSchema)