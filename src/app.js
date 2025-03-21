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
        }
        );  
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
        }
        );
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
        }
        );
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
        }
        );
       
        
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

    function openEditRow(item, rowIndex) {
        const editRow = document.createElement('tr');
        Object.keys(columnMapping).forEach(dbColumn => {
            const td = document.createElement('td');
            if (dbColumn === '_Answer') {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = item[dbColumn] || '';
                input.dataset.dbColumn = dbColumn;
                td.appendChild(input);
            } else {
                td.textContent = item[dbColumn] || '';
            }
            editRow.appendChild(td);
        });

        const actionTd = document.createElement('td');
        const updateButton = document.createElement('button');
        updateButton.textContent = 'Update';
        updateButton.addEventListener('click', () => updateRecord(item, rowIndex, editRow));
        actionTd.appendChild(updateButton);
        editRow.appendChild(actionTd);

        tableBody.insertBefore(editRow, tableBody.children[rowIndex + 1]);
    }

    async function updateRecord(item, rowIndex, editRow) {
        const inputs = editRow.querySelectorAll('input');
        inputs.forEach(input => {
            const dbColumn = input.dataset.dbColumn;
            item[dbColumn] = input.value;
        });

        try {
            const response = await fetch('https://ptwranswersrv.azurewebsites.net/api/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            if (!response.ok) throw new Error('Failed to update record');
            
            // Update the local data
            allData[rowIndex] = item;
            populateRows(allData, columnMapping, tableBody);

            // Show a popup notification
            showPopup('Record has been successfully updated!');
        } catch (error) {
            console.error('Error updating record:', error);
            showPopup('Failed to update the record. Please try again.', true);
        }
    }

    // Function to show a popup notification
    function showPopup(message, isError = false) {
        const popup = document.createElement('div');
        popup.textContent = message;
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

        document.body.appendChild(popup);

        // Automatically remove the popup after 3 seconds
        setTimeout(() => {
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 500); // Wait for the fade-out transition
        }, 3000);
    }

    function updateRowCount(count) {
        rowCountElement.textContent = `Total Rows: ${count}`;
    }
});
