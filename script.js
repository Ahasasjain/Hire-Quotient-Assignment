const table = document.getElementById('DataTable');
const tbody = table.querySelector('tbody');
const searchInput = document.getElementById('searchInput');
let fetchedData = [];
let currentPage = 1;
const pageSize = 10;

async function GetData(){
    try {
    const response = await fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
    let data = await response.json();
    fetchedData=data;
    renderTable(fetchedData);
    } catch (error) {
    console.error('Error fetching data:', error);
    }
}

GetData();

function renderTable(dataToRender) {
    tbody.innerHTML = '';
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = dataToRender.slice(start, end);

    paginatedData.forEach(rowData => {
        const row = document.createElement('tr');

        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = rowData.id;
        checkbox.classList.add('SelectedCheckbox');
        checkbox.setAttribute("id",`chkBox_${rowData.id + 1}`);
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);
        checkbox.addEventListener('click', function(event) {
            if (event.target.type === 'checkbox') {
                const row = this.closest('tr'); 
            if (this.checked) {
                row.classList.add('checked-row'); 
            } else {
                row.classList.remove('checked-row');
            }
                updateRowCounts();
            }
        });    

        for (const key in rowData) {
            if (Object.hasOwnProperty.call(rowData, key) && key !== 'id') {
                const cell = document.createElement('td');
                cell.textContent = rowData[key]; 
                cell.classList.add('editable-cell');
                row.appendChild(cell);
                const tableRows = document.querySelectorAll('tr');
                tableRows.forEach((row, index) => {
                row.id = `row_${index + 1}`;
                });
            }
        }

        const editButton = document.createElement('button');
        editButton.textContent = '';
        const editIcon = document.createElement('span');
        editIcon.innerHTML = '&#9998;';
        editIcon.style.fontSize = '26px';
        editIcon.style.cursor='pointer';
        editButton.appendChild(editIcon);
        editButton.classList.add('edit');
        editButton.addEventListener('click', () => edit(rowData.id));
        row.appendChild(editButton);
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '';
        const deleteIcon = document.createElement('span');
        deleteIcon.innerHTML = '&#128465;';
        deleteIcon.style.fontSize = '26px';
        deleteIcon.style.color='red';
        deleteIcon.style.fontWeight = 'bold';
        deleteIcon.style.cursor='pointer';

        deleteButton.appendChild(deleteIcon);
        deleteButton.classList.add('delete');
        deleteButton.addEventListener('click', () => handleDelete(rowData.id));
        row.appendChild(deleteButton);

        tbody.appendChild(row);
    });
    renderPagination(dataToRender.length);
    updateRowCounts();
}

function renderPagination(totalRecords) {
    const totalPages = Math.ceil(totalRecords / pageSize);
    const paginationDiv = document.querySelector('.pagination');
    paginationDiv.innerHTML = '';
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages} `;
    pageInfo.classList.add('PaginationText');
    paginationDiv.appendChild(pageInfo);

    const firstPage = document.createElement('button');
        firstPage.textContent = "<<";
        firstPage.classList.add('PageButton');
        firstPage.classList.add('first-page');
        firstPage.addEventListener('click', function() {
            currentPage = 1;
            renderTable(fetchedData);
        });
        paginationDiv.appendChild(firstPage);

    const prev = document.createElement('button');
        prev.textContent = "<";
        prev.classList.add('PageButton');
        prev.classList.add('previous-page');
        prev.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;  
            }
            renderTable(fetchedData); 
        });
        paginationDiv.appendChild(prev);
    
        for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.add('PageButton');
        button.classList.add(i);
        button.addEventListener('click', function() {
            currentPage = i;
            renderTable(fetchedData);
        });
        paginationDiv.appendChild(button);
    }

    const nextPage = document.createElement('button');
    nextPage.textContent = ">";
    nextPage.classList.add('PageButton');
    nextPage.classList.add('next-page');
    nextPage.addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++; 
        }
        renderTable(fetchedData); 
    });
    paginationDiv.appendChild(nextPage);
    
    const lastPage = document.createElement('button');
    lastPage.textContent = ">>";
    lastPage.classList.add('PageButton');
    lastPage.classList.add('last-page');
    lastPage.addEventListener('click', function() { 
            currentPage=totalPages;
        renderTable(fetchedData); 
    });
    paginationDiv.appendChild(lastPage);
}

searchInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        const searchTerm = event.target.value.trim().toLowerCase();

        const filteredData = fetchedData.filter(row => {
            return Object.values(row).some(value => {
                if (value !== null && typeof value === 'string') {
                    return value.toLowerCase().includes(searchTerm);
                }
                return false;
            });
        });

        currentPage = 1;
        renderTable(filteredData);
    }
});

function selectAllRows(checkbox) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(cb => {
        if (cb !== checkbox) {
            cb.checked = checkbox.checked;
            const row = cb.closest('tr');
            if (cb.checked) {
                row.classList.add('checked-row'); 
            } else {
                row.classList.remove('checked-row'); 
            }
        } 
    });
    updateRowCounts();
}

function deleteSelectedRows() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    if(checkboxes.length!==0){
        const confirmed = confirm('Are you sure you want to delete selected rows?');
    if(confirmed){       
    const selectedIds = Array.from(checkboxes).map(checkbox => checkbox.value);
    const filteredData = fetchedData.filter(row => !selectedIds.includes(row.id));
    fetchedData = filteredData;
    renderTable(filteredData);
}
}   
}

function updateRowCounts() {
    const totalRowCountElement = document.getElementById('totalRowCount');
    const selectedRowCountElement = document.getElementById('selectedRowCount');
    const totalRowCount = fetchedData.length;
    const selectedRowCount = document.querySelectorAll('input[type="checkbox"]:checked').length;
    totalRowCountElement.textContent = totalRowCount;
    selectedRowCountElement.textContent = selectedRowCount;
}

function edit(rowId) {
    const tableRow = document.getElementById(`row_${parseInt(rowId)+1}`);
    const cells = tableRow.querySelectorAll('td');
    for (let i = 1; i < cells.length; i++) {
        const cell = cells[i];
        const cellText = cell.textContent;
        const input = document.createElement('input');
        input.value = cellText;
        
        input.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                cell.textContent = input.value;
                if (cell.contains(input)) {
                    cell.removeChild(input);
                }
            }
        });
        cell.textContent = '';
        cell.appendChild(input); 
        input.focus(); 
    }
}

function handleDelete(rowId) {
    const confirmed = confirm('Are you sure you want to delete this row?');
    if (confirmed) {
        fetchedData = fetchedData.filter(row => row.id !== rowId);
        renderTable(fetchedData);
        updateRowCounts();
    }
}

