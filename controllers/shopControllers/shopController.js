const shopSchema = require("../../models/shopModel");
const productSchema=require("../../models/productModel");
const orderSchema=require("../../models/orderModel");
const ErrorHandler = require("../../utils/errorhandler");
const ApiFeatures = require("../../utils/apiFeatures");
// const { findByIdAndUpdate } = require("../../models/shopModel");
const userSchema = require("../../models/userModel");
const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const cloudinary = require("cloudinary");
const axios=require("axios")
// const adminOrderSchema = require("../../models/adminOrderModel");

const date=require("date-and-time")

const mongoose=require("mongoose")

// create Shop 
exports.createShop=catchAsyncErrors(async(req,res,next)=>{
//   try {
    
  
//  const captchaRes= await axios.post(
//     `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${req.body.captchaToken}`
//     );
// console.log(captchaRes)
// if(!captchaRes.data.success){
//   return next(new ErrorHandler("Captcha validation failed", 404));

// }
 

// } catch (error) {
//   console.log("error",error)
//   return next(new ErrorHandler("Captcha validation failed", 404));
    
// }
 
 
try {
  const response=await axios.get(`https://api.cashfree.com/api/v2/upi/validate/${JSON.parse(req.body.paymentMethods).upiId}`,
    {
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': process.env.CASHFREE_VERSION,
          'x-client-id': process.env.CASHFREE_ID,
          'x-client-secret': process.env.CASHFREE_KEY
        
        }
    }
); 
} catch (error) {
  return next(new ErrorHandler("Invalid upi id", 404));
} 








  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "shops_ecommerce",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;

  const tempPayment=req.body.paymentMethods
  if(req.body.locationCoords){
  const tempLocation=req.body.locationCoords

  const loc=JSON.parse(tempLocation)
  const finalLoc={
    type:"Point",
    coordinates:[loc.longitude,loc.latitude]
  }
  req.body.locationCoords=finalLoc
  }
  req.body.paymentMethods=JSON.parse(tempPayment)

  req.body.owner=req.user.id;
// console.log(req.body)
    const shop = await shopSchema.create(req.body);
  //  const adminOrder= await adminOrderSchema.create({
  //     shop:shop._id,
  //     owner:req.user.id
  //   })
   const updateUser= await userSchema.findByIdAndUpdate({_id:req.user.id},{$push:{admin:`${shop._id}`}});
  //  console.log(updateUser)






try {
  

    const response = await axios.post(
    'https://api.cashfree.com/api/v2/easy-split/vendors',
    {
        'email': req.user.email,
        'status': 'ACTIVE',
        'upi': {
            'vpa': shop.paymentMethods.upiId,
            'accountHolder': req.user.name
        },
        'phone': req.body.number,
        'name': req.user.name,
        'id': shop._id.toString(),
        'settlementCycleId': 2,
        'verifyAccount': false 
    },
    {
        headers: {
          'x-client-id': process.env.CASHFREE_ID,
          'x-client-secret': process.env.CASHFREE_KEY,
            'Content-Type': 'application/json'
        }
    }
); 

// console.log(response)

} catch (error) {
  // console.log("error",error)
}



    res.status(201).json({
        success:true,
        shop
    })
})



// get all shops
exports.getAllShops=catchAsyncErrors(async(req,res,next)=>{
let shopCount
// const shopCount=await shopSchema.countDocuments();

let apiFeature
// console.log(req.query)
if(req.query.longitude&&req.query.latitude){
// if(req.query.longitude&&req.query.latitude){
  apiFeature=new ApiFeatures(shopSchema.find( {
  locationCoords:
    { $near :
       {
         $geometry: { type: "Point",  coordinates: [ req.query.longitude, req.query.latitude ] },
         $maxDistance: 50000
       }
    },
    isActive:true
} ),req.query).search().filter().pagination()
// console.log(await apiFeature.query)

// apiFeature.pagination();
// } ),req.query).search().filter().pagination();

}else{
   
  apiFeature=new ApiFeatures(shopSchema.find({isActive:true}),req.query).search().filter().pagination();
}
  // let shops=await apiFeature.query;
  // let shopCount=shops.length;
  // console.log(shopCount)

  // apiFeature.pagination();


//  const apiFeature=new ApiFeatures(shopSchema.find(),req.query).search().filter().pagination();
   const shops=await apiFeature.query;
  // console.log(shop.products);
 
    res.status(201).json({
      success:true,
      shops,
      shopCount
  })
  })

