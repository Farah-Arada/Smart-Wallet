const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config()
const db = require("./models/db");
app.use(express.json());
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://smart-wallet-lime.vercel.app' 
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));


const userRouter = require("./routes/user");
app.use("/api/user", userRouter);

const transactionRouter = require("./routes/Transaction");
app.use("/api/transactions", transactionRouter);




const PORT =  process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Example application listening at http://localhost:${PORT}`);
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});