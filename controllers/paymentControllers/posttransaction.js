const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const PaytmChecksum=require("paytmchecksum");
const ErrorHandler = require("../../utils/errorhandler");
const orderSchema = require("../../models/orderModel");
const shopSchema = require("../../models/shopModel");

 
 

exports.posttransaction=catchAsyncErrors(async(req,res,next)=>{
 

if(req.body.STATUS==="TXN_SUCCESS"){
    let orderInfo= JSON.parse( req.body.UDF_1 )
    // console.log(orderInfo)

    // here i am validating paytm checksum
    // const order=await orderSchema.findOne({orderId:req.body.ORDERID}).populate("shop","paymentMethods owner")
    // const Mkey=order.shop.paymentMethods.paytmMkey


    // console.log("ttttttt")
    let shop=await shopSchema.findById(orderInfo.shop)
    // const Mkey=shop.paymentMethods.paytmMkey

    // console.log(Mkey)
    var paytmChecksum="";
    paytmChecksum = req.body.CHECKSUMHASH;
    // var isVerifySignature = PaytmChecksum.verifySignature(req.body,Mkey, paytmChecksum);

    var isVerifySignature = PaytmChecksum.verifySignature(req.body, process.env.NEXT_PUBLIC_PAYTM_MKEY, paytmChecksum);
if (!isVerifySignature) {
    return next(new ErrorHandler("Checksum Mismatch-Dont try to tamper", 404));
} 
 



//    await orderSchema.findOneAndUpdate({orderId:req.body.ORDERID},{paymentInfo:{status:"paid",id:req.body.TXNID}})
// const testShop=await shop.findOne(orderInfo.shop)


   orderInfo.shopOwner=shop.owner
   orderInfo.paidAt=Date.now();
   orderInfo.paymentInfo={status:"paid",id:req.body.TXNID}

  let order= await orderSchema.create(orderInfo)


  res.redirect(`${process.env.FRONTEND_HOST}/newOrder/${order._id}?shopId=${order.shop}&clearCart=true`);

 



}else{
    // await orderSchema.findOneAndDelete({orderId:req.body.ORDERID})
    res.redirect(`${process.env.FRONTEND_HOST}/cart?paymentError="some Issue in payment,please try again"`);
}
//  res.redirect(`http://localhost:3000/newOrder/${order._id}?shopId=${order.shop}`);
//  res.redirect('back');

    // res.status(200).json(
    //    req.body,

    // )
});