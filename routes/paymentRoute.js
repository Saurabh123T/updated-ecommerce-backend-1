const express = require("express");
const { posttransaction } = require("../controllers/paymentControllers/posttransaction.js");
const {  pretransaction } = require("../controllers/paymentControllers/pretransaction.js");

const router=express.Router();
const { isAuthenticatedUser} = require("../middleware/auth");

router.route("/payment/pretransaction/").post(isAuthenticatedUser,pretransaction);
// router.route("/payment/pretransaction/").post(isAuthenticatedUser,pretransaction);
router.route("/payment/posttransaction/").post(isAuthenticatedUser,posttransaction); 
module.exports=router 