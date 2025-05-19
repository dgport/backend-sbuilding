import express from "express"
import { SignIn } from "../../controllers/auth/Signin"
import { SignUp } from "../../controllers/auth/Signup"
import { authenticateToken } from "../../middlewares/auth"
import { SignOut } from "../../controllers/auth/LogOut"
import { checkAuthStatus } from "../../controllers/auth/Status"
 

const router = express.Router()

// Public routes
router.post("/signin", SignIn)
router.post("/signup", SignUp)

// Protected routes
router.post("/signout", authenticateToken, SignOut)
router.get("/status", authenticateToken, checkAuthStatus) // Add this new route

export default router
