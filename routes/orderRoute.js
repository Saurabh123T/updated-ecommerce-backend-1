const express = require("express");
const { newOrder, getSingleOrder, myOrder, getAllOrders, updateOrder, deleteOrder, createOrderReviews, deleteOrderBeforePayment, getOrdersHistory, myActiveOrders } = require("../controllers/orderControllers/orderController");
const router=express.Router();
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");

// router.route("/:shopId/order/new").post(isAuthenticatedUser,newOrder);

router.route("/:shopId/order/:id").get(isAuthenticatedUser,getSingleOrder);


router.route("/:shopId/order/:id").put(isAuthenticatedUser,authorizedRoles("admin"),updateOrder).delete(isAuthenticatedUser,authorizedRoles("admin"),deleteOrder);

// check this error when keeping isauthorised
router.route("/:shopId/order/:orderId/beforePayment").delete(isAuthenticatedUser,deleteOrderBeforePayment);


router.route("/:shopId/orders").get(isAuthenticatedUser,authorizedRoles("admin"),getAllOrders);

router.route("/:shopId/ordersHistory").get(isAuthenticatedUser,authorizedRoles("admin"),getOrdersHistory);

router.route("/orders/me").get(isAuthenticatedUser,myOrder);
router.route("/activeOrders/me").get(isAuthenticatedUser,myActiveOrders);
router.route("/order/:orderId/review").put(isAuthenticatedUser,createOrderReviews)

module.exports=router