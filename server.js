require('dotenv').config(); // Load environment variables from a .env file
const express = require('express'); // Import Express framework
const sql = require('mssql'); // Import mssql package for SQL Server interaction
const cors = require('cors'); // Import the cors package for handling cross-origin requests

const app = express(); // Create an Express application
const port = process.env.PORT || 3000; // Use the PORT environment variable or default to 3000

app.use(express.json()); // Middleware to parse JSON request bodies

// List of allowed origins for CORS
const allowedOrigins = [
    'https://gentle-tree-03b4b7200.6.azurestaticapps.net',
    'purple-glacier-034869600.6.azurestaticapps.net',
    'https://partnerwinroom.net'
];

// Configure CORS middleware
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error('Not allowed by CORS')); // Reject the request
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));

// Middleware to set CORS headers for all responses
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin); // Set allowed origin
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allowed HTTP methods
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allowed headers
    res.header('Access-Control-Allow-Credentials', 'true'); // Allow credentials
    next(); // Proceed to the next middleware or route handler
});

// Database configuration
const config = {
    user: process.env.DB_USER, // Database username from environment variables
    password: process.env.DB_PASSWORD, // Database password from environment variables
    server: process.env.DB_SERVER, // Database server address from environment variables
    database: process.env.DB_NAME, // Database name from environment variables
    options: {
        encrypt: true, // Use encryption for secure connections (required for Azure SQL)
        trustServerCertificate: true // Set to true for local development or self-signed certificates
    },
    pool: {
        max: 10, // Maximum number of connections in the pool
        min: 0, // Minimum number of connections in the pool
        idleTimeoutMillis: 30000 // Close idle connections after 30 seconds
    }
};

// Create a global connection pool
let poolPromise = sql.connect(config).then(pool => {
    console.log('Connected to Azure SQL Database'); // Log successful connection
    return pool; // Return the connection pool
}).catch(err => {
    console.error('Database connection failed!', err); // Log connection error
    process.exit(1); // Exit the application if the connection fails
});

// API endpoint to fetch data from the database
app.get('/api/data', async (req, res) => {
    try {
        const pool = await poolPromise; // Use the global connection pool
        const result = await pool.request().query('SELECT * FROM PTWRFAQ'); // Execute SQL query to fetch data
        console.log(result.recordset); // Log the result to the console for debugging
        res.json(result.recordset); // Send the fetched data as a JSON response
    } catch (err) {
        console.error('SQL error', err); // Log SQL error
        res.status(500).json('Error fetching data from SQL'); // Send error response
    }
});

// API endpoint to update a record in the database
app.post('/api/update', async (req, res) => {
    const updatedRecord = req.body; // Get the updated record from the request body
    try {
        const pool = await poolPromise; // Use the global connection pool
        const query = `
            UPDATE PTWRFAQ
            SET _Answer = @Answer
            WHERE _Area = @Area AND _Question = @Question
        `; // SQL query to update the record
        const request = pool.request(); // Create a new SQL request
        request.input('Answer', sql.NVarChar, updatedRecord._Answer); // Bind the _Answer parameter
        request.input('Area', sql.NVarChar, updatedRecord._Area); // Bind the _Area parameter
        request.input('Question', sql.NVarChar, updatedRecord._Question); // Bind the _Question parameter
        await request.query(query); // Execute the SQL query
        res.status(200).send('Record updated successfully'); // Send success response
    } catch (err) {
        console.error('SQL error', err); // Log SQL error
        res.status(500).send('Error updating record'); // Send error response
    }
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/api/data`); // Log the server URL
});