// get advanced search results
exports.getAdvSearchResults=catchAsyncErrors(async(req,res,next)=>{
const shopCount=await shopSchema.countDocuments();
const productCount=await productSchema.countDocuments();

 const shopapiFeature=new ApiFeatures(shopSchema.aggregate([{
  "$search": {
    "index": 'shopSearch',
    'autocomplete':{
      "query": req.query.keyword,
"path": "name",
"tokenOrder":"sequential",
"fuzzy":{"prefixLength":1,"maxEdits":1}

},"highlight": {
  "path": "name"
}
  }
   
},


{
  '$project': {
  
    'name': 1,
     "highlights": { $meta: "searchHighlights" },
    'images': 1
  
 },
 
 },
 { $sort : { "highlights.score": -1 } }
]),req.query).pagination();
// console.log(await shopapiFeature.query) 
//  const shopapiFeature=new ApiFeatures(shopSchema.find(),req.query).search().filter().pagination();


 const productapiFeature=new ApiFeatures(productSchema.aggregate([{
  "$search": {
    "index": 'productSearch',
  
        'autocomplete':{
          "query": req.query.keyword,
    "path": "name",
    "tokenOrder":"sequential",
    "fuzzy":{"prefixLength":1,"maxEdits":1}

  }
  ,"highlight": {
    "path": "name"
  }
}
    // "index": 'productSearch',
    // "text": {
    //   "query": req.query.keyword,
    //   "path": ["name","categories"],
    //   "fuzzy":{ 
    //   'prefixLength': 1,
    //   'maxExpansions': 256}
    // },
  
}, {
  '$project': {
   
    'name': 1,
    'shop': 1,
    // "score": { $meta: "searchScore" },
    "highlights": { $meta: "searchHighlights" },
    'image': 1
  
 } },
 { $sort : { "highlights.score": -1 } }
]),req.query).pagination();
//  console.log(await productapiFeature.query)
//  const productapiFeature=new ApiFeatures(productSchema.find(),req.query).search().filter().pagination();
    const shops=await shopapiFeature.query;
    const products=await productapiFeature.query;
  // console.log(shop.products);
 
    res.status(201).json({
      success:true,
      shops,
      products,
      shopCount,
      productCount
  })
  })




// update shop --role admin
exports.updateShop=catchAsyncErrors(async(req,res,next)=>{
  let shop = await shopSchema.findById(req.params.shopId);

if(req.body.paymentMethods){
  try {
    const response = await axios.put(
    `https://api.cashfree.com/api/v2/easy-split/vendors/${req.params.shopId}`,
    {

        'upi': {
            'vpa': JSON.parse(req.body.paymentMethods).upiId,
        },
        'phone': req.body.number||shop.number,
        'verifyAccount': true
    },
    {
        headers: {
          'x-client-id': process.env.CASHFREE_ID,
          'x-client-secret': process.env.CASHFREE_KEY,
            'Content-Type': 'application/json'
        }
    }
); 

} catch (error) {
  // console.log(error)
  return next(new ErrorHandler("Invalid upi id/phone number", 404));
}

}


   


  
    if(!shop){
      return next(new ErrorHandler("Shop not found", 404));
    }



    if(req.body.images){
      await shop.images.forEach(rev=>
        cloudinary.v2.uploader.destroy(rev.public_id, function(error,result) {
          // console.log(result, error)
         })
        )

      let images = [];

      if (typeof req.body.images === "string") {
        images.push(req.body.images);
      } else {
        images = req.body.images;
      }
    
      const imagesLinks = [];
    
      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: "shops_ecommerce",width:500,crop:"scale"
        });
    
        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    
      req.body.images = imagesLinks;
    }
  
    if(req.body.paymentMethods){
      req.body.paymentMethods=JSON.parse(req.body.paymentMethods)
    }
    if(req.body.locationCoords){
    
      const loc=JSON.parse(req.body.locationCoords)
      const finalLoc={
        type:"Point",
        coordinates:[loc.longitude,loc.latitude]
      }
    
      req.body.locationCoords=finalLoc
    }
    if(req.body.shopStatus){
    req.body.shopStatus="pending"
    }
    // console.log(req.body)


    shop = await shopSchema.findByIdAndUpdate(req.params.shopId,req.body,{
      new:true,runValidators:true,useFindAndModify:false
    });
  
    res.status(200).json({
      success:true,
      shop
    })
  })





