const orderSchema = require("../../models/orderModel");
const productSchema=require("../../models/productModel");
// const Errorhandler=require("../../utils/errorhandler");

const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const ErrorHandler = require("../../utils/errorhandler");

const date = require('date-and-time');

const https = require('https');
const PaytmChecksum = require('paytmchecksum');
const ApiFeatures = require("../../utils/apiFeatures");
const axios = require("axios");


// const ThermalPrinter = require("node-thermal-printer").printer;
// const PrinterTypes = require("node-thermal-printer").types;
// const electron = typeof process !== 'undefined' && process.versions && !!process.versions.electron;



// create new order-user
exports.newOrder=catchAsyncErrors(async(req,res,next)=>{
    const{orderInfo,orderId,orderItems,paymentInfo,itemsPrice,taxPrice,conveniencePrice,totalprice,shopName}=req.body;
    // console.log(req.params.shopId.toString())
    // const shop=  mongoose.Types.ObjectId(String(req.params.shopId));;

    const order=await orderSchema.create({
        orderInfo,orderId,orderItems,paymentInfo,itemsPrice,taxPrice,conveniencePrice,totalprice,shopName,shop:req.params.shopId,paidAt:Date.now(),user:req.user._id
    })

    res.status(201).json({
        success:true,
        order
    })
})


// get Single Order
exports.getSingleOrder=catchAsyncErrors(async(req,res,next)=>{
    // console.log(req.params.id)
    const order=await orderSchema.findById(req.params.id).populate("user","name email");

    if(!order){
        return next(new ErrorHandler("order not found", 404));
    }

    res.status(201).json({
        success:true,
        order
    })
});


// get All OrderDetails-user
exports.myOrder=catchAsyncErrors(async(req,res,next)=>{
    // const orders=await orderSchema.find({user:req.user._id}).populate("shop","reviews images");
    const ordersCount=await orderSchema.countDocuments({user:req.user._id});
    
    const apiFeature=new ApiFeatures(orderSchema.find({user:req.user._id}).sort({createdAt:-1}).populate("shop","reviews images"),req.query).pagination();
    // const orders=await orderSchema.find({user:req.user._id}).populate("shop","reviews");
    // const orders=await orderSchema.find({user:req.user._id});
    const orders=await apiFeature.query;

    res.status(201).json({
        success:true,
        orders,
        ordersCount
    })
});
// get All Active-Orders-user
exports.myActiveOrders=catchAsyncErrors(async(req,res,next)=>{
  
    // const ordersCount=await orderSchema.countDocuments({user:req.user._id,orderStatus:"accepted"});
    
    const activeOrders=await orderSchema.find({user:req.user._id,orderStatus:"accepted"}).select('+secretCode')

    res.status(201).json({
        success:true,
        activeOrders,
    })
});


// get All OrderDetails-Admin
exports.getAllOrders=catchAsyncErrors(async(req,res,next)=>{
    const orders=await orderSchema.find({shop:req.params.shopId} );
    // const orders=await orderSchema.find({
    //     $and: [
    //         { orderStatus: "accepted"},
    //         {shop:req.params.shopId}
    //      ]
       
    //       }  );
    const acceptedOrders=orders.filter((rev)=>rev.orderStatus==="accepted")
    const notYetAcceptedOrders=orders.filter((rev)=>rev.orderStatus==="initiated")
    // const notYetAcceptedOrders=orders.filter((rev)=>{
    //     return rev.orderStatus==="initiated"&&rev.paymentInfo.status==="paid"})

    const nowDate = new Date();
    let futureOrders=[]
    let startCookingOrders=[]
   
    acceptedOrders.forEach((rev)=>{
        if(rev.orderInfo.wantFoodAt==="now"){

            startCookingOrders.push(rev)
        }else{
        // console.log(rev.orderInfo.wantFoodAt)
        let wantAt= date.parse(date.format(nowDate, 'MMM DD YYYY') +" "+rev.orderInfo.wantFoodAt, 'MMM DD YYYY HH:mm')
        let timeDiff=date.subtract(wantAt,nowDate).toMinutes()
        
        if(rev.cookingTime>=timeDiff){
            startCookingOrders.push(rev)
        }else{
            futureOrders.push(rev)
        }
        }
    }) 

    // console.log("all accepted orders",acceptedOrders.length)
    // console.log("future orders",futureOrders.length)
    // console.log("start cooking orders",startCookingOrders.length)

    let totalAmount=0;
 
    acceptedOrders.forEach((order)=>{
        totalAmount+=order.totalPrice
    });

    res.status(201).json({
        success:true,
        acceptedOrders,
        startCookingOrders,
        futureOrders,
        notYetAcceptedOrders,
        totalAmount
    })
});

