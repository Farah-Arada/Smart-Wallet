# Smart Wallet
 **About**
 Smart Wallet is a comprehensive Personal Expense Management System designed to help users track their income, expenses, and debts efficiently. Built with a modern tech stack, it features a secure authentication system with OTP verification, a fully responsive dashboard, bilingual support (English & Arabic), and seamless light/dark mode integration.

--------------------------------------------------

## key features
* **Secure Authentication:** User registration and login with email OTP (One-Time Password) verification using Nodemailer.
* **Password Management:** Secure password hashing (Bcrypt), strength validation, and forgot/reset password flows.
* **Financial Dashboard:** Real-time calculation of Current Balance, Total Income, Total Expenses, and Outstanding Debt.
* **Transaction Management:** Full CRUD (Create, Read, Update, Delete) operations for financial records (Income, Expense, Debt).
* **Smart Analytics:** Visual "Consumption Rate" progress bar alerting users when expenses exceed 85% of their income.
* **Bilingual & Adaptive UI:** Built-in localization for English and Arabic (RTL support), alongside Dark/Light theme toggles.

--------------------------------------------------

## Tech Stack

### Frontend
* **React.js** (Vite)
* **Tailwind CSS** (for rapid, responsive styling and Dark Mode)
* **Lucide React** (for modern SVG iconography)

### Backend
* **Node.js & Express.js** (RESTful API architecture)
* **MongoDB & Mongoose** (Database modeling)
* **JSON Web Tokens (JWT)** (Stateless user authentication)
* **Nodemailer** (Email service for OTP delivery)
* **Bcrypt** (Password encryption)

--------------------------------------------------

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
* [Node.js](https://nodejs.org/) installed (v16+ recommended)
* [MongoDB](https://www.mongodb.com/) installed and running locally, or a MongoDB Atlas cluster.

--------------------------------------------

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory.

2. Install dependencies:
     ```bash
    npm install
   
3. Create a .env file in the root of your backend directory and add the following variables

4. Start the backend server
  ```bash
   npm run dev
// The server will run on http://localhost:5000

--------------------------------------------

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory.

2. Install dependencies:
    ```bash
    npm install

3. Start the Vite development server:
    ```bash
   npm run dev

// click to the server link to open the frontend in your browser

--------------------------------------------

## API Reference1
1. User Routes (/api/user)
*  POST /register - Register a new user.
*  POST /login - Authenticate user and send OTP to email.
*  POST /verify-otp - Verify OTP and return JWT token.
*  POST /forgot-password - Initiate password reset process.
*  POST /reset-password - Complete password reset using OTP.
*  GET /me - Get current authenticated user details.

2. Transaction Routes (/api/transactions)
* POST /add - Add a new transaction (Requires Token).
* GET /all - Get all user transactions (Requires Token).
* PUT /update/:id - Update a specific transaction (Requires Token).
* DELETE /delete/:id - Delete a specific transaction (Requires Token).
* DELETE /clear - Delete all transactions for the current user (Requires Token).

--------------------------------------------

Author
Farah Arada
