const productSchema= require("../../models/productModel");
const shopSchema = require("../../models/shopModel");
const ErrorHandler = require("../../utils/errorhandler");
const catchAsyncErrors=require("../../middleware/catchAsyncErrors")
const cloudinary=require("cloudinary")


// create Product --admin
exports.createProduct=catchAsyncErrors(async(req,res,next)=>{
  // let finalBody={
  //   name:req.body.name,
  //   price:req.body.price,
  //   description:req.body.description,
  //   categories:req.body.categories,
  //   isVegetarian:req.body.ispureVeg
  // }
  // console.log(req.body)
  let categories=[]

  if(req.body.image){
 
    
    const myCloud=await cloudinary.v2.uploader.upload(req.body.image,{folder:"products_ecommerce",width:150,crop:"scale"})
    // const myCloud=await cloudinary.v2.uploader.upload(req.body.image,{folder:"products_ecommerce",width:150,crop:"scale"})
    req.body.image={
      publicId:myCloud.public_id,
      
      url:myCloud.secure_url,
    }
  }
if(req.body.categories){
  categories=req.body.categories
  req.body.categories=categories}
  req.body.shop=req.params.shopId;
  
 
    const product = await productSchema.create(req.body);


    // const product = await productSchema.create({req.body},shopId);

    const isShop=await shopSchema.findById(req.params.shopId);

    if(!isShop){
      return next(new ErrorHandler("Shop not found", 404));
    }

    const shopNew=await shopSchema.findByIdAndUpdate(req.params.shopId,{$push:{products:`${product._id}`}});

    // const shop=await shopSchema.findByIdAndUpdate(req.params.shopId,{$push:{products:`${product._id}`}});
  

    res.status(201).json({
        success:true,
        product
    })
});



// get all products of this shop
exports.getAllProducts=catchAsyncErrors(async(req,res,next)=>{
  const shop=await shopSchema.findById(req.params.shopId).populate("products");
// console.log(shop.products);

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

  res.status(201).json({
    success:true,
    groupProducts
})
});



// update product --admin

exports.updateProduct=catchAsyncErrors(async(req,res,next)=>{
  let product = await productSchema.findById(req.params.id);

  if(!product){
    return next(new ErrorHandler("Product not found", 404));
  }


  if(req.body.image){
    let myCloud
    if(!product.image.publicId){
      console.log("product.image.publicId")
      
      myCloud=await cloudinary.v2.uploader.upload(req.body.image,{folder:"products_ecommerce",width:500,crop:"scale"})
      
    }else{
      // console.log(product.image.publicId)
    myCloud=await cloudinary.v2.uploader.upload(req.body.image,{public_id:product.image.publicId,width:500,crop:"scale",invalidate:true})
    
  }
  req.body.image={
    publicId:myCloud.public_id,
    
    url:myCloud.secure_url,
  }
}

if(req.body.Stock){
  req.body.renewToStock=req.body.Stock
}





  product = await productSchema.findByIdAndUpdate(req.params.id,req.body,{
    new:true,runValidators:true,useFindAndModify:false
  });

  res.status(200).json({
    success:true,
    product
  })
});



// delete product --Admin
exports.deleteProduct=catchAsyncErrors(async(req,res,next)=>{
  const product = await productSchema.findById(req.params.id);

  if(!product){
    return next(new ErrorHandler("Product not found", 404));
  }
  
  const shop = await shopSchema.findById(product.shop);

  const updatedShopProducts=shop.products.filter((prod)=>prod.toString()!==product._id.toString());
  // console.log(updatedShopProducts);
  shop.products=updatedShopProducts;

  await shop.save({validateBeforeSave:false});
  
  await product.remove();

  if(product.image.publicId){
  await cloudinary.v2.uploader.destroy(product.image.publicId, function(error,result) {
    // console.log(result, error)
   });
  }


  res.status(200).json({
    success:true,
    message:"Product Deleted"
  })

});


// get Product details
exports.getProductDetails=catchAsyncErrors(async(req,res,next)=>{
  const shop=await shopSchema.findById(req.params.shopId);
  
  if(!shop){
    return next(new ErrorHandler("Shop not found", 404));
   }
  let product = await productSchema.findById(req.params.id);

  if(!product){
   return next(new ErrorHandler("Product not found", 404));
  }
  // product.productShopMid=shop.paymentMethods.

 
  res.status(200).json({
    success:true,
   product,
   productShopPaytmMid:shop.paymentMethods.paytmMid,
   productShopName:shop.name,
   productShopOpenTime:shop.openTime,
   productShopCloseTime:shop.closeTime,
  })
})




// get Adminproducts of this shop
exports.getAdminShopProducts=catchAsyncErrors(async(req,res,next)=>{
  const shop = await shopSchema.findById(req.params.shopId).populate("products");

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


  res.status(200).json({
    success:true,
    unGroupProducts:shop.products,
    groupProducts,
    categories
  })
});