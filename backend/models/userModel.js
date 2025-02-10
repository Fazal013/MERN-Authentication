
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    verifyOtp:{type:String, default:''},
    verifyOtpExpireAt:{type:Number, default:0},
    isAccountVerified:{type:Number, default:false},
    resetOtp:{type:String, default:''},
    resetOtpExpiredAt:{type:Number, default:0},

})

const userModel =mongoose.model.user || mongoose.model("User", userSchema);

export default userModel;