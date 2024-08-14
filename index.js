const express = require('express');
const session = require('express-session');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON body data
app.use(express.json());

// Set up session management
app.use(session({
    genid: (req) => {
        return uuidv4(); // Use UUIDs for session IDs
    },
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 } // Sessions last for 1 minute for this example
}));

// Middleware to track and log user visit history
app.use((req, res, next) => {
    if (!req.session.history) {
        req.session.history = [];
    }

    const logEntry = {
        timestamp: new Date().toString(),
        method: req.method,
        url: req.url,
        query: req.query,
        body: req.body,
        ip: req.ip,
        userAgent: req.headers['user-agent']
    };

    req.session.history.push(logEntry);

    fs.appendFile('user-history.log', JSON.stringify({
        sessionId: req.sessionID,
        history: logEntry
    }, null, 2) + '\n', (err) => {
        if (err) {
            console.error('Failed to log visit:', err);
        }
    });

    next();
});

// Route to get user visit history
app.get('/history', (req, res) => {
    res.json(req.session.history);
});

// Define the '/' route
app.get('/', (req, res) => {
    res.send('Welcome to the home page!');
});

// Define the '/test' route
app.get('/test', (req, res) => {
    res.send('This is the test page!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
