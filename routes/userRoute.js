const express= require("express");
const {registerUser, googleSignin, logout, updateProfile, deleteUser, getMyProfile, getBeamsToken, updateFavourites, getMyFavourites}=require("../controllers/userControllers/userController");
const router=express.Router();
const {isAuthenticatedUser}=require("../middleware/auth")

router.route("/googleSignIn").post(googleSignin);
router.route("/logout").get(isAuthenticatedUser,logout);
router.route("/me/update").put(isAuthenticatedUser,updateProfile);
router.route("/me/favourites/update").put(isAuthenticatedUser,updateFavourites);
router.route("/me").get(isAuthenticatedUser,getMyProfile);
router.route("/me/favourites").get(isAuthenticatedUser,getMyFavourites);
router.route("/user/:userId").delete(isAuthenticatedUser,deleteUser);


router.route("/pusher/beams-auth").get(getBeamsToken);
module.exports=router;