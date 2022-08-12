const express = require("express");

const { getAllProducts,createProduct, updateProduct, deleteProduct, getProductDetails, getAdminShopProducts } = require("../controllers/productcontrollers/productController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");


const router=express.Router();

router.route("/:shopId/products").get(getAllProducts);


router.route("/:shopId/product/new").post(isAuthenticatedUser,authorizedRoles("admin"),createProduct);

router.route("/:shopId/product/:id").put(isAuthenticatedUser,authorizedRoles("admin"),updateProduct).delete(isAuthenticatedUser,authorizedRoles("admin"),deleteProduct).get(isAuthenticatedUser,getProductDetails)
// router.route("/:shopId/product/:id").put(isAuthenticatedUser,authorizedRoles("admin"),updateProduct).delete(isAuthenticatedUser,authorizedRoles("admin"),deleteProduct).get(isAuthenticatedUser,authorizedRoles("admin"),getProductDetails)




router.route("/:shopId/admin/products").get(isAuthenticatedUser,authorizedRoles("admin"),getAdminShopProducts);


module.exports=router