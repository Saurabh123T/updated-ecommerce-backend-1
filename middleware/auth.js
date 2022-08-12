
const jwt=require("jsonwebtoken");
const User=require("../models/userModel")
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors=require("./catchAsyncErrors");

exports.isAuthenticatedUser=catchAsyncErrors(async(req,res,next)=>{
    const {token}=req.cookies;
    // console.log("token",token)
    if(!token){ 
        return next(new ErrorHandler("please login to access this resource",401));
    }
    const decodedData=jwt.verify(token,process.env.JWT_SECRET);
    req.user=await User.findById(decodedData.id);
next();
});

exports.authorizedRoles=(userRole)=>{
    return(req,res,next)=>{
        
     
        if(userRole=="admin"){
        if(!req.user.admin.includes(req.params.shopId)){
          
          return next (new ErrorHandler("u are not admin of this shop",403))
          
        }}
        if(userRole=="superAdmin"){
        if(req.user.isSuperAdmin===false){
          
          return next (new ErrorHandler("u are not superAadmin ",403))
          
        }}
        next()
    }
}
