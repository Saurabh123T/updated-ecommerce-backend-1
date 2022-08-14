const ErrorHandler = require("../../utils/errorhandler");
const catchAsyncErrors=require("../../middleware/catchAsyncErrors")
const userSchema=require("../../models/userModel");
const shopSchema=require("../../models/shopModel");
const productSchema=require("../../models/productModel");
const sendToken = require("../../utils/jwtToken");
const jwt_decode=require("jwt-decode")

const PushNotifications = require("@pusher/push-notifications-server");


// google signin/login
exports.googleSignin=catchAsyncErrors(async(req,res,next)=>{
    
    // console.log("hiii")
  const {tokenId}=req.body;
  const userObj=await jwt_decode(tokenId);


const email_verified=userObj.email_verified;
const name=userObj.name;
const email=userObj.email;

const googleSub=userObj.sub;
const avatar=userObj.picture;


if(email_verified){
    const user =await userSchema.findOne({email});
               if(user){
                sendToken(user,201,res);
            }else{
 // use sub from goofle responce to generate secure unique password
                let password=email+process.env.JWT_SIGNIN_KEY;
                let newUser=await userSchema.create({name,password,email,googleSub,avatar});

                sendToken(newUser,201,res);
            }
}

//   })
})

// logout user
exports.logout=catchAsyncErrors(async(req,res,next)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        secure:true,
        sameSite:'none',
        httpOnly:true,
    });

    res.status(200).json({
        success:true,  
        
        message:"Logged Out"
    })
})


// update user profile
exports.updateProfile=catchAsyncErrors(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        number:req.body.number
    }
    
    const user =await userSchema.findByIdAndUpdate(req.user.id,newUserData,{new:true,runValidators:true,useFindAndModify:false});
    
    res.status(200).json({
        success:true,
        user
    })
});
// update user favourites
exports.updateFavourites=catchAsyncErrors(async(req,res,next)=>{



    let favourites=req.user.favourites
    const shopId=req.body.shopId
    // console.log(req.body)
    if(favourites.includes(shopId)){
      favourites=favourites.filter((rev)=>(rev.toString()!==shopId))
    }else{
        favourites.push(shopId)
    }
    const newUserData={
        favourites
    }



    
    const user =await userSchema.findByIdAndUpdate(req.user.id,newUserData,{new:true,runValidators:true,useFindAndModify:false});
    
    res.status(200).json({
        success:true,
        user
    })
});



// get my user profile
exports.getMyProfile=catchAsyncErrors(async(req,res,next)=>{

    const testUser=await userSchema.findById(req.user._id).populate("admin","name");
    const admin=testUser.admin
    const user=req.user;
 
    res.status(200).json({
        success:true,
        user,
        admin
    })
});

// get my user favourites
exports.getMyFavourites=catchAsyncErrors(async(req,res,next)=>{

    const testUser=await userSchema.findById(req.user._id).populate("favourites",);
    const favourites=testUser.favourites
 
    res.status(200).json({
        success:true,
        favourites
    })
});




// delete User
exports.deleteUser=catchAsyncErrors(async(req,res,next)=>{
    if(req.params.userId!==req.user.id){
        return next(new ErrorHandler("you can only delete your account,not Others", 404));
    }

    const user = await userSchema.findById(req.params.userId);

    if(!user){
        return next(new ErrorHandler("User not found", 404));
    }




if(user.admin.length!==0){
    // here i am deleting All shops/products of this uses
    for(const shopId of user.admin){
    const shop = await shopSchema.findById(shopId);
  
    if(!shop){
      return next(new ErrorHandler("Shop not found", 404));
    }
    if(shop.owner===req.user.id){
      return next(new ErrorHandler("you can only delete your Shop,not Others", 404));
    }
    
   await productSchema.deleteMany({_id: { $in: shop.products}});
    // await userSchema.findByIdAndUpdate({_id:shop.owner},{$pull:{admin:`${req.query.shopId}`}})
  
  
    await shop.remove();
}
}
await res.cookie("token",null,{
    expires:new Date(Date.now()),
    httpOnly:true,
});
    await user.remove();

    res.status(200).json({
        success:true,
        message:"Account deleted successfully"
    })
})



// get my beams token
exports.getBeamsToken=catchAsyncErrors(async(req,res,next)=>{
    const beamsClient = new PushNotifications({
        instanceId: process.env.PUSHER_INSTANCE_ID,
        secretKey:  process.env.PUSHER_SECRET_ID,
      });
    

  // get it from your auth system
    const userIDInQueryParam = req.query["user_id"];
    // if (userId != userIDInQueryParam) {
    //   res.status(401).send("Inconsistent request");
    // } else {
      const beamsToken = beamsClient.generateToken(userIDInQueryParam);
      res.send(JSON.stringify(beamsToken));
    // }
 
 
});