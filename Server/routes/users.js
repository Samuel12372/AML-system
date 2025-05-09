const express = require('express');
const router = express.Router();

const userControllers = require('../controllers/userController');
const isAuthenticated = require('../middleware/auth');  // Importing the authentication middleware

router.post('/user/login', userControllers.loginUser);
//register user
router.post('/user/register', userControllers.registerUser);
 
// Get all users
router.get('/users', userControllers.getAllUsers);
// Get a user
router.get('/user/:id', userControllers.getUser);
// Get user's books borrowed
router.get('/user-books-borrowed/:id', userControllers.getUserBookBorrowed);
// get user's books reserved
router.get('/user-books-reserved/:id', userControllers.getUserBookReserved);
// delete user book borrowed
router.delete('/user-books-borrowed/:id/:books_borrowed', userControllers.deleteUserBookBorrowed);
// add borrowed book
router.post('/add-borrowed-book/:id', userControllers.addBorrowedBook);
// add reserved book
router.post('/add-reserved-book/:id', userControllers.addReservedBook);
// delete user reserved book
router.delete('/user-books-reserved/:id/:books_reserved', userControllers.deleteUserReservedBook);
// update due date of borrowed book
router.patch('/update-due-date/:id/:book_id', userControllers.updateDueDate);
//login user
//delete user
router.delete('/user/delete/:id', userControllers.deleteUser);


router.post('/user/mfa/generate/:id', userControllers.generateMfaSecret);
router.post('/user/mfa/verify', userControllers.verifyMfaCode);

module.exports = router;