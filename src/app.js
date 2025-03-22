// Wait for the DOM to fully load before executing the script
document.addEventListener('DOMContentLoaded', async () => {
    // Get references to the table and its components
    const table = document.getElementById('data-table'); // Main table element
    const tableHead = table.querySelector('thead tr'); // Table header row
    const tableBody = table.querySelector('tbody'); // Table body
    const rowCountElement = document.getElementById('row-count'); // Element to display the total row count

    // Define the mapping between database columns and display names
    const columnMapping = {
        _Area: 'Area',
        _Question: 'Question',
        _Answer: 'Answer'
    };

    let allData = []; // Array to store all data fetched from the server

    try {
        // Fetch data from the server
        const response = await fetch('https://ptwranswersrv.azurewebsites.net/api/data');
        if (!response.ok) throw new Error('Network response was not ok'); // Handle network errors
        const data = await response.json(); // Parse the JSON response
        allData = data; // Store the fetched data

        // Dynamically create table headers based on column mapping
        Object.values(columnMapping).forEach(displayName => {
            const th = document.createElement('th'); // Create a new table header cell
            th.textContent = displayName; // Set the header text
            tableHead.appendChild(th); // Append the header cell to the table header row
        });

        // Add an additional header for the action column
        const actionTh = document.createElement('th');
        actionTh.textContent = 'Answer by editing the row'; // Header text for the action column
        actionTh.style.width = '200px'; // Set column width
        actionTh.style.textAlign = 'center'; // Center-align the text
        actionTh.style.fontWeight = 'bold'; // Make the text bold
        actionTh.style.fontSize = '16px'; // Set font size
        actionTh.style.color = 'blue'; // Set text color
        actionTh.style.backgroundColor = '#f0f0f0'; // Set background color
        actionTh.style.border = '1px solid #ccc'; // Add a border
        actionTh.style.padding = '10px'; // Add padding
        actionTh.style.borderRadius = '5px'; // Add rounded corners
        actionTh.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)'; // Add a shadow effect
        actionTh.style.cursor = 'pointer'; // Change cursor to pointer on hover
        actionTh.style.transition = 'background-color 0.3s'; // Add a smooth transition effect

        // Add hover effects for the action column header
        actionTh.addEventListener('mouseover', () => {
            actionTh.style.backgroundColor = '#e0e0e0'; // Change background color on hover
        });
        actionTh.addEventListener('mouseout', () => {
            actionTh.style.backgroundColor = '#f0f0f0'; // Revert background color when not hovering
        });

        // Add a click event to create a new editable row
        actionTh.addEventListener('click', () => {
            const newRow = document.createElement('tr'); // Create a new table row
            Object.keys(columnMapping).forEach(dbColumn => {
                const td = document.createElement('td'); // Create a new table cell
                if (dbColumn === '_Answer') {
                    // If the column is '_Answer', create an input field
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.placeholder = 'Enter answer'; // Placeholder text for the input
                    input.dataset.dbColumn = dbColumn; // Store the column name in a data attribute
                    td.appendChild(input); // Append the input to the cell
                } else {
                    td.textContent = ''; // Leave other columns empty
                }
                newRow.appendChild(td); // Append the cell to the row
            });

            // Add a "Save" button to the new row
            const actionTd = document.createElement('td');
            const saveButton = document.createElement('button');
            saveButton.textContent = 'Save'; // Button text
            saveButton.addEventListener('click', () => saveNewRow(newRow)); // Attach click event to save the new row
            actionTd.appendChild(saveButton);
            newRow.appendChild(actionTd);

            tableBody.appendChild(newRow); // Append the new row to the table body
        });

        tableHead.appendChild(actionTh); // Append the action column header to the table header row

        // Populate the table with the fetched data
        populateRows(allData, columnMapping, tableBody);

        // Add filter inputs for each column
        addFilterInputs(columnMapping, tableHead, tableBody, allData);
    } catch (error) {
        console.error('Error fetching data:', error); // Log any errors that occur during data fetching
    }

    // Function to populate rows in the table
    function populateRows(data, columnMapping, tableBody) {
        tableBody.innerHTML = ''; // Clear existing rows
        data.forEach((item, rowIndex) => {
            const row = document.createElement('tr'); // Create a new table row
            Object.keys(columnMapping).forEach(dbColumn => {
                const td = document.createElement('td'); // Create a new table cell
                td.textContent = item[dbColumn] || ''; // Set the cell content to the corresponding data
                row.appendChild(td); // Append the cell to the row
            });

            // Add an action column with an "Edit" button
            const actionTd = document.createElement('td');
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit'; // Button text
            editButton.addEventListener('click', () => openEditRow(item, rowIndex)); // Attach click event to open edit row
            actionTd.appendChild(editButton);
            row.appendChild(actionTd);

            tableBody.appendChild(row); // Append the row to the table body
        });
        updateRowCount(data.length); // Update the row count display
    }

    // Function to open an editable row for updating data
    function openEditRow(item, rowIndex) {
        const editRow = document.createElement('tr'); // Create a new row for editing
        Object.keys(columnMapping).forEach(dbColumn => {
            const td = document.createElement('td'); // Create a new table cell
            if (dbColumn === '_Answer') {
                // If the column is '_Answer', create an input field
                const input = document.createElement('input');
                input.type = 'text';
                input.value = item[dbColumn] || ''; // Set the input value to the current data
                input.dataset.dbColumn = dbColumn; // Store the column name in a data attribute
                td.appendChild(input); // Append the input to the cell
            } else {
                td.textContent = item[dbColumn] || ''; // For other columns, display the data as text
            }
            editRow.appendChild(td); // Append the cell to the row
        });

        // Add an action column with an "Update" button
        const actionTd = document.createElement('td');
        const updateButton = document.createElement('button');
        updateButton.textContent = 'Update';
        updateButton.addEventListener('click', () => updateRecord(item, rowIndex, editRow)); // Attach click event to update the record
        actionTd.appendChild(updateButton);
        editRow.appendChild(actionTd);

        // Insert the editable row below the current row
        tableBody.insertBefore(editRow, tableBody.children[rowIndex + 1]);
    }

    // Function to update a record in the database
    async function updateRecord(item, rowIndex, editRow) {
        // Collect updated values from the input fields
        const inputs = editRow.querySelectorAll('input');
        inputs.forEach(input => {
            const dbColumn = input.dataset.dbColumn; // Get the column name from the data attribute
            item[dbColumn] = input.value; // Update the item with the new value
        });

        try {
            // Send the updated record to the server
            const response = await fetch('https://ptwranswersrv.azurewebsites.net/api/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item) // Convert the item to JSON format
            });
            if (!response.ok) throw new Error('Failed to update record'); // Handle server errors

            // Update the local data and refresh the table
            allData[rowIndex] = item; // Update the local data array
            populateRows(allData, columnMapping, tableBody); // Refresh the table with updated data

            // Show a success notification
            showPopup('Record has been successfully updated!');
        } catch (error) {
            console.error('Error updating record:', error); // Log the error to the console
            showPopup('Failed to update the record. Please try again.', true); // Show an error notification
        }
    }

    // Function to show a popup notification
    function showPopup(message, isError = false) {
        const popup = document.createElement('div'); // Create a new div for the popup
        popup.textContent = message; // Set the popup message
        popup.style.position = 'fixed';
        popup.style.bottom = '20px';
        popup.style.right = '20px';
        popup.style.padding = '10px 20px';
        popup.style.backgroundColor = isError ? '#ff4d4d' : '#4caf50'; // Red for error, green for success
        popup.style.color = 'white';
        popup.style.borderRadius = '5px';
        popup.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        popup.style.zIndex = '1000';
        popup.style.fontSize = '14px';
        popup.style.fontWeight = 'bold';
        popup.style.transition = 'opacity 0.5s ease';

        document.body.appendChild(popup); // Add the popup to the document

        // Automatically remove the popup after 3 seconds
        setTimeout(() => {
            popup.style.opacity = '0'; // Fade out the popup
            setTimeout(() => popup.remove(), 500); // Remove the popup after the fade-out transition
        }, 3000);
    }

    // Function to update the row count display
    function updateRowCount(count) {
        rowCountElement.textContent = `Total Rows: ${count}`; // Update the row count element
    }

    // Function to add filter inputs for each column
    function addFilterInputs(columnMapping, tableHead, tableBody, allData) {
        const filterRow = document.createElement('tr'); // Create a new row for filter inputs
        Object.keys(columnMapping).forEach(dbColumn => {
            const filterTd = document.createElement('td'); // Create a new table cell
            const filterInput = document.createElement('input'); // Create an input field for filtering
            filterInput.type = 'text';
            filterInput.placeholder = `Filter by ${columnMapping[dbColumn]}`; // Set the placeholder text
            filterInput.addEventListener('input', () => filterTable(allData, columnMapping, tableBody)); // Attach input event to filter the table
            filterTd.appendChild(filterInput); // Append the input to the cell
            filterRow.appendChild(filterTd); // Append the cell to the row
        });

        // Add an empty cell for the action column
        const actionTd = document.createElement('td');
        filterRow.appendChild(actionTd);

        tableHead.appendChild(filterRow); // Append the filter row to the table head
    }

    // Function to filter the table based on input values
    function filterTable(data, columnMapping, tableBody) {
        const filterInputs = document.querySelectorAll('thead tr:nth-child(2) input'); // Get all filter inputs
        const filteredData = data.filter(item => {
            // Check if the item matches all filter criteria
            return Array.from(filterInputs).every((input, index) => {
                const dbColumn = Object.keys(columnMapping)[index]; // Get the corresponding column name
                const filterValue = input.value.toLowerCase(); // Get the filter value in lowercase
                return item[dbColumn]?.toLowerCase().includes(filterValue); // Check if the item's value includes the filter value
            });
        });

        populateRows(filteredData, columnMapping, tableBody); // Refresh the table with filtered data
    }
});
