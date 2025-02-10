import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodeMailer.js';
import { EMAIL_VERIFY_TEMPLATE ,PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';



//register user

export const register = async (req,res)=>{
    const {name,email,password} = req.body;
    if(!name || !email || !password){
        return res.status(400).json({success:false ,message:"Please fill all the fields"});
    }
    try{
        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.status(400).json({success:false , message:"User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password,12);

        const user = new userModel({
            name,
            email,
            password:hashedPassword});
        await user.save();

            const token = jwt.sign({id:user._id},process.env.SECRET_KEY,{expiresIn:"1d"});

            res.cookie('token',token,{httpOnly:true,secure:process.env.NODE_ENV === 'production',sameSite:process.env.NODE_ENV === 'production'?'none':'strict',maxAge:24*60*60*1000});
        
            //sending welcome email
            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: email,
                subject: 'Welcome to our website',
                text: `Hello ${name},\n\nWelcome to our website. We are glad to have you on board.`
            }
            await transporter.sendMail(mailOptions);
            return res.status(200).json({success:true , message:"User Registered Successfully"});

    }catch (error){
        console.log(error);
        return res.status(500).json({success:false , message:"Internal Server Error"});
    }
}

//login user

export const login = async (req,res)=>{
    const {email,password} = req.body;

    if(!email || !password){
        return res.status(400).json({success:false ,message:"Please fill all the fields"});
    }

    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(400).json({success:false , message:"Invalid Credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password,user.password);

        if(!isPasswordCorrect){
            return res.status(400).json({success:false , message:"Invalid Credentials"});
        }

        const token = jwt.sign({id:user._id},process.env.SECRET_KEY,{expiresIn:"1d"});

        res.cookie('token',token,{httpOnly:true,secure:process.env.NODE_ENV === 'production',sameSite:process.env.NODE_ENV === 'production'?'none':'strict',maxAge:24*60*60*1000});

        return res.status(200).json({success:true , message:"User Logged In Successfully"});

    }catch (error){
        console.log(error);
        return res.status(500).json({success:false , message:"Internal Server Error"});
    }
}


//logout user

export const logout = async (req,res)=>{
    try{
        res.clearCookie('token',{
            httpOnly:true,secure:process.env.NODE_ENV === 'production',sameSite:process.env.NODE_ENV === 'production'?'none':'strict'
        });
        return res.status(200).json({success:true , message:"User Logged Out Successfully"});
    } catch (error){
        console.log(error);
        return res.status(500).json({success:false , message:"Internal Server Error"});
    }
        
}

//send verification otp for email verification
export const sendVerifyOtp = async (req,res)=>{
    try{
        // const {userId} =req.body;
        const user = await userModel.findById(req.body.userId);
        if(user.isAccountVerified){
            return res.status(400).json({success:false , message:"Account already verified"});
        }

        const otp = Math.floor(100000 + Math.random()*900000).toString();

        user.verifyOtp = otp;
        user.vefifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; 
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            // text: `Hello ${user.name},\n\nYour account verification OTP is ${otp}`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp ).replace("{{email}}",user.email)
        }

        await transporter.sendMail(mailOptions);
        return res.status(200).json({success:true , message:"OTP sent successfully to your email",userId:user._id});


    }catch (error){
        console.log(error);
        return res.status(500).json({success:false , message:"Internal Server Error"});

    }
};


//verify otp for email verification

export const verifyemail= async (req,res)=>{
    const {userId,otp} = req.body;
    if(!otp || !userId){
        return res.status(400).json({success:false , message:"Please enter OTP"});
    }

    try{
        const user = await userModel.findById(userId);
        if(!user){
            return res.status(400).json({success:false , message:"User not found"});
        }

        //convert both otp to string and compare
        const submittedOtp = otp.toString();
        const storedOtp = user.verifyOtp ? user.verifyOtp.toString() : '';


        if( !storedOtp || storedOtp !== submittedOtp){
            return res.status(400).json({success:false , message:"Invalid OTP"});
        }

        // if( user.verifyOtp === '' || user.verifyOtp !== otp){
        //     return res.status(400).json({success:false , message:"Invalid OTP"});
        // }

        if (user.vefifyOtpExpireAt < Date.now()){
            return res.status(400).json({success:false , message:"OTP expired"});
        };

        user.isAccountVerified = true;
        user.verifyOtp ="";
        user.vefifyOtpExpireAt = 0;
        await user.save();

        return res.status(200).json({success:true , message:"Account verified successfully"});
} catch (error){
    console.log(error);
    return res.status(500).json({success:false , message:"Internal Server Error"});
}
};


//is authenticated user
 export const isAuthenticated = async (req,res)=>{
    try{
        return res.status(200).json({success:true , message:"Authenticated User"});
    }catch (error){
        console.log(error);
        return res.status(500).json({success:false , message:"Internal Server Error"});
    }
 }



 //send password reset otp
 export const sendPasswordResetOtp = async (req,res)=>{
    const {email} = req.body;
    if(!email){
        return res.status(400).json({success:false , message:"Please enter email"});
    }

    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(400).json({success:false , message:"User not found"});
        }

        const otp = Math.floor(100000 + Math.random()*900000).toString();

        user.resetOtp = otp;
        user.resetOtpExpiredAt = Date.now() +  10 * 60 * 1000; 
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is ${otp}`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        }

        await transporter.sendMail(mailOptions);
        return res.status(200).json({success:true , message:"OTP sent successfully to your email",userId:user._id});

    }catch (error){
        console.log(error);
        return res.status(500).json({success:false , message:"Internal Server Error"});
    }
 };


 //reset password opt verification
 export const resetPassword = async (req,res)=>{
    const {email, otp, newPassword} = req.body;
    if(!email || !otp || !newPassword){
        return res.status(400).json({success:false , message:"Please fill all the fields"});
    }

    try{

        const user = await userModel.findOne({email});
        if(!user){
            return res.status(400).json({success:false , message:"User not found"});
        }
        if(user.resetOtp === '' || user.resetOtp !== otp){
            return res.status(400).json({success:false , message:"Invalid OTP to reset password"});
        }

        if(user.resetOtpExpiredAt < Date.now()){
            return res.status(400).json({success:false , message:"OTP expired"});
        }

        const hashedPassword = await bcrypt.hash(newPassword,12);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpiredAt = 0;

        await user.save();
        return res.status(200).json({success:true , message:"Password reset successfully"});

    }catch (error){
        console.log(error);
        return res.status(500).json({success:false , message:"Internal Server Error"});
    }

 };