//   Delete Shop --admin
exports.deleteShop=catchAsyncErrors(async(req,res,next)=>{
    const shop = await shopSchema.findById(req.params.shopId);
  
    if(!shop){
      return next(new ErrorHandler("Shop not found", 404));
    }
    if(shop.owner.toString()!==req.user.id.toString()){
      // console.log(shop.owner.toString()===req.user.id.toString());
      return next(new ErrorHandler("you can only delete your Shop,not Others", 404));
    }
    

   await productSchema.deleteMany({_id: { $in: shop.products}});
   await orderSchema.deleteMany({shop:shop._id});
    await userSchema.findByIdAndUpdate({_id:shop.owner},{$pull:{admin:`${req.params.shopId}`}})

   await shop.images.forEach(rev=>
      cloudinary.v2.uploader.destroy(rev.public_id, function(error,result) {
        // console.log(result, error)
       })
      )

      // await adminOrderSchema.findOneAndDelete({shop:shop._id})
  
  
    await shop.remove();
  
    res.status(200).json({
      success:true,
      message:"Shop Deleted"
    })
  
  })


// get shop details
exports.getShopDetails=catchAsyncErrors(async(req,res,next)=>{
  const shop = await shopSchema.findById(req.params.shopId).populate({path:"products",
match:{isActive:true}}).populate("reviews.user","name avatar");
  // const shop = await shopSchema.findById(req.params.shopId).populate("products").populate("reviews.user","name avatar");

  // console.log(await shopSchema.find({_id:req.params.shopId}).populate({path:"products",
  // match:{isActive:true}}).populate("reviews.user","name avatar").explain("executionStats"));

  if(!shop){
    return next(new ErrorHandler("Shop not found", 404));
  }

  const products=shop.products;

let groupProducts=[];

let categories=[];

await products.forEach(prod=>{
categories= categories.concat(prod.categories)
})

categories=[...new Set(categories)];

categories.map(cat=>{

  let thisproducts= products.filter(thisprod=>thisprod.categories.includes(cat))
  groupProducts.push({
            category:cat,
            products:thisproducts
             
          })

}) 





let isShopOpen
const nowDate = new Date();

const shopOpenDate=date.parse(date.format(nowDate, 'MMM DD YYYY') +" "+shop.openTime, 'MMM DD YYYY HH:mm');
const shopCloseDate=date.parse(date.format(nowDate, 'MMM DD YYYY') +" "+shop.closeTime, 'MMM DD YYYY HH:mm');
 
const openTimeDiff=  date.subtract(nowDate,shopOpenDate).toMinutes()
const closeTimeDiff=  date.subtract(shopCloseDate,nowDate).toMinutes()

const today=date.format(nowDate, 'dddd').toLowerCase(); 

// console.log("opentimediff",openTimeDiff)
// console.log("closetimediff",closeTimeDiff)
// console.log("timeNowfull",nowDate)
// console.log("timeNow",date.format(nowDate, 'hh:mm A [GMT]Z'))
// console.log("timeNow",date.format(nowDate, 'hh:mm A [GMT]Z'))
// console.log("timeNow gmt true",date.format(nowDate, 'hh:mm A [GMT]Z', true))
// console.log("wokingDays",shop.workingDays.includes(today))
if(!shop.workingDays.includes(today)){
  isShopOpen=false  }else{
if(openTimeDiff<0||closeTimeDiff<0){
  // if(openTimeDiff<0||closeTimeDiff<0||!shop.workingDays.includes(today)){
    isShopOpen=false 
    // isShopOpen=true; 
  }else{  
    isShopOpen=true 
  } 
  // console.log("isShoopen between",isShopOpen)
  

 
    // isShopOpen=true  
  } 
  // console.log("isShoopen end",isShopOpen)

  res.status(200).json({
    success:true,
    shop,
    groupProducts,
    categories,
    isShopOpen
  })
})

