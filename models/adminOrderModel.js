const mongoose = require("mongoose");


const adminOrderSchema=new mongoose.Schema({

    shop:{
        type:mongoose.Schema.ObjectId,
        ref:"Shop",
        required:[true,"please enter proper shopid"]
    },
    owner:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:[true,"please enter Owner id"]
    },
    acceptedOrders:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"Order",
            default:[]
        }
    ],
    deliveredOrders:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"Order",
            default:[]
        }
    ],
})



module.exports=mongoose.model("adminOrder",adminOrderSchema);