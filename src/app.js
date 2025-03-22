document.addEventListener('DOMContentLoaded', async () => {
    const table = document.getElementById('data-table');
    const tableHead = table.querySelector('thead tr');
    const tableBody = table.querySelector('tbody');
    const rowCountElement = document.getElementById('row-count'); // Select the row count element

    // Map database column names to custom display names
    const columnMapping = {
        _Area: 'Area',
        _Question: 'Question',
        _Answer: 'Answer'
    };

    let allData = []; // Store all data for filtering

    try { const response = await fetch('https://ptwranswersrv.azurewebsites.net/api/data');
       
        if (!response.ok) {
            console.log(response.body);
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        allData = data; // Save the data for filtering

        // Populate table headers with custom display names and filter inputs
        Object.values(columnMapping).forEach((displayName, index) => {
            const th = document.createElement('th');
            th.textContent = displayName;

            // Add a filter input below the header text
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Filter ${displayName}`;
            input.dataset.columnIndex = index; // Store the column index for filtering
            input.addEventListener('input', filterRows); // Attach event listener for filtering
            th.appendChild(document.createElement('br')); // Line break between header and input
            th.appendChild(input);

            tableHead.appendChild(th);
        });

        // Populate table rows dynamically using the column mapping
        populateRows(allData, columnMapping, tableBody);
    } catch (error) {
        console.error('Error fetching data:', error);
        const errorRow = document.createElement('tr');
        const errorCell = document.createElement('td');
        errorCell.colSpan = Object.keys(columnMapping).length || 1;
        errorCell.textContent = 'Failed to load data.';
        errorRow.appendChild(errorCell);
        tableBody.appendChild(errorRow);
        updateRowCount(0); // Set row count to 0 on error
    }

    // Function to populate rows
    function populateRows(data, columnMapping, tableBody) {
        tableBody.innerHTML = ''; // Clear existing rows
        data.forEach(item => {
            const row = document.createElement('tr');
            Object.keys(columnMapping).forEach(dbColumn => {
                const td = document.createElement('td');
                td.textContent = item[dbColumn] || ''; // Use empty string if field is missing
                row.appendChild(td);
            });
            tableBody.appendChild(row);
        });
        updateRowCount(data.length); // Update row count
    }

    // Function to filter rows
    function filterRows(event) {
        const input = event.target;
        const columnIndex = input.dataset.columnIndex;
        const filterValue = input.value.toLowerCase();

        const filteredData = allData.filter(item => {
            const dbColumn = Object.keys(columnMapping)[columnIndex];
            const cellValue = item[dbColumn]?.toString().toLowerCase() || '';
            return cellValue.includes(filterValue);
        });

        populateRows(filteredData, columnMapping, tableBody);
    }

    // Function to update the row count
    function updateRowCount(count) {
        rowCountElement.textContent = `Total Rows: ${count}`;
    }
});
