// Import the mssql package (commented out for now, ensure it's uncommented if needed)
// const sql = require('mssql');

// Configuration object for connecting to the Azure SQL database
const config = {
    user: process.env.DB_USER, // Database username from environment variables
    password: process.env.DB_PASSWORD, // Database password from environment variables
    server: process.env.DB_SERVER, // Database server address from environment variables
    database: process.env.DB_NAME, // Database name from environment variables
    options: {
        encrypt: true, // Use encryption for secure connections (required for Azure SQL)
        trustServerCertificate: true, // Set to true for local development or self-signed certificates
    },
};

// Function to fetch data from the Azure SQL database
async function fetchData() {
    try {
        // Close any existing connection pool to avoid conflicts
        if (sql.pool) {
            await sql.close();
        }

        // Create a new connection pool using the configuration
        let pool = await sql.connect(config);

        // Execute a SQL query to fetch all rows from the PTWRFAQ table
        let result = await pool.request().query('SELECT * FROM PTWRFAQ'); 
        console.log(result.recordset); // Log the result to the console for debugging

        // Return the fetched data (recordset) to the caller
        return result.recordset;
    } catch (err) {
        // Log any SQL errors to the console
        console.error('SQL error', err);

        // Rethrow the error to be handled by the caller
        throw err;
    } finally {
        // Ensure the connection pool is closed (commented out for now)
        // Uncomment this if you want to close the pool after every query
        // await sql.close();
    }
}

// Export the fetchData function so it can be used in other parts of the application
module.exports = { fetchData };