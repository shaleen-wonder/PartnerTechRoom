document.addEventListener('DOMContentLoaded', async () => {
    const table = document.getElementById('data-table');
    const tableHead = table.querySelector('thead tr');
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

        // Add filter input for the Question column
        const filterRow = document.createElement('tr');
        Object.keys(columnMapping).forEach(dbColumn => {
            const filterCell = document.createElement('th');
            if (dbColumn === '_Question') {
                const filterInput = document.createElement('input');
                filterInput.type = 'text';
                filterInput.placeholder = 'Filter by Question';
                filterInput.addEventListener('input', () => applyFilters());
                filterCell.appendChild(filterInput);
            }
            filterRow.appendChild(filterCell);
        });

        // Add an empty cell for the action column
        const emptyCell = document.createElement('th');
        filterRow.appendChild(emptyCell);
        tableHead.appendChild(filterRow);

        Object.values(columnMapping).forEach(displayName => {
            const th = document.createElement('th');
            th.textContent = displayName;
            tableHead.appendChild(th);
        });

        const actionTh = document.createElement('th');
        actionTh.textContent = 'Answer by editing the row';
        actionTh.style.width = '200px';
        actionTh.style.textAlign = 'center';
        actionTh.style.fontWeight = 'bold';
        actionTh.style.fontSize = '16px';
        actionTh.style.color = 'blue';
        actionTh.style.backgroundColor = '#f0f0f0';
        actionTh.style.border = '1px solid #ccc';
        actionTh.style.padding = '10px';
        actionTh.style.borderRadius = '5px';
        actionTh.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        actionTh.style.cursor = 'pointer';
        actionTh.style.transition = 'background-color 0.3s';
        actionTh.addEventListener('mouseover', () => {
            actionTh.style.backgroundColor = '#e0e0e0';
        });
        actionTh.addEventListener('mouseout', () => {
            actionTh.style.backgroundColor = '#f0f0f0';
        });
        actionTh.addEventListener('click', () => {
            const newRow = document.createElement('tr');
            Object.keys(columnMapping).forEach(dbColumn => {
                const td = document.createElement('td');
                if (dbColumn === '_Answer') {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.placeholder = 'Enter answer';
                    input.dataset.dbColumn = dbColumn;
                    td.appendChild(input);
                } else {
                    td.textContent = '';
                }
                newRow.appendChild(td);
            });

            const actionTd = document.createElement('td');
            const saveButton = document.createElement('button');
            saveButton.textContent = 'Save';
            saveButton.addEventListener('click', () => saveNewRow(newRow));
            actionTd.appendChild(saveButton);
            newRow.appendChild(actionTd);

            tableBody.appendChild(newRow);
        });
        tableHead.appendChild(actionTh);

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