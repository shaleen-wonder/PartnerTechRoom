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
    let isQuestionSortedAsc = true; // Track sorting order for the Question column

    try {
        const response = await fetch('https://ptwranswersrv.azurewebsites.net/api/data');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        allData = data;

        Object.keys(columnMapping).forEach(dbColumn => {
            const th = document.createElement('th');
            th.textContent = columnMapping[dbColumn];

            // Add sorting functionality to the Question column
            if (dbColumn === '_Question') {
                th.style.cursor = 'pointer';
                th.addEventListener('click', () => {
                    sortQuestions();
                });
            }

            tableHead.appendChild(th);
        });

        const actionTh = document.createElement('th');
        actionTh.textContent = 'Actions';
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

    function sortQuestions() {
        allData.sort((a, b) => {
            const questionA = a._Question.toLowerCase();
            const questionB = b._Question.toLowerCase();

            if (isQuestionSortedAsc) {
                return questionA > questionB ? 1 : -1;
            } else {
                return questionA < questionB ? 1 : -1;
            }
        });

        isQuestionSortedAsc = !isQuestionSortedAsc; // Toggle sorting order
        populateRows(allData, columnMapping, tableBody); // Re-render the table
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

        tableBody.replaceChild(editRow, tableBody.children[rowIndex]);
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

    function saveRow(row, rowIndex) {
        const inputs = row.querySelectorAll('input');
        const updatedItem = {};

        // Collect updated values from inputs
        Object.keys(columnMapping).forEach((dbColumn, index) => {
            updatedItem[dbColumn] = inputs[index].value;
        });

        // Send the updated data to the server
        fetch('/api/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedItem)
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to update the record');
                return response.text();
            })
            .then(() => {
                // Update the local data and re-render the table
                allData[rowIndex] = updatedItem;
                populateRows(allData, columnMapping, tableBody);
            })
            .catch(error => console.error('Error updating record:', error));
    }

    function updateRowCount(count) {
        rowCountElement.textContent = `Total Rows: ${count}`;
    }

    function showPopup(message, isError = false) {
        const popup = document.createElement('div');
        popup.textContent = message;
        popup.style.position = 'fixed';
        popup.style.bottom = '20px';
        popup.style.right = '20px';
        popup.style.padding = '10px 20px';
        popup.style.backgroundColor = isError ? '#ff4d4d' : '#4caf50';
        popup.style.color = 'white';
        popup.style.borderRadius = '5px';
        popup.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        popup.style.zIndex = '1000';
        popup.style.fontSize = '14px';
        popup.style.fontWeight = 'bold';
        popup.style.transition = 'opacity 0.5s ease';

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 500);
        }, 3000);
    }
});