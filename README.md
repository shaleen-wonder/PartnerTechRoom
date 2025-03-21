# Static Web Application to Read Data from Azure SQL

This project is a static web application that connects to an Azure SQL database to fetch and display data on a webpage. Below are the details regarding the structure, setup, and usage of the application.

## Project Structure

```
static-web-app
├── src
│   ├── index.html       # Main HTML file for the application
│   ├── styles.css       # Styles for the application
│   ├── app.js           # Main JavaScript file for application logic
│   └── services
│       └── azure-sql.js # Service for interacting with Azure SQL
├── package.json         # NPM configuration file
├── README.md            # Project documentation
└── .env                 # Environment variables
```

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/microsoft/vscode-remote-try-dab.git
   cd static-web-app
   ```

2. **Install Dependencies**
   Ensure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your Azure SQL connection string and any other necessary environment variables:
   ```
   DATABASE_CONNECTION_STRING=your_connection_string_here
   ```

4. **Run the Application**
   You can use a local server to serve the static files. For example, you can use `http-server`:
   ```bash
   npx http-server ./src
   ```

5. **Access the Application**
   Open your web browser and navigate to `http://localhost:8080` (or the port specified by your server) to view the application.

## Usage

The application will automatically fetch data from the Azure SQL database when loaded. The data will be displayed on the webpage as defined in `index.html`. You can modify the styles in `styles.css` and the logic in `app.js` as needed.

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the project.

## License

This project is licensed under the MIT License. See the LICENSE file for details.