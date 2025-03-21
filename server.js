require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const cors = require('cors'); // Import the cors package

const app = express();
const port = 3000;

// Enable CORS for your frontend's domain
app.use(cors({
    origin: 'https://purple-glacier-034869600.6.azurestaticapps.net', // Allow this specific origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true // Allow cookies and credentials if needed
}));

// Ensure the Access-Control-Allow-Origin header is set for all responses
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://purple-glacier-034869600.6.azurestaticapps.net');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

app.get('/api/data', async (req, res) => {
    try {
        //let pool = await sql.connect(config);
        //let result = await pool.request().query('SELECT * FROM MyTable'); // Replace MyTable with your actual table name
        
        //console.log(result.recordset); // Log the result to the console for debugging
        
        //res.json(result.recordset);
        res.json("Came inside");
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).json('Error fetching data from SQL');
    } finally {
        res.status(500).json('Here I came');
        await sql.close();
    }
});

app.listen(port, () => {
    console.log(`Server running athttp://partnertechwinroom.azurewebsites.net/api/data`);
});