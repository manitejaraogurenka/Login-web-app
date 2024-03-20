import { Router } from "express";

const router = Router();

/*impost all controllers*/
import * as controller from "../controllers/appController.js";
import Auth, { localVariable } from "../middleware/auth.js";
import { registerMail } from "../controllers/mailer.js";

/*POST methods*/
router.route("/register").post(controller.register);
router.route("/registerMail").post(registerMail); // send the mail
router
  .route("/authenticate")
  .post(controller.verifyUser, (req, res) => res.end()); // authenticate user
router.route("/login").post(controller.verifyUser, controller.login); // login in app

/*GET methods*/
router.route("/user/:username").get(controller.getUser); //user with username
router
  .route("/generateOTP")
  .get(controller.verifyUser, localVariable, controller.generateOTP); // generate random OTP

router.route("/verifyOTP").get(controller.verifyUser, controller.verifyOTP); // verify generated OTP
router.route("/createResetSession").get(controller.createResetSession); // reset all the variables

/*PUT methods*/
router.route("/updateuser").put(Auth, controller.updateUser); // Used to update the user profile
router
  .route("/resetPassword")
  .put(controller.verifyUser, controller.resetpassword); // Used to reset the pasword

export default router;
