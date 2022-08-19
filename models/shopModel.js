const mongoose = require("mongoose");


const shopSchema =new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter shop name"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"Please enter shop description"]
    },
    location:{
        type:String,
        required:[true,"Please enter Shop location"]
    },
    ratings:{
        type:Number,
        default:0
    },
    isPureVeg:{
        type:Boolean,
        required:[true,"Please enter is it Pure-veg or not"],
    },
    isActive:{
        type:Boolean,
        default:false
    },
    openTime:{
        type:String,
        default:"09:00"
    },
    closeTime:{
        type:String,
        default:"17:00"
    },
    categories:[{
        type:String,
        default:[]
    }
    ],
    images:[
        {
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        }
    ],
    
    numOfReviews:{
        type:Number,
        default:0
    },
    shopStatus:{
        type:String,
        default:"pending"
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"User",
                required:true
            },
            // name:{
            //     type:String,
            //     required:true
            // },
       
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                // required:true
                default:" "
            },
                timeStamp:{
        type:Date,
        required:true
    },
        }
    ],
    // createdAt:{
    //     type:Date,
    //     default:Date.now
    // },
    paymentMethods:{
        paytmMid:{type:String,required:true},
        paytmMkey:{type:String,required:true,select:false}
    },
    locationCoords:{
        // latitude:{type:String,required:true},
        // longitude:{type:String,required:true}
        type: {type: String, default: 'Point',required:true},
        coordinates: {type: [Number],required:true}
    },
  
    products:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"Product",
            default:[]
        }
    ],
    workingDays:
        {
            type:[String],
            default:["monday","tuesday","wednesday","thursday","friday","saturday"]
        },
    
    owner:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:[true,"Please enter Owner name"]
    }
},
{ timestamps: true }
)


// shopSchema.index({locationCoords:"2dsphere"});

module.exports=mongoose.model("Shop",shopSchema)