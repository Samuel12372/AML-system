const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    books_borrowed: [{
        book_id: { type: String, required: true },
        due_date: { type: String, required: true },
        
    }],
    books_reserved: {
        type: Array,
        required: true
    }, 
    branch: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: true,
        default: 'user'
    },
    failedLoginAttempts: { 
        type: Number, 
        default: 0 
    },
    lockedUntil: { 
        type: Date, 
        default: null 
    },
    lastActivity: { 
        type: Date, 
        default: Date.now 
    }, 
    mfaSecret: {
        type: String,
        default: null, // Store the user's MFA secret
    },
    mfaEnabled: {
        type: Boolean,
        default: false, // Indicates if MFA is enabled
    },

},{ versionKey: false });

const UserModel = mongoose.model('users', userSchema);
module.exports = UserModel;