document.addEventListener('DOMContentLoaded', async () => {
    const table = document.getElementById('data-table');
    const tableHead = table.querySelector('thead');
    const tableBody = table.querySelector('tbody');
    const rowCountElement = document.getElementById('row-count');

    const columnMapping = {
        _Area: 'Area',
        _Question: 'Question',
        _Answer: 'Answer'
    };

    let allData = [];

    try {
        const response = await fetch('https://ptwranswersrv.azurewebsites.net/api/data');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        allData = data;

        // Create a row for filter inputs
        const filterRow = document.createElement('tr');
        Object.keys(columnMapping).forEach(dbColumn => {
            const filterCell = document.createElement('th');
            if (dbColumn === '_Question') {
                const filterInput = document.createElement('input');
                filterInput.type = 'text';
                filterInput.placeholder = 'Filter by Question';
                filterInput.style.width = '100%'; // Ensure the input takes the full width of the cell
                filterInput.addEventListener('input', () => applyFilters());
                filterCell.appendChild(filterInput);
            }
            filterRow.appendChild(filterCell);
        });

        // Add an empty cell for the action column
        const emptyCell = document.createElement('th');
        filterRow.appendChild(emptyCell);
        tableHead.appendChild(filterRow);

        // Create a row for column headers
        const headerRow = document.createElement('tr');
        Object.values(columnMapping).forEach(displayName => {
            const th = document.createElement('th');
            th.textContent = displayName;
            headerRow.appendChild(th);
        });

        const actionTh = document.createElement('th');
        actionTh.textContent = 'Actions';
        headerRow.appendChild(actionTh);
        tableHead.appendChild(headerRow);

        populateRows(allData, columnMapping, tableBody);
    } catch (error) {
        console.error('Error fetching data:', error);
    }

    function populateRows(data, columnMapping, tableBody) {
        tableBody.innerHTML = '';
        data.forEach((item, rowIndex) => {
            const row = document.createElement('tr');
            Object.keys(columnMapping).forEach(dbColumn => {
                const td = document.createElement('td');
                td.textContent = item[dbColumn] || '';
                row.appendChild(td);
            });

            const actionTd = document.createElement('td');
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => openEditRow(item, rowIndex));
            actionTd.appendChild(editButton);
            row.appendChild(actionTd);

            tableBody.appendChild(row);
        });
        updateRowCount(data.length);
    }

    function applyFilters() {
        const filterInput = tableHead.querySelector('input');
        const filteredData = allData.filter(item => {
            const filterValue = filterInput.value.toLowerCase();
            return item['_Question']?.toLowerCase().includes(filterValue);
        });
        populateRows(filteredData, columnMapping, tableBody);
    }

    function updateRowCount(count) {
        rowCountElement.textContent = `Total Rows: ${count}`;
    }
});