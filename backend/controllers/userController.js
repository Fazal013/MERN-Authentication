import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
    try{
        const {userId} = req.body;

        const user = await userModel.findById(userId);

        if(!user){
            return res.status(400).json({success:false , message:"User not found"});
        }

        return res.status(200).json({
            success:true , 
            userData:{name:user.name, isAccountVerified:user.isAccountVerified}});

    }catch (error){
        console.log(error);
        return res.status(500).json({success:false , message:"Internal Server Error"});

    }
};