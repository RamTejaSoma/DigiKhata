import express from "express";
import authUser from "../middlewares/userAuth.js";
import { addItem, allSubCategories, analysis, deleteTransaction, filter, getAllItems, getBySubCategory, reportPdf, summary } from "../controllers/businessController.js";

const businessRouter =express.Router();

businessRouter.post('/',authUser,addItem);
businessRouter.get('/all',authUser,getAllItems);
businessRouter.get('/subcategory',authUser,allSubCategories);
businessRouter.get('/subcategory/:subCategory',authUser,getBySubCategory);
businessRouter.delete('/delete/:id',authUser,deleteTransaction);
businessRouter.get("/filter", authUser,filter);
businessRouter.get("/reportPdf", authUser,reportPdf);
businessRouter.get("/analysis/filter", authUser,analysis);
businessRouter.get("/summary", authUser,summary);

export default businessRouter;