//const sql = require('mssql');
//changes
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // Use this if you're on Windows Azure
        trustServerCertificate: true, // Change to true for local dev / self-signed certs
    },
};

async function fetchData() {
    try {
        // Close any existing connection pool
        if (sql.pool) {
            await sql.close();
        }

        // Create a new connection pool
        let pool = await sql.connect(config);

        // Update the query with the correct table name
        let result = await pool.request().query('SELECT * FROM PTWRFAQ'); 
        console.log(result.recordset); // Log the result to the console for debugging
        return result.recordset;
    } catch (err) {
        console.error('SQL error', err);
        throw err;
    } finally {
        // Ensure the connection pool is closed
       // await sql.close();
    }
}

module.exports = { fetchData };