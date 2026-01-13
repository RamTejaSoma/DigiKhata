import express from "express";
import {register,login, summary, segmentSummary} from "../controllers/userController.js"
import authUser from "../middlewares/userAuth.js";

const userRouter= express.Router();

userRouter.post('/auth/register',register);
userRouter.post('/auth/login',login);
userRouter.get('/summary',authUser,summary);
userRouter.get('/segmentSummary/:type',authUser,segmentSummary);



export default userRouter;