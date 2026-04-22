import express from 'express'
import { getuser, loginUser, updatePassword, updateUser, userRegister } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';


const userRouter = express.Router();
userRouter.post("/register",userRegister);
userRouter.post("/login",loginUser);

// protected routes
 
userRouter.get("/me",authMiddleware,getuser);
userRouter.put("/profile",authMiddleware,updateUser);
userRouter.put("/password",authMiddleware,updatePassword)

export default userRouter;