// get All orders history-Admin
exports.getOrdersHistory=catchAsyncErrors(async(req,res,next)=>{
    let ordersHistory;
    let ordersHistoryCount
    if(req.query.numOfDays){
        const now = new Date();
        const beforeDate = date.addDays(now, -req.query.numOfDays);
        ordersHistoryCount=await orderSchema.countDocuments({ shop:req.params.shopId,
            createdAt: {
                $gt: beforeDate,
        }});
    
        
        const apiFeature=new ApiFeatures(orderSchema.find({ shop:req.params.shopId,
            createdAt: {
                $gt: beforeDate,
        }} ).sort({createdAt:-1}),req.query).pagination();
        ordersHistory=await apiFeature.query
    //  ordersHistory=await orderSchema.find({ shop:req.params.shopId,
    //     createdAt: {
    //         $gt: beforeDate,
    // }} )
    }else{

    //  ordersHistory=await orderSchema.find({ shop:req.params.shopId} );
     ordersHistoryCount=await orderSchema.countDocuments({ shop:req.params.shopId});
     const apiFeature=new ApiFeatures(orderSchema.find({ shop:req.params.shopId} ).sort({createdAt:-1}),req.query).pagination();
    ordersHistory=await apiFeature.query

    }
    // const ordersHistory=await orderSchema.find({ shop:req.params.shopId} );

    // const ordersHistory=await orderSchema.find({ $and: [{"paymentInfo.status":"paid" },{shop:req.params.shopId}]} );
    // console.log(await orderSchema.find({ shop:req.params.shopId} ).explain("executionStats"))
 
    // console.log("all orders",ordersHistory)
 


    res.status(201).json({ 
        success:true,
        ordersHistory,
        ordersHistoryCount
    })
});


