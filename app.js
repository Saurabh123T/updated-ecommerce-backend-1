const express = require("express");
const app=express();
const cookieParser=require("cookie-parser");
const bodyParser=require("body-parser");
const fileUpload=require("express-fileupload")
const cors=require("cors")


const dotenv=require("dotenv");

// testing setup to dotEnv config
// dotenv.config({path:"./config.env"})
if(process.env.NODE_ENV !== "PRODUCTION"){
    const dotenv=require("dotenv");
dotenv.config({path:"./config.env"})
}

app.use(
    cors(
        {
 
        origin:[process.env.FRONTEND_HOST],
        credentials:true,
        
    }
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

// app.set("trust proxy", 1);

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || 'Super Secret (change it)',
//     resave: true,
//     saveUninitialized: false,
//     cookie: {
//       sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax', // must be 'none' to enable cross-site delivery
//       secure: process.env.NODE_ENV === "production", // must be true if sameSite='none'
//     }
//   })
// );

// middleware for Errors
app.use(errorMiddleware);

module.exports=app
