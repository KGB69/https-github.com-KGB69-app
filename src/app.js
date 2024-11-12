let expenseData = JSON.parse(localStorage.getItem('expenseData')) || {}; // Load from localStorage
let currentDate = new Date();
const expensesChartCtx = document.getElementById('expensesChart').getContext('2d');
const categoryPieChartCtx = document.getElementById('categoryPieChart').getContext('2d');

const expensesChart = new Chart(expensesChartCtx, {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Expenses', data: [], backgroundColor: 'rgba(75, 192, 192, 0.2)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 }] },
    options: { scales: { y: { beginAtZero: true } } }
});

const categoryPieChart = new Chart(categoryPieChartCtx, {
    type: 'pie',
    data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] }
});

// Generate random hex color for each category
function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function getExpensesForDate(date) {
    const dateKey = formatDate(date);
    return expenseData[dateKey] || [];
}

function addExpense() {
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value.trim();

    if (!amount || !category) {
        alert("Please enter both amount and category.");
        return;
    }

    const dateKey = formatDate(currentDate);
    if (!expenseData[dateKey]) expenseData[dateKey] = [];
    expenseData[dateKey].push({ amount, category });

    localStorage.setItem('expenseData', JSON.stringify(expenseData)); // Save to localStorage

    updateCharts();
    displayExpenses();
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseCategory').value = '';
}

function removeExpense(index) {
    const dateKey = formatDate(currentDate);
    if (expenseData[dateKey]) {
        expenseData[dateKey].splice(index, 1);
        localStorage.setItem('expenseData', JSON.stringify(expenseData)); // Save to localStorage
        updateCharts();
        displayExpenses();
    }
}

function updateCharts() {
    const viewMode = document.getElementById('viewMode').value;
    const expenses = viewMode === 'daily' ? getExpensesForDate(currentDate) : aggregateExpenses(viewMode);

    const categories = {};
    expenses.forEach(e => {
        categories[e.category] = (categories[e.category] || 0) + e.amount;
    });

    // Update Bar Chart
    expensesChart.data.labels = Object.keys(categories);
    expensesChart.data.datasets[0].data = Object.values(categories);
    expensesChart.update();

    // Generate random colors for each category in the pie chart
    const categoryColors = Object.keys(categories).map(() => generateRandomColor());

    // Update Pie Chart
    categoryPieChart.data.labels = Object.keys(categories);
    categoryPieChart.data.datasets[0].data = Object.values(categories);
    categoryPieChart.data.datasets[0].backgroundColor = categoryColors;
    categoryPieChart.update();

    document.getElementById('currentDate').textContent = `Date: ${formatDate(currentDate)}`;
    updateTotalExpenditure(expenses); // Update the total expenditure
}

function displayExpenses() {
    const dateKey = formatDate(currentDate);
    const expenses = expenseData[dateKey] || [];
    const tableBody = document.getElementById('expenseTableBody');
    tableBody.innerHTML = '';

    expenses.forEach((expense, index) => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = expense.amount;
        row.insertCell(1).textContent = expense.category;
        const actionCell = row.insertCell(2);
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Remove';
        deleteButton.onclick = () => removeExpense(index);
        actionCell.appendChild(deleteButton);
    });
}

function aggregateExpenses(viewMode) {
    const expenses = [];
    const endDate = new Date(currentDate);
    if (viewMode === 'weekly') endDate.setDate(currentDate.getDate() + 6);
    else if (viewMode === 'monthly') endDate.setMonth(currentDate.getMonth() + 1);

    for (let date = new Date(currentDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        expenses.push(...(getExpensesForDate(date)));
    }
    return expenses;
}

function jumpToDate() {
    const selectedDate = document.getElementById('calendar').value;
    if (selectedDate) {
        currentDate = new Date(selectedDate);
        updateCharts();
        displayExpenses();
    }
}

function viewPreviousPeriod() {
    const viewMode = document.getElementById('viewMode').value;
    if (viewMode === 'daily') currentDate.setDate(currentDate.getDate() - 1);
    else if (viewMode === 'weekly') currentDate.setDate(currentDate.getDate() - 7);
    else if (viewMode === 'monthly') currentDate.setMonth(currentDate.getMonth() - 1);
    updateCharts();
    displayExpenses();
}

function viewNextPeriod() {
    const viewMode = document.getElementById('viewMode').value;
    if (viewMode === 'daily') currentDate.setDate(currentDate.getDate() + 1);
    else if (viewMode === 'weekly') currentDate.setDate(currentDate.getDate() + 7);
    else if (viewMode === 'monthly') currentDate.setMonth(currentDate.getMonth() + 1);
    updateCharts();
    displayExpenses();
}

function updateTotalExpenditure(expenses) {
    // Calculate total expenditure for daily, weekly, and monthly views
    const dailyTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const weeklyTotal = aggregateExpenses('weekly').reduce((sum, expense) => sum + expense.amount, 0);
    const monthlyTotal = aggregateExpenses('monthly').reduce((sum, expense) => sum + expense.amount, 0);

    document.getElementById('totalExpenditure').innerHTML = `
        <p><strong>Total Expenditure:</strong></p>
        <p>Daily: $${dailyTotal.toFixed(2)}</p>
        <p>Weekly: $${weeklyTotal.toFixed(2)}</p>
        <p>Monthly: $${monthlyTotal.toFixed(2)}</p>
    `;
}

updateCharts();
displayExpenses();
