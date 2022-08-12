const mongoose = require("mongoose");
const validator=require("validator");
const bcrypt=require("bcryptjs");

const userSchema=new mongoose.Schema({
    name:{
        type: String,
        required:[true,"please enter your name"],
        maxlength:[30,"name cannot exceed 30 characters"],
        minlength:[3,"name should be atleat 3 characters"]
    },
    email:{
        type: String,
        required:[true,"please enter your Email"],
        unique:true,
        validate:[validator.isEmail,"Please enter a valid email"]
    },
    password:{
        type:String,
        required:[true,"please enter your password"],
        minlength:[4,"Password should be atleat 4 characters"],
        select:false
    },
    googleSub:{
        type:String,
        default:""
    },
    avatar:{
        type:String,
        default:""
    },
    isSuperAdmin:{
        type:Boolean,
        default:false
    },
    number:{
        type:Number,
        minlength:[10,"number should be atleat 10 digits"], 
        maxlength:[12,"number should be below 12 digits"],
        default:null,
       
    },
    admin:[{
        
            type:mongoose.Schema.ObjectId,
            ref:"Shop",
            default:[]
     
    }], 
 
    favourites:[{
        
            type:mongoose.Schema.ObjectId,
            ref:"Shop",
            default:[]
     
    }], 
 
    // favourites:{
    //     type:[{
    //         type:mongoose.Schema.ObjectId,
    //         ref:"Shop",
    //     }],
    //     default:[]
    // }, 

},
{ timestamps: true });

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password=await bcrypt.hash(this.password,10);
})

module.exports=mongoose.model("User",userSchema)