const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const secretKey = 'your_secret_key';

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*",function auth(req, res, next) {
    // Get the token from the request headers, query parameters, or body
    const token = req.headers['authorization'];

    // Check if token exists
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Verify the token
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        // If token is valid, set the decoded data on the request object for future use
        req.user = decoded;
        next();
    });
}
);
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
