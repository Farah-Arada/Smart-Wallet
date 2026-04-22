// routes/transaction.js
const express = require("express");
const { addTransaction, getTransactions,updateTransaction, deleteTransaction, deleteAllTransactions} = require("../controllers/Transaction");
const verifyToken = require("../middleware/auth"); 

const transactionRouter = express.Router();

transactionRouter.post("/add", verifyToken, addTransaction);
transactionRouter.get("/all", verifyToken, getTransactions);
transactionRouter.put("/update/:id", verifyToken, updateTransaction);
transactionRouter.delete("/delete/:id", verifyToken, deleteTransaction);
transactionRouter.delete("/clear", verifyToken, deleteAllTransactions);

module.exports = transactionRouter;