const app=require("./app");

// const dotenv=require("dotenv");
const connectDatabase=require("./config/database")
const cloudinary=require("cloudinary")

const orderSchema=require("./models/orderModel")
// const {MongoClient} = require('mongodb');

// const mongoose = require("mongoose");

let watchOrder;

const PushNotifications = require("@pusher/push-notifications-server");

// handling Uncaught Exception


process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to unCaught Exception`);
    process.exit(1);

});



//config
// testing setup to dotEnv config

if(process.env.NODE_ENV !== "PRODUCTION"){
    const dotenv=require("dotenv");
dotenv.config({path:"./config.env"})
}

connectDatabase();

cloudinary.config({ 
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});

const server=app.listen(process.env.PORT || 4000,async()=>{
    try {
     
        watchOrder=orderSchema.watch(
            [
            {
  
                "$match":{
            
                    operationType:"insert",
                    // operationType:"update",
                    // "fullDocument.orderStatus":"initiated",
                    // "fullDocument.paymentInfo.status":"paid"
                }
            }
        ] 
        ,{"fullDocument":"updateLookup"} 
         )





         watchOrder.on("change",(next)=>{

            const thisShopId=next.fullDocument?.shop?.toString()
            const newOrder=next.fullDocument
           
       
            io.to(thisShopId).emit("newOrder",newOrder)


            const beamsClient = new PushNotifications({
                instanceId: process.env.PUSHER_INSTANCE_ID,
                secretKey: process.env.PUSHER_SECRET_ID,
              });
              try {
                  
             
            beamsClient.publishToUsers([newOrder.shopOwner?.toString()], {
  
    web: {
      notification: {
        title: `New order(order.Num-${newOrder.orderNumber}) - ₹${newOrder.totalPrice}`, 
        body:`${ newOrder.orderItems.map((ord)=> ord.name+"x"+ord.quantity+", ")}`,
        deep_link: `${process.env.FRONTEND_HOST}/${newOrder.shop}/admin/orders`,
        icon:"https://picsum.photos/200"
      },
    },
  })
  .then((publishResponse) => {
    // console.log("Just published:", publishResponse.publishId);
  })
  .catch((error) => {
    // console.error("Error:", error);
  });
} catch (error) {
         console.log(error)         
}     
  
        })  
        
        console.log(`Server is working on ${process.env.BACKEND_HOST}`)
        // console.log(`Server is working on http://localhost:${process.env.PORT}`)
    } catch (error) {
        console.log(error)
    }
})


process.on("unhandledRejection",(err)=>{
    console.log(`Error: ${err.message}`); 
    console.log(`Shutting down the server due to unhandled promise rejection`);

    server.close(()=>{
        process.exit(1);
    })
})







// socket.io
 const io=require("socket.io")(server,{
    pingTimeout:60000,
    cors:{
        origin:process.env.FRONTEND_HOST
        // origin:'http://localhost:3000'
    }

})
    io.on("connection",(socket)=>{
 
        console.log("connected to socket.io");
  
        

        socket.on("setup",(shopId)=>{
            socket.join(shopId);
            socket.activeRoom=shopId;
            console.log(shopId);
            // console.log(socket.rooms);  
            socket.emit("connected")
        })
 
    
}) 
