const express = require("express");
const app=express();
const cookieParser=require("cookie-parser");
const bodyParser=require("body-parser");
const fileUpload=require("express-fileupload")
const cors=require("cors")


const dotenv=require("dotenv");

// testing setup to dotEnv config
// dotenv.config({path:"./config.env"})


app.use(
    cors(
//         {
 
//         origin:process.env.FRONTEND_HOST,
//         credentials:true,
        
//     }
    )
);


const errorMiddleware=require("./middleware/error");

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({limit: '50mb',extended:true}));
app.use(fileUpload());

// routes import
const product=require("./routes/productRoute");
const shop=require("./routes/shopRoute");
const user = require("./routes/userRoute");
const order= require("./routes/orderRoute");
const payment= require("./routes/paymentRoute");

app.use("/api/v1",product);
app.use("/api/v1",shop);
app.use("/api/v1",user);
app.use("/api/v1",order);
app.use("/api/v1",payment);



// middleware for Errors
app.use(errorMiddleware);

module.exports=app
