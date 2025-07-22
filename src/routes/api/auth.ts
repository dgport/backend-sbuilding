import express from 'express';
import { SignIn } from '../../controllers/auth/Signin';
import { authenticateToken } from '../../middlewares/auth';
import { SignOut } from '../../controllers/auth/LogOut';
import { checkAuthStatus } from '../../controllers/auth/Status';
import { SignUp } from '../../controllers/auth/Signup';

const router = express.Router();

router.post('/signin', SignIn);
router.post('/signup', SignUp);
router.post('/signout', authenticateToken, SignOut);
router.get('/status', authenticateToken, checkAuthStatus);

export default router;
