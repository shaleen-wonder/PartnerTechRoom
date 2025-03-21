require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const cors = require('cors'); // Import the cors package

const app = express();
const port = process.env.PORT || 3000; // Use the PORT environment variable or default to 3000

app.use(express.json()); // Middleware to parse JSON request bodies

const allowedOrigins = [
    'https://gentle-tree-03b4b7200.6.azurestaticapps.net',
    'purple-glacier-034869600.6.azurestaticapps.net',
    'https://partnerwinroom.net'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error('Not allowed by CORS')); // Reject the request
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Ensure the Access-Control-Allow-Origin header is set for all responses
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// Database configuration
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // Use encryption for Azure SQL
        trustServerCertificate: true, // Change to true for local dev / self-signed certs
    },
    pool: {
        max: 10, // Maximum number of connections in the pool
        min: 0, // Minimum number of connections in the pool
        idleTimeoutMillis: 30000 // Close idle connections after 30 seconds
    }
};

// Create a global connection pool
let poolPromise = sql.connect(config).then(pool => {
    console.log('Connected to Azure SQL Database');
    return pool;
}).catch(err => {
    console.error('Database connection failed!', err);
    process.exit(1); // Exit the application if the connection fails
});

// API endpoint to fetch data
app.get('/api/data', async (req, res) => {
    try {
        const pool = await poolPromise; // Use the global connection pool
        const result = await pool.request().query('SELECT * FROM PTWRFAQ'); // Replace MyTable with your actual table name
        
        console.log(result.recordset); // Log the result to the console for debugging
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).json('Error fetching data from SQL');
    }
});

app.post('/api/update', async (req, res) => {
    const updatedRecord = req.body;
    try {
        const pool = await poolPromise;
        const query = `
            UPDATE MyTable
            SET _Answer = @Answer
            WHERE _Area = @Area AND _Question = @Question
        `;
        const request = pool.request();
        request.input('Answer', sql.NVarChar, updatedRecord._Answer);
        request.input('Area', sql.NVarChar, updatedRecord._Area);
        request.input('Question', sql.NVarChar, updatedRecord._Question);
        await request.query(query);
        res.status(200).send('Record updated successfully');
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Error updating record');
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/api/data`);
});