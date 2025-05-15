import { Router } from "express";
import { SignIn } from "../../controllers/auth/Signin";
import { SignUp } from "../../controllers/auth/Signup";
import { SignOut } from "../../controllers/auth/LogOut";
import { authenticateToken } from "../../middlewares/auth";
import { checkAuthStatus } from "../../controllers/auth/Status";


const authRouter = Router();

authRouter.post("/signin", SignIn);
authRouter.post("/signup", SignUp);
authRouter.post("/signout", authenticateToken, SignOut);
authRouter.post("/status", authenticateToken, checkAuthStatus);

 

export default authRouter;