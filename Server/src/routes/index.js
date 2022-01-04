//import express and setup router
const express = require("express");
const { get, route } = require("../../../../WaysFood/Integrate Final/server/src/routes");
const router = express.Router();

//////////Get Controller & Middleware/////////
//Controller
const { addUsers, getUser, getProfile, checkUser, editUser } = require('../controllers/user');
const { addProduct, getProducts, getProduct } = require('../controllers/product');
const { addTransaction, getTransactions, editTransaction, 
          myTransaction, getTransaction, getTransactionsF } = require('../controllers/transaction');

//Middleware
const { auth } = require('../middlewares/auth');
const { uploadFile } = require('../middlewares/uploadFile');
const { updateFile } = require('../middlewares/updateFile');

/////////////////Routes/////////////////////
//route user
router.post("/register", addUsers);
router.post("/login", getUser);
router.get("/users/:id", getProfile);
router.get("/user", auth, checkUser);
router.patch("/user/:id", updateFile('photo'), editUser);
//route product
router.post("/product", auth, uploadFile('photo'), addProduct);
router.get("/products", getProducts);
router.get("/product/:id", getProduct);
//route transaction (and order)
router.post("/transaction", auth, uploadFile('attachment'), addTransaction);
router.get("/transactions", auth, getTransactions);
router.patch("/transaction/:id", auth, editTransaction);
router.get("/my-transactions", auth, myTransaction);
router.get("/transaction/:id", getTransaction);
router.get("/transactionf/:status", auth, getTransactionsF)

//export
module.exports = router;