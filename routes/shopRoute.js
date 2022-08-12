const express = require("express");

const { createShop, updateShop, deleteShop, getAllShops, getShopDetails, createShopReviews, getShopReviews, getAdvSearchResults, adminShopDetails, getSuperAdminShops, updateShopSuperAdmin } = require("../controllers/shopControllers/shopController");
const { isAuthenticatedUser,authorizedRoles } = require("../middleware/auth");


const router=express.Router();

router.route("/shop/new/").post(isAuthenticatedUser,createShop);

router.route("/shops").get(getAllShops);
router.route("/shops/advSearch").get(getAdvSearchResults);

router.route("/shop/:shopId").put(isAuthenticatedUser,authorizedRoles("admin"),updateShop).delete(isAuthenticatedUser,authorizedRoles("admin"),deleteShop).get(getShopDetails)


router.route("/shop/:shopId/admin").get(isAuthenticatedUser,authorizedRoles("admin"),adminShopDetails)


router.route("/shop/:shopId/review").put(isAuthenticatedUser,createShopReviews)
router.route("/:shopId/reviews").get(getShopReviews)


router.route("/shops/superAdmin").get(isAuthenticatedUser,authorizedRoles("superAdmin"),getSuperAdminShops);

router.route("/shop/:shopId/superAdmin").put(isAuthenticatedUser,authorizedRoles("superAdmin"),updateShopSuperAdmin)

module.exports=router