// update Order Status--admin
exports.updateOrder=catchAsyncErrors(async(req,res,next)=>{
    let order=await orderSchema.findById(req.params.id).select('+secretCode');
    // let order=await orderSchema.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("order not found", 404));
    }
    if(order.orderStatus==="delivered"){
        return next(new ErrorHandler("you have already delivered this order", 400));
    }
    if(req.params.shopId!=order.shop){
        return next(new ErrorHandler("This order is not from this current shop", 400));
    }
    if(order.orderStatus==="accepted"&&(req.body.status==="accepted")){
        return next(new ErrorHandler("you have already Accepted this order", 400));
    }    
    
    
    if(order.orderStatus==="initiated"&&(req.body.status==="delivered")){
        return next(new ErrorHandler("you have not Accepted this order yet", 400));
    }
    if(order.orderStatus==="rejected"&&(req.body.status==="rejected")){
        return next(new ErrorHandler("you have already rejected this order", 400));
    }

// here i implemented refund
    // if(req.body.status==="rejected"){
  

    //     var paytmParams = {};

    //     paytmParams.body = {
    //         "mid"          : process.env.NEXT_PUBLIC_PAYTM_MID,
    //         "txnType"      : "REFUND",
    //         "orderId"      : order.orderId,
    //         "txnId"        : order.paymentInfo.id,
    //         "refId"        : Math.floor(Math.random()*Date.now()).toString(),
    //         "refundAmount" : order.totalPrice.toString(),
    //     };

    //     // console.log("params bodyyyyyy",paytmParams)

    //     PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.NEXT_PUBLIC_PAYTM_MKEY).then(function(checksum){

    //         paytmParams.head = {
    //             "signature"  : checksum
    //         };
        
    //         var post_data = JSON.stringify(paytmParams);
        
    //         var options = {
        
    //             /* for Staging */
    //             // hostname: "securegw-stage.paytm.in",
    //             hostname: process.env.NEXT_PUBLIC_PAYTM_HOST_NAME,
        
    //             /* for Production */
    //             // hostname: 'securegw.paytm.in',
        
    //             port: 443,
    //             path: '/refund/apply',
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Content-Length': post_data.length
    //             }
    //         };
    //         // console.log("optionss",options)
    //         var response = "";
    //         var post_req = https.request(options, function(post_res) {
    //             post_res.on('data', function (chunk) {
    //                 response += chunk;
    //             });
        
    //             post_res.on('end', function(){
                   
    //                 console.log('Response: ', JSON.parse(response));
                
    //             });
    //         }); 
        
    //         post_req.write(post_data);
    //         post_req.end();
            
      
    //     });  
      
    // }
if(req.body.status==="rejected"){
    try {
        const response = await axios.post(
        `${process.env.CASHFREE_HOST}/orders/${order.orderId}/refunds`,
        {
            "refund_amount":order.totalPrice,
            "refund_id":"refund_"+Math.floor(Math.random()*Date.now()).toString()
        },
        {
            headers: {
              'x-client-id': process.env.CASHFREE_ID,
              'x-client-secret': process.env.CASHFREE_KEY,
                'Content-Type': 'application/json',
                "x-api-version":process.env.CASHFREE_VERSION
            }
        }
    ); 
    
    } catch (error) {
    //   console.log(error)
      return next(new ErrorHandler("Unable to initiate refund", 404));
    }
}




if(req.body.status){
    order.orderStatus=req.body.status}
   else{
    order.startedCooking=req.body.startedCooking


    // here i added printer support
//     try {
        

//     let printer = new ThermalPrinter({
//         type: PrinterTypes.EPSON,                    // Printer type: 'star' or 'epson'
//         interface: 'printer:auto',         // Printer interface
//         characterSet: 'SLOVENIA',                   // Printer character set - default: SLOVENIA
//         removeSpecialCharacters: false,             // Removes special characters - default: false
//         lineCharacter: "=",                         // Set character for lines - default: "-"
//         options:{                                   // Additional options
//           timeout: 5000                             // Connection timeout (ms) [applicable only for network printers] - default: 3000
//         },
//         driver: require(electron ? 'electron-printer' : 'printer')
//       });
// //  console.log('printer',printer)
 
//       printer.alignCenter();
//       printer.println("Hello world");
//       printer.cut();

//     } catch (error) {
//         console.log('tryCatch print error',error)
//     }


    
}

    if(order.orderStatus==="accepted"){
    for(o of order.orderItems){
        await updateStock(o.product,o.quantity)
    }}
    if(req.body.status==="delivered"){
      
        if(!req.body.secretCode){
            return next(new ErrorHandler("Please enter Code", 400));
        }
        if(order.secretCode!=req.body.secretCode){
            return next(new ErrorHandler("Wrong Code", 400));
   
        }
        order.deliveredAt=Date.now();
    }

    await order.save({validateBeforeSave:false});
    res.status(201).json({
        success:true,
        orderStatus:order.orderStatus,
      
    })
})

async function updateStock(id,quantity){

    // console.log(id)
    const product=await productSchema.findById(id);
    product.Stock-=quantity;
   await product.save({validateBeforeSave:false})
}


// delete Order-Admin
exports.deleteOrder=catchAsyncErrors(async(req,res,next)=>{
    const order=await orderSchema.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("order not found", 404));
    }

    await order.remove()

    res.status(201).json({
        success:true,
      
    })
});

// delete Order(only before payment)-user
exports.deleteOrderBeforePayment=catchAsyncErrors(async(req,res,next)=>{
    // console.log(req.params.orderId)
    const order=await orderSchema.findOne({orderId:req.params.orderId});

    if(!order){
        return next(new ErrorHandler("order not found", 404));
    }
    if(order.paymentInfo.status==="paid"){
        return next(new ErrorHandler("u cannot delete order once it is paid", 404));
    }

    await order.remove()

    res.status(201).json({
        success:true,
      
    })
});




// create order review
exports.createOrderReviews=catchAsyncErrors(async(req,res,next)=>{
    const {rating,comment}=req.body;
    const thisOrder=await orderSchema.findById({_id:req.params.orderId})
    let yourReview
if(comment){
//   yourReview={
   
//     rating: Number(rating),
//     comment
//   };
thisOrder.yourReview.rating=rating
thisOrder.yourReview.comment=comment

}else{
    //  yourReview={
   
    //     rating: Number(rating)
        
    //   };
    thisOrder.yourReview.rating=rating
}
//   console.log(yourReview);
  
    // const order = await orderSchema.findByIdAndUpdate({_id:req.params.orderId},{yourReview:yourReview});
    // const order = await orderSchema.findById({_id:req.params.orderId});
//   console.log(order.yourReview)
await thisOrder.save()
  
    res.status(200).json({
      success:true,
      yourReview:thisOrder.yourReview
    });
  })