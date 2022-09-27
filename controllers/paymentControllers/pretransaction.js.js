const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const https = require('https');
const ErrorHandler = require("../../utils/errorhandler");
// const PaytmChecksum = require('./PaytmChecksum');
const PaytmChecksum = require('paytmchecksum');
const shopSchema=require("../../models/shopModel")
const orderSchema=require("../../models/orderModel")
const productSchema=require("../../models/productModel");
const date = require("date-and-time")
// const { Console } = require("console");

const axios = require('axios');

  
 
exports.pretransaction=catchAsyncErrors(async(req,res,next)=>{
    const shop = await shopSchema.findById({_id:req.body.cartShop})
 
    // console.log(date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'))
    // const Mid=await shop.paymentMethods.paytmMid;
    // const Mkey=await shop.paymentMethods.paytmMkey;
 
    const Mid=process.env.NEXT_PUBLIC_PAYTM_MID;
    const Mkey=process.env.NEXT_PUBLIC_PAYTM_MKEY;
    
    const today=date.format(new Date(), 'dddd').toLowerCase(); 


    if(!shop.workingDays.includes(today)){
        return next(new ErrorHandler(`sorry, shop is closed on ${today}`, 404));
    }

if(!shop.isActive){
    return next(new ErrorHandler("sorry, shop is currently unservisable", 404));
}
if(shop.shopStatus!=="approved"){
    return next(new ErrorHandler("sorry, shop is currently unservisable(~pending approval)", 404));
}


    // process.env["MKEY"]=Mkey
    // console.log(process.env.TEST)


    let testingOrderInfo


    let product,sumTotal=0;
    let cart=req.body.cartItems;
    for(let item in cart){
        sumTotal+=cart[item].price*cart[item].quantity
        product = await productSchema.findById(cart[item].product)
        if(!product){
            return next(new ErrorHandler("some products in your cart dosent exist, don't tamper cart", 404));
        }
        if(product.isActive==false){
            return next(new ErrorHandler("some products in your cart became unActive/unavailable", 404));
        }

        if(product.Stock<cart[item].quantity){
            return next(new ErrorHandler("Sorry few items in your cart went out of stock", 404));
        }
        if(product.price!==cart[item].price){
            return next(new ErrorHandler("dont tamper product price", 404));
        }
        
    }
        // console.log(req.body.SubTotal)
        if (sumTotal!==req.body.SubTotal){
            return next(new ErrorHandler("don't tamper cart total/product price", 404));
            
        }


try {

    // let a=await orderSchema.find({orderId:req.body.oid})
     testingOrderInfo={      orderInfo:req.body.orderInfo,
        orderId:req.body.oid,
        orderItems:req.body.cartItems,
        itemsPrice:req.body.SubTotal,
        conveniencePrice:req.body.ConvenienceCharge,
        totalPrice:req.body.OrderTotal,
        shop:req.body.cartShop,
        shopName:req.body.cartShopName,
        paidAt:Date.now(),
        user:req.user._id,
        orderNumber:Math.floor(Math.random() * 999) + 1,
        secretCode:Math.floor(Math.random() * (9999) + 1000),
        cookingTime:req.body.cookingTime}
        

} catch (error) {
    return next(new ErrorHandler("some error in order", 404));
}

    var paytmParams = {};
    
  

 
    paytmParams.body = {
        "requestType"   : "Payment",
        "mid"           : Mid,
    //     "mid"           : process.env.NEXT_PUBLIC_PAYTM_MID,
        "websiteName"   : "DEFAULT",
    //     "websiteName"   : "YOUR_WEBSITE_NAME",
        "orderId"       : req.body.oid,
        "callbackUrl"   : `${process.env.BACKEND_HOST}/api/v1/payment/posttransaction`,
        "txnAmount"     : {
            "value"     : req.body.OrderTotal,
            "currency"  : "INR",
        }, 
        "userInfo"      : {
    //         "custId"    : "mohithkumar808@gmail.com",
            "custId"    : req.user._id,
        },

        "extendInfo"    :{
            "udf1"  :   JSON.stringify(testingOrderInfo),
        },
        // "splitSettlementInfo":{
        //     "splitMethod":"AMOUNT",
        //     "splitInfo":[{
        //     "mid":shop.paymentMethods.paytmMid,
        //     "amount":{
        //       "value":req.body.SubTotal.toString(),
        //       "currency":"INR"
        //     },
        //     }]
        // } 

        
    };

   const checksum=await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body),Mkey)


        paytmParams.head = {
            "signature"    : checksum
        }; 
    
        var post_data = JSON.stringify(paytmParams);
  

    // const requestAsync=async()=>{ 
    //     return new Promise((resolve,reject)=>{
    //             var options = { 
    
    //                     /* for Staging */
    //                     hostname: process.env.NEXT_PUBLIC_PAYTM_HOST_NAME,
    //             //         hostname: 'securegw-stage.paytm.in',
                
    //                     /* for Production */
    //             //         hostname: 'securegw.paytm.in',
                
    //                     port: 443,
    //                     path: `/theia/api/v1/initiateTransaction?mid=${Mid}&orderId=${req.body.oid}`,
    //                     method: 'POST',
    //                     headers: {
    //                         'Content-Type': 'application/json',
    //                         'Content-Length': post_data.length,
                
    //                     }
    //                 };
                
    //                 var response = "";
    //                 var post_req = https.request(options, function(post_res) {
    //                     post_res.on('data', function (chunk) {
    //                         response += chunk;
             
    //                     });
                 
    //                     post_res.on('end', function(){
    //             //             console.log('Response: ', response);
    //                        
    //                 let ress=JSON.parse(response).body
    //                 ress.success=true
    //                   resolve(ress)   
    //           });
    //                 });
                
    //                  post_req.write(post_data);
    //                 post_req.end();
    //     })
    // }

    






    let response
    const requestAsync=async()=>{
    //  console.log( JSON.stringify(testingOrderInfo))
    const orderDetails={
        "order_id": req.body.oid.toString(),
        "order_amount": req.body.OrderTotal,
        "order_currency": "INR",
        "order_note": `order note here`,
            //     "order_meta":{
            // "notify_url":`${process.env.FRONTEND_HOST}/cart`,
            //     "return_url":`${process.env.FRONTEND_HOST}/newOrder/loading?order_id={order_id}&order_token={order_token} `,
            //     },
        //     "order_splits": [{
        //         "vendor_id": "vendor_mohith",
        //         "amount": req.body.subTotal
        //     }
        // ],
        "customer_details": {
         "customer_id": req.user._id.toString(),
          "customer_name":req.user.name,
          "customer_email": req.user.email,
          "customer_phone": "9816512345"
        }
      }
   
   response=await axios.post(
            `${process.env.CASHFREE_HOST}/orders`,
         orderDetails ,
            {
                headers: {
              
                    'Content-Type': 'application/json',
                    'x-api-version': process.env.CASHFREE_VERSION,
                    'x-client-id': process.env.CASHFREE_ID,
                    'x-client-secret': process.env.CASHFREE_KEY
                }
            }) 

    }

     
   await requestAsync()
    let myr=response.data
// console.log(myr)







    // let myr=await requestAsync()





    res.status(200).json(
       myr,


    //    order
    )
});