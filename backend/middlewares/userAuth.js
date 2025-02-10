import jwt from 'jsonwebtoken';

const userAuth = async (req,res,next)=>{
    const {token} = req.cookies;
    if(!token){
        return res.status(401).json({success:false , message:"Unauthorized"});
    }

    try{
        const decodedToken = jwt.verify(token,process.env.SECRET_KEY);

        if(decodedToken.id){
            req.body.userId = decodedToken.id;
        }
        else{
            return res.status(401).json({success:false , message:"Unauthorized"});
        }
        
        next();
    }catch(error){
        console.log(error);
        return res.status(401).json({success:false , message:"Unauthorized"});
    }
};

export default userAuth;