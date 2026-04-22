
const Transaction = require("../models/TransactionSchema");


const addTransaction = async (req, res) => {
  try {
    const { amount, type, description, location, date } = req.body;

    const newTransaction = new Transaction({
      userId: req.userId, 
      amount,
      type,
      description,
      location,
      date: date || Date.now()
    });

    await newTransaction.save();

    res.status(201).json({
      success: true,
      message: "تمت إضافة الحركة بنجاح",
      transaction: newTransaction
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "server error", error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
   
    const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 });
    
    res.status(200).json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: "server error", error: error.message });
  }
};



const updateTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id; 
    const { amount, type, description, location, date } = req.body; 


    const updatedTx = await Transaction.findOneAndUpdate(
      { _id: transactionId, userId: req.userId }, 
      { amount, type, description, location, date }, 
      { new: true } 
    );

    if (!updatedTx) {
      return res.status(404).json({ success: false, message: "The movement is not available or you do not have the authority to modify it." });
    }

    res.status(200).json({
      success: true,
      message: "The movement was updated successfully",
      transaction: updatedTx
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};





const deleteTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;

    
    const deletedTx = await Transaction.findOneAndDelete({ _id: transactionId, userId: req.userId });

    if (!deletedTx) {
      return res.status(404).json({ success: false, message: "Transaction not found or you are not the owner" });
    }

    res.status(200).json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


const deleteAllTransactions = async (req, res) => {
  try {
  
    const result = await Transaction.deleteMany({ userId: req.userId });

    res.status(200).json({ 
      success: true, 
      message: "All transactions deleted successfully",
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};



module.exports = { addTransaction, getTransactions, updateTransaction, deleteTransaction,deleteAllTransactions };