// get Adminshop details
exports.adminShopDetails=catchAsyncErrors(async(req,res,next)=>{
  const shop = await shopSchema.findById(req.params.shopId).populate("reviews.user","name avatar");

  if(!shop){
    return next(new ErrorHandler("Shop not found", 404));
  }

  const now = new Date();
  // const beforeDate = date.addHours(now, -24);


      
  const beforeDate=date.parse(date.format(now, 'MMM DD YYYY') +" "+"00:01", 'MMM DD YYYY HH:mm');
// console.log(beforeDate)
let todaySalesAggregate=await orderSchema.aggregate(
  [{
    "$match": {
     "shop":mongoose.Types.ObjectId(req.params.shopId),
      "orderStatus": {
        "$in": [
          "delivered",
          "accepted"
        ]
      },
      "createdAt": {
        "$gte":beforeDate 
      }
    }
  },{
    "$group": {
      "_id": {}, 
      totalAmount: { "$sum": "$itemsPrice"}
      
    }
  },
  ]
)

const todayOrdersCount=await orderSchema.countDocuments({ shop:req.params.shopId, orderStatus:"accepted", createdAt: {
  $gt: beforeDate,
}} )

// console.log(todaySales[0].totalAmount)
const todaySales=todaySalesAggregate[0]?.totalAmount||0



  res.status(200).json({
    success:true,
    shop,
    todayOrdersCount,
    todaySales
  })
})









// create/update shop reviews

exports.createShopReviews=catchAsyncErrors(async(req,res,next)=>{
  const {rating,comment}=req.body;
//   let emptyComment=" ";
// if(comment){
//   emptyComment=comment
// }
const review={
  user:req.user._id,
  // name:req.user.name,
  rating: Number(rating),
  timeStamp:Date.now(),
  comment,
  // userPhoto:req.user.avatar
  // comment:emptyComment
};
// console.log(review);

  const shop = await shopSchema.findById(req.params.shopId);

  const isReviewed=shop.reviews.find((rev)=>rev.user.toString()===req.user._id.toString());
  // console.log(isReviewed);          
  if(isReviewed){
    shop.reviews.forEach(rev=>{
      if(rev.user.toString()===req.user._id.toString()){
        rev.rating=rating;
        rev.timeStamp=Date.now();
       
        if(comment){
        rev.comment=comment}
      }else{ rev.comment=rev.comment}
    })
  }else{
    shop.reviews.push(review);
    shop.numOfReviews=shop.reviews.length;
  }

  let avg=0;
  shop.reviews.forEach((rev)=>{
    // console.log(avg)
    avg+=rev.rating
    // console.log(rev.rating)
  });
  shop.ratings=(avg/shop.reviews.length).toFixed(1);
  // shop.ratings=avg/shop.reviews.length;

  await shop.save({validateBeforeSave:false});

  res.status(200).json({
    success:true,
    reviews:shop.reviews,
    ratings:shop.ratings,
    numOfReviews:shop.numOfReviews,
  });
})


// get all reviews of this shop
exports.getShopReviews=catchAsyncErrors(async(req,res,next)=>{
  const shop = await shopSchema.findById(req.params.shopId);

  if(!shop){
    return next(new ErrorHandler("Shop not found", 404));
  }

  res.status(200).json({
    success:true,
    reviews:shop.reviews
  })
})









// get all shops--super admin
exports.getSuperAdminShops=catchAsyncErrors(async(req,res,next)=>{
  const shopCount=await shopSchema.countDocuments();
  const pendingShopCount=await shopSchema.countDocuments({shopStatus:"pending"});
  const rejectedShopCount=await shopSchema.countDocuments({shopStatus:"rejected"});

  const now = new Date();  
  const beforeDate=date.parse(date.format(now, 'MMM DD YYYY') +" "+"00:01", 'MMM DD YYYY HH:mm');

  let todayProfit=await orderSchema.aggregate(
    [{
      "$match": {
        "orderStatus": {
          "$in": [
            "delivered",
            "accepted"
          ]
        },
        "createdAt": {
          "$gte":beforeDate 
        }
      }
    },{
      "$group": {
        "_id": {}, 
        totalProfit: { "$sum": "$conveniencePrice"}
        
      }
    },
    ]
  )
  todayProfit=todayProfit[0]?.totalProfit||0

  
  let apiFeature
  

    apiFeature=new ApiFeatures(shopSchema.find().sort({createdAt:-1}),req.query).search().filter().pagination();
  
    const shops=await apiFeature.query;
 

      res.status(201).json({
        success:true,
        shops,
        pendingShopCount,
        rejectedShopCount,
        shopCount,
        todayProfit
    })
    })

// Approve/reject shops--super admin
exports.updateShopSuperAdmin=catchAsyncErrors(async(req,res,next)=>{
// console.log(req.body)
 const shop = await shopSchema.findByIdAndUpdate(req.params.shopId,req.body,{
    new:true,runValidators:true,useFindAndModify:false
  });

      res.status(201).json({
        success:true,
        shop
    })
    })