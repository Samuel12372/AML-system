//run server - cd server - node index.js
//open browser - http://localhost:8080/
//ctrl + c to stop server


require("dotenv").config(); 
const express = require('express');
const connectDB = require("./db/connection");
const books = require("./routes/books");
const branch = require("./routes/branch");
const users = require("./routes/users");
const insertBooks = require("./routes/insertBooks");
const cors = require('cors');
require('dotenv').config();
const rateLimit = require('express-rate-limit');

// Limit to 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,   // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,    // Disable `X-RateLimit-*` headers
});


const app = express();
app.use(apiLimiter);

const PORT = process.env.PORT;  

connectDB();

app.use(cors());
app.use(express.json());
app.use('/api', books, branch, users, insertBooks); //localhost:8080/api/...

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

