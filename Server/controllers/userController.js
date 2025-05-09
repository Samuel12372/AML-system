
const UserModel = require('../models/userModel');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const MAX_FAILED_ATTEMPTS = 5;  // Maximum allowed failed login attempts
const LOCK_TIME = 15 * 60 * 1000;  


module.exports = {

    getAllUsers: async (req, res) => {
        await UserModel.find()
        .then(users => res.json(users))
        .catch(err => console.log(err));
    },

    getUser: async (req, res) => {
        await UserModel.findById(req.params.id)
        .then(user => res.json(user))
        .catch(err => console.log(err));
    },

    getUserBookBorrowed: async (req, res) => {
        await UserModel.findById(req.params.id)
        .then(user => res.json(user.books_borrowed))
        .catch(err => console.log(err));
    },

    getUserBookReserved: async (req, res) => {
        await UserModel.findById(req.params.id)
        .then(user => res.json(user.books_reserved))
        .catch(err => console.log(err));
    },

    deleteUserBookBorrowed: async (req, res) => {
        try {
            const user = await UserModel.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            const bookId = req.params.books_borrowed;
    
            // Find the index of the book to remove
            const bookIndex = user.books_borrowed.findIndex(
                (book) => book.book_id === bookId
            );
    
            if (bookIndex === -1) {
                return res.status(404).json({ message: 'Book not found in borrowed books' });
            }
    
            // Remove the book from the array
            user.books_borrowed.splice(bookIndex, 1);
    
            // Save the updated user
            await user.save();
    
            res.json(user.books_borrowed); // Return updated borrowed books
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error removing borrowed book', error: err });
        }
    },

    addBorrowedBook: async (req, res) => {
        console.log("Request Body:", req.body);
        try {
            const user = await UserModel.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
    
            const { book_id, due_date } = req.body;
    
            if (!book_id || !due_date) {
                return res.status(400).json({ message: "book_id and due_date are required" });
            }
    
            // Add the new book to the books_borrowed array
            user.books_borrowed.push({ book_id, due_date });
    
            const updatedUser = await user.save();
            res.json(updatedUser.books_borrowed);
        } catch (err) {
            console.error("Error adding borrowed book:", err);
            res.status(500).json({ message: "Error adding borrowed book", error: err });
        }
    },

    addReservedBook: async (req, res) => {
        await UserModel.findById(req.params.id)
        .then(user => {
            user.books_reserved.push(req.body.book);
            user.save()
            .then(updatedUser => res.json(updatedUser.books_reserved))
            .catch(err => res.status(500).json({ message: 'Error saving user', error: err }));
        })
        .catch(err => res.status(500).json({ message: 'Error finding user', error: err }));
    },

    deleteUserReservedBook: async (req, res) => {
        await UserModel.findById(req.params.id)
        .then(user => {
            const bookReserved = req.params.books_reserved
            const bookIndex = user.books_reserved.indexOf(bookReserved);
            if(bookIndex === -1){
                return res.status(404).json({ message: 'Book not found in reserved books' });
            }
            user.books_reserved.splice(bookIndex, 1);   
            user.save()
            res.json(user.books_reserved);
        })
        .catch(err => console.log(err));
    },

    updateDueDate: async (req, res) => {
        try {
            const { id, book_id } = req.params; // Extract user ID and book ID from params
            const { due_date } = req.body; // Extract new due date from request body
    
            // Validate the input
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid user ID" });
            }
            if (!due_date) {
                return res.status(400).json({ message: "New due date is required" });
            }
    
            // Find the user and update the specific book's due date
            const user = await UserModel.findOneAndUpdate(
                { _id: id, "books_borrowed.book_id": book_id }, // Match user and specific book
                { $set: { "books_borrowed.$.due_date": due_date } }, // Update due_date in the matched book
                { new: true } // Return the updated user document
            );
    
            // If user or book not found, return an error
            if (!user) {
                return res.status(404).json({ message: "User or book not found" });
            }
    
            res.json(user.books_borrowed); // Return the updated books_borrowed array
        } catch (err) {
            console.error("Error updating due date:", err);
            res.status(500).json({ message: "Internal server error", error: err });
        }

    },
    loginUser: async (req, res) => {
        try {
            const { username, password } = req.body;
            console.log("📥 Received Login Data:", req.body);
    
            const user = await UserModel.findOne({ username });
    
            if (!user) {
                return res.status(400).json({ message: "❌ User not found!" });
            }
    
            // Check if account is locked
            if (user.lockedUntil && user.lockedUntil > Date.now()) {
                return res.status(403).json({
                    message: `❌ Account locked. Try again after ${new Date(user.lockedUntil).toLocaleString()}.`
                });
            }
    
            // Check password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                user.failedLoginAttempts += 1;
    
                if (user.failedLoginAttempts >= 5) {
                    user.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes lock
                    await user.save();
                    return res.status(403).json({ message: "❌ Too many failed attempts. Account locked for 15 minutes." });
                }
    
                await user.save();
                return res.status(400).json({ message: "❌ Invalid credentials!" });
            }
    
            // Reset login attempts and lock
            user.failedLoginAttempts = 0;
            user.lockedUntil = null;
            user.lastActivity = Date.now();
            await user.save();

            if (user.mfaSecret) {
                // Require MFA verification before full login
                return res.status(200).json({
                    mfaRequired: true,
                    userId: user._id,
                    tempToken: 'abc123', // optional, e.g. short-lived session token
                    message: 'MFA required',
                });
            }
    
            // Create JWT with 1 hour expiry
            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' },
            );
    
            return res.status(200).json({
                message: "✅ Login successful!",
                token,
                userId: user._id,
                role: user.role
            });
    
        } catch (error) {
            console.error("❌ Server Error in loginUser:", error);
            return res.status(500).json({ message: "❌ Server error", error });
        }
    },
    registerUser: async (req, res) => {
        try {
            console.log("📥 Received Registration Data:", req.body);
    
            const { username, email, password } = req.body;
    
            if (!username || !email || !password) {
                return res.status(400).json({ message: "❌ All fields are required!" });
            }
    
            let userExists = await UserModel.findOne({ email });
            if (userExists) {
                console.log("⚠️ User already exists:", email);
                return res.status(400).json({ message: "❌ Email already in use!" });
            }
    
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new UserModel({ username, email, password: hashedPassword, branch: "BranchSheffield", role: "user" });
    
            await newUser.save();
            console.log("✅ User saved successfully:", newUser);
    
            res.status(201).json({ message: "✅ Registration successful!", user: newUser });
        } catch (error) {
            console.error("❌ Registration error:", error);
            res.status(500).json({ message: "❌ Server error", error });
        }
    },
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;  // Get the userId from URL parameter
            console.log("📥 Deleting User with ID:", id);
    
            const deletedUser = await UserModel.findByIdAndDelete(id);
            if (!deletedUser) {
                return res.status(404).json({ message: "❌ User not found!" });
            }
    
            console.log("✅ User deleted successfully:", deletedUser);
            res.status(200).json({ message: "✅ User deleted successfully!", user: deletedUser });
        } catch (error) {
            console.error("❌ Error deleting user:", error);
            res.status(500).json({ message: "❌ Server error", error });
        }
    },
    generateMfaSecret: async (req, res) => {
        try {
            const userId = req.params.id;
            const user = await UserModel.findById(userId);
        
            if (!user) {
              return res.status(404).json({ message: 'User not found' });
            }
        
            // Generate MFA secret
            const secret = speakeasy.generateSecret({
              name: `AML-System (${user.email})`,
            });
        
            // Save the secret to the user's record
            user.mfaSecret = secret.base32;
            await user.save();
        
            // Generate QR code for the secret
            const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
        
            res.json({ qrCodeUrl, secret: secret.base32 });
          } catch (error) {
            console.error('Error generating MFA secret:', error);
            res.status(500).json({ message: 'Error generating MFA secret' });
        } 
    },
    verifyMfaCode: async (req, res) => {
        try {
            const { id, token } = req.body;
            const user = await UserModel.findById(id);
        
            if (!user || !user.mfaSecret) {
              return res.status(404).json({ message: 'User not found or MFA not set up' });
            }
        
            // Verify the TOTP token
            const isVerified = speakeasy.totp.verify({
              secret: user.mfaSecret,
              encoding: 'base32',
              token,
            });
        
            if (isVerified) {
              res.json({ message: 'MFA verified successfully' });
            } else {
              res.status(400).json({ message: 'Invalid MFA token' });
            }
        } catch (error) {
            console.error('Error verifying MFA code:', error);
            res.status(500).json({ message: 'Error verifying MFA code' });
        }
    },
    
};

