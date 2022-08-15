const jwt=require("jsonwebtoken");

// creating token annd savinf in cookie
const sendToken=(user,statusCode,res)=>{
    const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRE});

    // keeping in cookie
    let options
    if(process.env.NODE_ENV === "PRODUCTION"){
     options={

        expires:new Date(
            Date.now() +process.env.COOKIE_EXPIRE*24*60*60*1000
        ), 
        
        secure:true,
       sameSite:'none',
        
        httpOnly:true,
    }}else{
        options={

            expires:new Date(
                Date.now() +process.env.COOKIE_EXPIRE*24*60*60*1000
            ), 
           
            httpOnly:true,
        }
    }

    res.status(statusCode).cookie("token",token,options).json({
        success:true,
        user,token
    })
}
module.exports=sendToken
