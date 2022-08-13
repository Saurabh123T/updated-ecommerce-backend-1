const mongoose = require("mongoose");

const productSchema =new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter Product name"],
        trim:true
    },
    description:{
        type:String,
        // required:[true,"Please enter Product description"]
        default:""
    },
    price:{
        type:Number,
        required:[true,"Please enter Product price"],
        maxLength:[8,"Please cannot exceed 7 characters"]
    },
    cookingTime:{
        type:Number,
        default:15,
        maxLength:[3,"Please cannot exceed 3 characters"]
    },
    isActive:{
        type:Boolean,
        default:true
    },
    isBestSeller:{
        type:Boolean,
        default:false
    },
    isVegetarian:{
        type:Boolean,
        required:[true,"Please enter is it veg or not"],
    },
    ratings:{
        type:Number,
        default:0
    },
    image:
        {
            publicId:{
                type:String,
                // required:true
                default:""
            },
            url:{
                type:String,
                // required:true
                default:""
            }
        }
    ,
    // category:{
    //     type:String,
    //     required:[true,"Please enter Product Category"]
    // },
    categories:[{
        type:String,
        required:[true,"Please enter atleast 1 category"],
    }
    ],
    Stock:{
        type:Number,
        required:[true,"Please enter Product price"],
        maxLength:[4,"Please cannot exceed 4 characters"],
        default:1

    },
    renewToStock:{
        type:Number,
        required:[true,"Please enter Product price"],
        maxLength:[4,"Please cannot exceed 4 characters"],
        default:50

    },
    enableStockRenew:{
        type:Boolean,
        default:true
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"User",
                required:true
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:String,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
    // createdAt:{
    //     type:Date,
    //     default:Date.now
    // },

    shop:   {
        type:mongoose.Schema.ObjectId,
        ref:"Shop",
        required:true
    }
},
{ timestamps: true }
)

module.exports=mongoose.model("Product",productSchema)
