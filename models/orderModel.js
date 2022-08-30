const mongoose = require("mongoose");

const orderSchema=new mongoose.Schema({
    orderInfo:{
        // wantImmediately:{
        //     type:Boolean,
        //     default:false
        // },
        wantFoodAt:{
            type:String,
        },
        description:{
            type:String,
            default:""
        }

    }, 
    orderId:{
        type:String,
        required:[true,"please enter proper order id"],
        unique:[true,"please enter unique order id"],
    },
    startedCooking:{
        type:Boolean,
        default:false
    },
    secretCode:{
        type:String,
        required:[true,"please enter proper secret id"],
        select:false
    },
    orderItems:[
        {
            name:{
                type:String,
                required:[true,"please enter proper orderItems"]
            },
            price:{
                type:Number,
                required:[true,"please enter proper orderItems"]
            },
            quantity:{
                type:Number,
                required:[true,"please enter proper orderItems"]
            },  
            image:{
                type:String,
                // required:[true,"please enter proper orderItems"]
            },
            product:{
                type:mongoose.Schema.ObjectId,
                ref:"Product",
                required:[true,"please enter proper orderItems"],
            },          
        }

    ],
    yourReview:{
          
         
            rating:{
                type:Number,
                // required:true
            },
            comment:{
                type:String,
                // required:true
                // default:" "
            },
            default:{}
        }
    ,
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:[true,"please enter proper user id"]
    },
    shopOwner:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:[true,"please enter proper owner id"]
    },
    shop:{
        type:mongoose.Schema.ObjectId,
        ref:"Shop",
        required:[true,"please enter proper shopid"]
    },
    shopName:{
        type:String,
        required:[true,"please enter proper shop name"]
    },
    shopIdString:{
        type:String,
        
    },
    paymentInfo:{
        id:{
            type:String,
            default:""
            // required:true
        },
        status:{
            type:String,
            default:"pending"
        }
    },
    paidAt:{
        type:Date,
        required:[true,"please enter proper paidAt"]
    },
    orderNumber:{
        type:Number,
        required:[true,"please enter order number"]
    },
    itemsPrice:{
        type:Number,
        default:0
    },
    taxPrice:{
        type:Number,
        default:0
    },
    cookingTime:{
        type:Number,
        default:13
    },
    conveniencePrice:{
        type:Number,
        default:0
    },
    totalPrice:{
        type:Number,
        default:0
    },
    orderStatus:{
        type:String,
        required:true,
        default:"initiated"
        // default:"processing"
    },
    deliveredAt:Date,
    createdAt:{
        type:Date,
        default:Date.now
    }


})

module.exports=mongoose.model("Order",orderSchema);