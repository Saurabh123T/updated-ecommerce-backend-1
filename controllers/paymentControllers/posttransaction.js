const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const PaytmChecksum=require("paytmchecksum");
const ErrorHandler = require("../../utils/errorhandler");
const orderSchema = require("../../models/orderModel");
const shopSchema = require("../../models/shopModel");
const axios=require("axios")

 
 

exports.posttransaction=catchAsyncErrors(async(req,res,next)=>{
   


const response = await axios.get(`${process.env.CASHFREE_HOST}/orders/${req.body.data.oid}`, {
    headers: {
        'accept': 'application/json',
        'x-api-version': process.env.CASHFREE_VERSION,
        'x-client-id': process.env.CASHFREE_ID,
        'x-client-secret': process.env.CASHFREE_KEY
    }
});

 

// console.log("res_data",response.data)




if(response.data.order_status==="PAID"){
  
    let shop=await shopSchema.findById(req.body.data.cartShop)


  const finalOrderInfo={  
            orderInfo:req.body.data.orderInfo,
        orderId:req.body.data.oid,
        orderItems:req.body.data.cartItems,
        itemsPrice:req.body.data.SubTotal,
        conveniencePrice:req.body.data.ConvenienceCharge,
        totalPrice:req.body.data.OrderTotal,
        taxPrice:req.body.data.taxPrice,
        shop:req.body.data.cartShop,
        shopName:req.body.data.cartShopName,
        paidAt:Date.now(),
        user:req.user._id,
        orderNumber:Math.floor(Math.random() * 999) + 1,
        secretCode:Math.floor(Math.random() * (9999) + 1000),
        cookingTime:req.body.data.cookingTime,
        shopOwner:shop.owner,
        paymentInfo:{status:"paid",id:response.data.order_token}
    }

  

  let order= await orderSchema.create(finalOrderInfo)
    res.status(200).json({
    success:true,
    orderId:order._id,
    shopId:order.shop

     } )

}else{
   
    res.status(200).json({
        success:false
         } )
 
}










// if(req.body.STATUS==="TXN_SUCCESS"){
//     let orderInfo= JSON.parse( req.body.UDF_1 )
  
//     let shop=await shopSchema.findById(orderInfo.shop)

//     var paytmChecksum="";
//     paytmChecksum = req.body.CHECKSUMHASH;
//     var isVerifySignature = PaytmChecksum.verifySignature(req.body, process.env.NEXT_PUBLIC_PAYTM_MKEY, paytmChecksum);
// if (!isVerifySignature) {
//     return next(new ErrorHandler("Checksum Mismatch-Dont try to tamper", 404));
// } 
 


//    orderInfo.shopOwner=shop.owner
//    orderInfo.paidAt=Date.now();
//    orderInfo.paymentInfo={status:"paid",id:req.body.TXNID}

//   let order= await orderSchema.create(orderInfo)


//   res.redirect(`${process.env.FRONTEND_HOST}/newOrder/${order._id}?shopId=${order.shop}&clearCart=true`);

 



// }else{
//     // await orderSchema.findOneAndDelete({orderId:req.body.ORDERID})
//     res.redirect(`${process.env.FRONTEND_HOST}/cart?paymentError="some Issue in payment,please try again"`);
// }



//  res.redirect(`http://localhost:3000/newOrder/${order._id}?shopId=${order.shop}`);
//  res.redirect('back');

//     res.status(200).json(
//        req.body,

//     )
});