import express from "express";
import authUser from "../middlewares/userAuth.js";
import { addItem, allSubCategories, deleteTransaction, filter, getAllItems, getBySubCategory, reportPdf, summary } from "../controllers/generalController.js";

const generalRouter=express.Router();

generalRouter.post('/',authUser,addItem)
generalRouter.get('/all',authUser,getAllItems);
generalRouter.get('/subcategory',authUser,allSubCategories);
generalRouter.get('/subcategory/:subCategory',authUser,getBySubCategory);
generalRouter.delete('/delete/:id',authUser,deleteTransaction);
generalRouter.get('/filter',authUser,filter)
generalRouter.get('/reportPdf',authUser,reportPdf)
generalRouter.get('/summary',authUser,summary)

export default generalRouter;