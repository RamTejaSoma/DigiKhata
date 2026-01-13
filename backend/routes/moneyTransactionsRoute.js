import express from "express";
import authUser from "../middlewares/userAuth.js";
import { addItem, allSubCategories, deleteTransaction, filter, getAllItems, getBySubCategory, reportPdf, summary } from "../controllers/moneyTransactionController.js";

const moneyTrancationRouter =express.Router();

moneyTrancationRouter.post('/',authUser,addItem);
moneyTrancationRouter.get('/all',authUser,getAllItems);
moneyTrancationRouter.get('/subcategory',authUser,allSubCategories);
moneyTrancationRouter.get('/subcategory/:entityName',authUser,getBySubCategory);
moneyTrancationRouter.delete('/delete/:id',authUser,deleteTransaction);
moneyTrancationRouter.get('/filter',authUser,filter);
moneyTrancationRouter.get('/reportPdf',authUser,reportPdf);
moneyTrancationRouter.get('/summary',authUser,summary);


export default moneyTrancationRouter;