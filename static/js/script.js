// Sample data (in a real application, this would come from your Django backend)
let inventoryData = [
    { id: 1, name: 'Flour', quantity: 25, unit: 'kg', min_threshold: 10, expiry_date: '2024-12-31' },
    { id: 2, name: 'Sugar', quantity: 15, unit: 'kg', min_threshold: 5, expiry_date: '2024-11-15' },
    { id: 3, name: 'Eggs', quantity: 120, unit: 'pcs', min_threshold: 24, expiry_date: '2023-08-10' },
    { id: 4, name: 'Milk', quantity: 8, unit: 'L', min_threshold: 10, expiry_date: '2023-08-05' },
    { id: 5, name: 'Butter', quantity: 4.5, unit: 'kg', min_threshold: 5, expiry_date: '2023-09-20' },
    { id: 6, name: 'Chocolate', quantity: 7, unit: 'kg', min_threshold: 3, expiry_date: '2024-02-15' },
    { id: 7, name: 'Vanilla Extract', quantity: 0.8, unit: 'L', min_threshold: 1, expiry_date: '2024-05-10' }
];

let recipeData = [
    { 
        id: 1, 
        name: 'Chocolate Cake', 
        ingredients: [
            { inventory_id: 1, quantity_required: 0.5 },
            { inventory_id: 2, quantity_required: 0.3 },
            { inventory_id: 3, quantity_required: 4 },
            { inventory_id: 4, quantity_required: 0.25 },
            { inventory_id: 5, quantity_required: 0.2 },
            { inventory_id: 6, quantity_required: 0.3 }
        ]
    },
    { 
        id: 2, 
        name: 'Vanilla Cupcakes', 
        ingredients: [
            { inventory_id: 1, quantity_required: 0.25 },
            { inventory_id: 2, quantity_required: 0.2 },
            { inventory_id: 3, quantity_required: 2 },
            { inventory_id: 5, quantity_required: 0.1 },
            { inventory_id: 7, quantity_required: 0.02 }
        ]
    },
    { 
        id: 3, 
        name: 'Bread Loaf', 
        ingredients: [
            { inventory_id: 1, quantity_required: 0.5 },
            { inventory_id: 2, quantity_required: 0.05 },
            { inventory_id: 4, quantity_required: 0.2 },
            { inventory_id: 5, quantity_required: 0.05 }
        ]
    }
];

let orderData = [
    { id: 1, recipe_id: 1, quantity_made: 2, timestamp: '2023-08-01T10:30:00', status: 'completed' },
    { id: 2, recipe_id: 3, quantity_made: 5, timestamp: '2023-08-01T14:15:00', status: 'completed' },
    { id: 3, recipe_id: 2, quantity_made: 24, timestamp: '2023-08-02T09:45:00', status: 'in-progress' },
    { id: 4, recipe_id: 1, quantity_made: 1, timestamp: '2023-08-02T16:20:00', status: 'pending' }
];

// DOM Elements
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileSidebarButton = document.getElementById('mobile-sidebar-button');
const sidebarMenu = document.getElementById('sidebar-menu');

// Modals
const addInventoryModal = document.getElementById('add-inventory-modal');
const addRecipeModal = document.getElementById('add-recipe-modal');
const createOrderModal = document.getElementById('create-order-modal');
const closeModalButtons = document.querySelectorAll('.close-modal');

// Buttons
const addInventoryBtn = document.getElementById('add-inventory-btn');
const addRecipeBtn = document.getElementById('add-recipe-btn');
const createOrderBtn = document.getElementById('create-order-btn');
const addIngredientBtn = document.getElementById('add-ingredient-btn');

// Forms
const addInventoryForm = document.getElementById('add-inventory-form');
const addRecipeForm = document.getElementById('add-recipe-form');
const createOrderForm = document.getElementById('create-order-form');

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            showSection(targetId + '-section');
            
            // Update active link
            navLinks.forEach(l => {
                l.classList.remove('active', 'bg-primary-50', 'text-primary-600');
                l.classList.add('text-gray-600', 'hover:bg-gray-100', 'hover:text-primary-600');
            });
            this.classList.add('active', 'bg-primary-50', 'text-primary-600');
            this.classList.remove('text-gray-600', 'hover:bg-gray-100');
            
            // Hide mobile menu after click
            if (window.innerWidth < 768) {
                sidebarMenu.classList.add('hidden');
            }
        });
    });
    
    // Mobile menu toggle
    mobileMenuButton.addEventListener('click', function() {
        sidebarMenu.classList.toggle('hidden');
    });
    
    // Mobile sidebar toggle
    if (mobileSidebarButton) {
        mobileSidebarButton.addEventListener('click', function() {
            sidebarMenu.classList.toggle('hidden');
        });
    }
    
    // Logout functionality
    document.querySelectorAll('a[href="#logout"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                alert('You have been logged out successfully.');
                // In a real app, this would redirect to the logout endpoint
                // window.location.href = '/logout/';
            }
        });
    });
    
    // Modal triggers
    addInventoryBtn.addEventListener('click', () => addInventoryModal.classList.remove('hidden'));
    addRecipeBtn.addEventListener('click', () => addRecipeModal.classList.remove('hidden'));
    createOrderBtn.addEventListener('click', () => createOrderModal.classList.remove('hidden'));
    
    // Close modals
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            addInventoryModal.classList.add('hidden');
            addRecipeModal.classList.add('hidden');
            createOrderModal.classList.add('hidden');
        });
    });
    
    // Add ingredient button
    addIngredientBtn.addEventListener('click', addIngredientRow);
    
    // Form submissions
    addInventoryForm.addEventListener('submit', handleAddInventory);
    addRecipeForm.addEventListener('submit', handleAddRecipe);
    createOrderForm.addEventListener('submit', handleCreateOrder);
    
    // Recipe selection in order form
    document.getElementById('order-recipe').addEventListener('change', updateRequiredIngredients);
    document.getElementById('order-quantity').addEventListener('input', function() {
        if (document.getElementById('order-recipe').value) {
            updateRequiredIngredients();
        }
    });
    
    // Initialize the dashboard data
    updateDashboardStats();
    renderInventoryTable();
    renderRecipeCards();
    renderOrdersTable();
    renderRecentOrders();
    renderAlerts();
    renderInventoryChart();
    
    // Populate dropdowns
    populateInventoryDropdowns();
    populateRecipeDropdown();
    
    // Set default active section
    showSection('dashboard-section');
});

// Show the selected section and hide others
function showSection(sectionId) {
    sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.remove('hidden');
            section.classList.add('active');
        } else {
            section.classList.add('hidden');
            section.classList.remove('active');
        }
    });
}

// Update dashboard statistics
function updateDashboardStats() {
    document.getElementById('total-inventory').textContent = inventoryData.length;
    document.getElementById('total-recipes').textContent = recipeData.length;
    
    const lowStockItems = inventoryData.filter(item => item.quantity < item.min_threshold);
    document.getElementById('low-stock-count').textContent = lowStockItems.length;
    
    const today = new Date();
    const expiredItems = inventoryData.filter(item => {
        if (!item.expiry_date) return false;
        return new Date(item.expiry_date) < today;
    });
    document.getElementById('expired-count').textContent = expiredItems.length;
}

// Render inventory table
function renderInventoryTable() {
    const tableBody = document.getElementById('inventory-table');
    tableBody.innerHTML = '';
    
    const today = new Date();
    
    inventoryData.forEach(item => {
        const row = document.createElement('tr');
        
        const isLowStock = item.quantity < item.min_threshold;
        const isExpired = item.expiry_date && new Date(item.expiry_date) < today;
        
        let statusClass = 'bg-green-100 text-green-800';
        let statusText = 'In Stock';
        
        if (isExpired) {
            statusClass = 'bg-red-100 text-red-800';
            statusText = 'Expired';
        } else if (isLowStock) {
            statusClass = 'bg-amber-100 text-amber-800';
            statusText = 'Low Stock';
        }
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">${item.name}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">${item.quantity}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.unit}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.min_threshold}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.expiry_date || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-primary-600 hover:text-primary-900 mr-3 transition-all">
                    <i class="fas fa-edit mr-1"></i> Edit
                </button>
                <button class="text-red-600 hover:text-red-900 transition-all">
                    <i class="fas fa-trash mr-1"></i> Delete
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Render recipe cards
function renderRecipeCards() {
    const container = document.getElementById('recipes-container');
    container.innerHTML = '';
    
    recipeData.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md';
        
        let ingredientsList = '';
        recipe.ingredients.forEach(ing => {
            const inventoryItem = inventoryData.find(i => i.id === ing.inventory_id);
            if (inventoryItem) {
                const isLowStock = inventoryItem.quantity < inventoryItem.min_threshold;
                const textClass = isLowStock ? 'text-amber-600' : 'text-gray-600';
                
                ingredientsList += `
                    <li class="flex justify-between ${textClass}">
                        <span>${inventoryItem.name}</span>
                        <span>${ing.quantity_required} ${inventoryItem.unit}</span>
                    </li>
                `;
            }
        });
        
        card.innerHTML = `
            <div class="p-4 border-b border-gray-100 bg-gradient-to-r from-primary-500 to-secondary-500">
                <h3 class="text-lg font-semibold text-white">${recipe.name}</h3>
            </div>
            <div class="p-4">
                <h4 class="font-medium mb-2 text-gray-800">Ingredients:</h4>
                <ul class="space-y-2 text-sm">
                    ${ingredientsList}
                </ul>
            </div>
            <div class="bg-gray-50 px-4 py-3 flex justify-between">
                <button class="text-primary-600 hover:text-primary-700 text-sm font-medium transition-all">
                    <i class="fas fa-edit mr-1"></i> Edit
                </button>
                <button class="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-lg text-sm transition-all" 
                        onclick="quickCreateOrder(${recipe.id})">
                    <i class="fas fa-plus mr-1"></i> Create Order
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Render orders table
function renderOrdersTable() {
    const tableBody = document.getElementById('orders-table');
    tableBody.innerHTML = '';
    
    // Sort orders by timestamp (newest first)
    const sortedOrders = [...orderData].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    sortedOrders.forEach(order => {
        const recipe = recipeData.find(r => r.id === order.recipe_id);
        const row = document.createElement('tr');
        
        const orderDate = new Date(order.timestamp);
        const formattedDate = orderDate.toLocaleDateString();
        const formattedTime = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let statusClass = '';
        let statusText = '';
        
        switch(order.status) {
            case 'completed':
                statusClass = 'bg-green-100 text-green-800';
                statusText = 'Completed';
                break;
            case 'in-progress':
                statusClass = 'bg-blue-100 text-blue-800';
                statusText = 'In Progress';
                break;
            case 'pending':
                statusClass = 'bg-amber-100 text-amber-800';
                statusText = 'Pending';
                break;
            default:
                statusClass = 'bg-gray-100 text-gray-800';
                statusText = 'Unknown';
        }
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">#${order.id}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${recipe ? recipe.name : 'Unknown Recipe'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${order.quantity_made}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${formattedDate}</div>
                <div class="text-sm text-gray-500">${formattedTime}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-primary-600 hover:text-primary-700 transition-all">
                    <i class="fas fa-eye mr-1"></i> View
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Render recent orders for dashboard
function renderRecentOrders() {
    const tableBody = document.getElementById('recent-orders');
    tableBody.innerHTML = '';
    
    // Get 5 most recent orders
    const recentOrders = [...orderData]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
    
    recentOrders.forEach(order => {
        const recipe = recipeData.find(r => r.id === order.recipe_id);
        const row = document.createElement('tr');
        
        const orderDate = new Date(order.timestamp);
        const formattedDate = orderDate.toLocaleDateString();
        
        let statusClass = '';
        let statusText = '';
        
        switch(order.status) {
            case 'completed':
                statusClass = 'bg-green-100 text-green-800';
                statusText = 'Completed';
                break;
            case 'in-progress':
                statusClass = 'bg-blue-100 text-blue-800';
                statusText = 'In Progress';
                break;
            case 'pending':
                statusClass = 'bg-amber-100 text-amber-800';
                statusText = 'Pending';
                break;
            default:
                statusClass = 'bg-gray-100 text-gray-800';
                statusText = 'Unknown';
        }
        
        row.innerHTML = `
            <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">${recipe ? recipe.name : 'Unknown Recipe'}</div>
            </td>
            <td class="px-4 py-3">
                <div class="text-sm text-gray-900">${order.quantity_made}</div>
            </td>
            <td class="px-4 py-3">
                <div class="text-sm text-gray-900">${formattedDate}</div>
            </td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                    ${statusText}
                </span>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Render alerts
function renderAlerts() {
    const alertsContainer = document.getElementById('alerts-container');
    alertsContainer.innerHTML = '';
    
    const today = new Date();
    const alerts = [];
    
    // Check for low stock
    inventoryData.forEach(item => {
        if (item.quantity < item.min_threshold) {
            alerts.push({
                type: 'warning',
                message: `Low Inventory Alert: The stock for '${item.name}' is below the threshold. Quantity: ${item.quantity}${item.unit}.`
            });
        }
    });
    
    // Check for expired items
    inventoryData.forEach(item => {
        if (item.expiry_date && new Date(item.expiry_date) < today) {
            alerts.push({
                type: 'danger',
                message: `Expired Inventory Alert: The item '${item.name}' has expired on ${item.expiry_date}. Please take action.`
            });
        }
    });
    
    if (alerts.length === 0) {
        alertsContainer.innerHTML = `
            <div class="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg">
                <div class="flex">
                    <i class="fas fa-check-circle mt-0.5 mr-3"></i>
                    <p>No alerts at this time. Everything is running smoothly!</p>
                </div>
            </div>
        `;
        return;
    }
    
    alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        
        if (alert.type === 'warning') {
            alertDiv.className = 'bg-amber-50 border-l-4 border-amber-500 text-amber-700 p-4 mb-3 rounded-r-lg';
            alertDiv.innerHTML = `
                <div class="flex">
                    <i class="fas fa-exclamation-triangle mt-0.5 mr-3"></i>
                    <p>${alert.message}</p>
                </div>
            `;
        } else if (alert.type === 'danger') {
            alertDiv.className = 'bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-3 rounded-r-lg';
            alertDiv.innerHTML = `
                <div class="flex">
                    <i class="fas fa-exclamation-circle mt-0.5 mr-3"></i>
                    <p>${alert.message}</p>
                </div>
            `;
        }
        
        alertsContainer.appendChild(alertDiv);
    });
}

// Render inventory chart
function renderInventoryChart() {
    const ctx = document.getElementById('inventory-chart').getContext('2d');
    
    // Get top 6 inventory items by quantity
    const chartData = [...inventoryData]
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 6);
    
    const labels = chartData.map(item => item.name);
    const quantities = chartData.map(item => item.quantity);
    const thresholds = chartData.map(item => item.min_threshold);
    
    // Create gradient for bars
    const quantityGradient = ctx.createLinearGradient(0, 0, 0, 400);
    quantityGradient.addColorStop(0, 'rgba(14, 165, 233, 0.8)');
    quantityGradient.addColorStop(1, 'rgba(14, 165, 233, 0.2)');
    
    const thresholdGradient = ctx.createLinearGradient(0, 0, 0, 400);
    thresholdGradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
    thresholdGradient.addColorStop(1, 'rgba(239, 68, 68, 0.2)');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Current Quantity',
                    data: quantities,
                    backgroundColor: quantityGradient,
                    borderColor: 'rgb(14, 165, 233)',
                    borderWidth: 1,
                    borderRadius: 4,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7
                },
                {
                    label: 'Minimum Threshold',
                    data: thresholds,
                    backgroundColor: thresholdGradient,
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 1,
                    borderRadius: 4,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1e293b',
                    bodyColor: '#475569',
                    borderColor: '#e2e8f0',
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true,
                    callbacks: {
                        labelPointStyle: function(context) {
                            return {
                                pointStyle: 'rectRounded',
                                rotation: 0
                            };
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        drawBorder: false,
                        color: 'rgba(226, 232, 240, 0.7)'
                    },
                    ticks: {
                        padding: 10,
                        color: '#64748b'
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        padding: 10,
                        color: '#64748b'
                    }
                }
            }
        }
    });
}

// Populate inventory dropdowns
function populateInventoryDropdowns() {
    const ingredientSelects = document.querySelectorAll('.ingredient-select');
    
    ingredientSelects.forEach(select => {
        select.innerHTML = '<option value="">Select Item</option>';
        
        inventoryData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.name} (${item.quantity}${item.unit})`;
            option.dataset.unit = item.unit;
            select.appendChild(option);
        });
    });
}

// Populate recipe dropdown
function populateRecipeDropdown() {
    const recipeSelect = document.getElementById('order-recipe');
    recipeSelect.innerHTML = '<option value="">Select Recipe</option>';
    
    recipeData.forEach(recipe => {
        const option = document.createElement('option');
        option.value = recipe.id;
        option.textContent = recipe.name;
        recipeSelect.appendChild(option);
    });
}

// Add ingredient row to recipe form
function addIngredientRow() {
    const container = document.getElementById('ingredients-container');
    const newRow = document.createElement('div');
    newRow.className = 'ingredient-row grid grid-cols-3 gap-2 mb-3';
    
    newRow.innerHTML = `
        <select class="ingredient-select w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" required>
            <option value="">Select Item</option>
        </select>
        <input type="number" step="0.01" class="ingredient-quantity w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Quantity" required>
        <div class="flex items-center">
            <span class="ingredient-unit mr-2 text-gray-600">kg</span>
            <button type="button" class="remove-ingredient text-red-500 hover:text-red-700 transition-all">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    container.appendChild(newRow);
    
    // Populate the new dropdown
    const select = newRow.querySelector('.ingredient-select');
    inventoryData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.name} (${item.quantity}${item.unit})`;
        option.dataset.unit = item.unit;
        select.appendChild(option);
    });
    
    // Add event listener to update unit
    select.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const unitSpan = this.parentElement.querySelector('.ingredient-unit');
        if (selectedOption.dataset.unit) {
            unitSpan.textContent = selectedOption.dataset.unit;
        }
    });
    
    // Add event listener to remove button
    const removeBtn = newRow.querySelector('.remove-ingredient');
    removeBtn.addEventListener('click', function() {
        container.removeChild(newRow);
    });
}

// Update required ingredients when recipe is selected
function updateRequiredIngredients() {
    const recipeId = parseInt(document.getElementById('order-recipe').value);
    const quantity = parseInt(document.getElementById('order-quantity').value) || 1;
    const ingredientsList = document.getElementById('required-ingredients-list');
    const recipeIngredientsSection = document.getElementById('recipe-ingredients');
    const insufficientWarning = document.getElementById('insufficient-warning');
    
    if (!recipeId) {
        recipeIngredientsSection.classList.add('hidden');
        insufficientWarning.classList.add('hidden');
        return;
    }
    
    const recipe = recipeData.find(r => r.id === recipeId);
    if (!recipe) return;
    
    ingredientsList.innerHTML = '';
    recipeIngredientsSection.classList.remove('hidden');
    
    let hasInsufficientInventory = false;
    
    recipe.ingredients.forEach(ing => {
        const inventoryItem = inventoryData.find(i => i.id === ing.inventory_id);
        if (inventoryItem) {
            const requiredAmount = ing.quantity_required * quantity;
            const isInsufficient = requiredAmount > inventoryItem.quantity;
            
            if (isInsufficient) {
                hasInsufficientInventory = true;
            }
            
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center py-1';
            li.innerHTML = `
                <span>${inventoryItem.name}</span>
                <div class="flex items-center">
                    <span class="font-medium">${requiredAmount} ${inventoryItem.unit}</span>
                    ${isInsufficient ? 
                        `<span class="text-red-600 ml-2 text-xs">(Only ${inventoryItem.quantity} available)</span>` : 
                        '<span class="text-green-600 ml-2 text-xs"><i class="fas fa-check"></i></span>'}
                </div>
            `;
            ingredientsList.appendChild(li);
        }
    });
    
    if (hasInsufficientInventory) {
        insufficientWarning.classList.remove('hidden');
    } else {
        insufficientWarning.classList.add('hidden');
    }
}

// Handle add inventory form submission
function handleAddInventory(e) {
    e.preventDefault();
    
    const name = document.getElementById('item-name').value;
    const quantity = parseFloat(document.getElementById('item-quantity').value);
    const unit = document.getElementById('item-unit').value;
    const threshold = parseFloat(document.getElementById('item-threshold').value);
    const expiry = document.getElementById('item-expiry').value;
    
    const newItem = {
        id: inventoryData.length + 1,
        name,
        quantity,
        unit,
        min_threshold: threshold,
        expiry_date: expiry || null
    };
    
    inventoryData.push(newItem);
    
    // Update UI
    renderInventoryTable();
    updateDashboardStats();
    renderAlerts();
    renderInventoryChart();
    populateInventoryDropdowns();
    
    // Close modal and reset form
    addInventoryModal.classList.add('hidden');
    addInventoryForm.reset();
    
    // Show success notification
    showNotification('Inventory item added successfully!', 'success');
}

// Handle add recipe form submission
function handleAddRecipe(e) {
    e.preventDefault();
    
    const name = document.getElementById('recipe-name').value;
    const ingredientRows = document.querySelectorAll('.ingredient-row');
    
    const ingredients = [];
    ingredientRows.forEach(row => {
        const inventoryId = parseInt(row.querySelector('.ingredient-select').value);
        const quantity = parseFloat(row.querySelector('.ingredient-quantity').value);
        
        if (inventoryId && quantity) {
            ingredients.push({
                inventory_id: inventoryId,
                quantity_required: quantity
            });
        }
    });
    
    const newRecipe = {
        id: recipeData.length + 1,
        name,
        ingredients
    };
    
    recipeData.push(newRecipe);
    
    // Update UI
    renderRecipeCards();
    updateDashboardStats();
    populateRecipeDropdown();
    
    // Close modal and reset form
    addRecipeModal.classList.add('hidden');
    addRecipeForm.reset();
    
    // Reset ingredients container
    const ingredientsContainer = document.getElementById('ingredients-container');
    ingredientsContainer.innerHTML = `
        <div class="ingredient-row grid grid-cols-3 gap-2 mb-3">
            <select class="ingredient-select w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" required>
                <option value="">Select Item</option>
            </select>
            <input type="number" step="0.01" class="ingredient-quantity w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Quantity" required>
            <div class="flex items-center">
                <span class="ingredient-unit mr-2 text-gray-600">kg</span>
                <button type="button" class="remove-ingredient text-red-500 hover:text-red-700 transition-all">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    populateInventoryDropdowns();
    
    // Show success notification
    showNotification('Recipe added successfully!', 'success');
}

// Handle create order form submission
function handleCreateOrder(e) {
    e.preventDefault();
    
    const recipeId = parseInt(document.getElementById('order-recipe').value);
    const quantity = parseInt(document.getElementById('order-quantity').value) || 1;
    
    if (!recipeId) return;
    
    const recipe = recipeData.find(r => r.id === recipeId);
    if (!recipe) return;
    
    // Check if we have enough inventory
    let canProceed = true;
    recipe.ingredients.forEach(ing => {
        const inventoryItem = inventoryData.find(i => i.id === ing.inventory_id);
        if (inventoryItem) {
            const requiredAmount = ing.quantity_required * quantity;
            if (requiredAmount > inventoryItem.quantity) {
                canProceed = false;
            }
        }
    });
    
    if (!canProceed) {
        showNotification('Cannot create order: Insufficient inventory!', 'error');
        return;
    }
    
    // Create new order
    const newOrder = {
        id: orderData.length + 1,
        recipe_id: recipeId,
        quantity_made: quantity,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    orderData.push(newOrder);
    
    // Reduce inventory
    recipe.ingredients.forEach(ing => {
        const inventoryItem = inventoryData.find(i => i.id === ing.inventory_id);
        if (inventoryItem) {
            inventoryItem.quantity -= ing.quantity_required * quantity;
        }
    });
    
    // Update UI
    renderInventoryTable();
    renderOrdersTable();
    renderRecentOrders();
    updateDashboardStats();
    renderAlerts();
    renderInventoryChart();
    populateInventoryDropdowns();
    
    // Close modal and reset form
    createOrderModal.classList.add('hidden');
    createOrderForm.reset();
    document.getElementById('recipe-ingredients').classList.add('hidden');
    document.getElementById('insufficient-warning').classList.add('hidden');
    
    // Show success notification
    showNotification('Order created successfully!', 'success');
}

// Quick create order from recipe card
function quickCreateOrder(recipeId) {
    const recipe = recipeData.find(r => r.id === recipeId);
    if (!recipe) return;
    
    // Check if we have enough inventory
    let canProceed = true;
    recipe.ingredients.forEach(ing => {
        const inventoryItem = inventoryData.find(i => i.id === ing.inventory_id);
        if (inventoryItem) {
            if (ing.quantity_required > inventoryItem.quantity) {
                canProceed = false;
            }
        }
    });
    
    if (!canProceed) {
        showNotification('Cannot create order: Insufficient inventory!', 'error');
        return;
    }
    
    // Create new order
    const newOrder = {
        id: orderData.length + 1,
        recipe_id: recipeId,
        quantity_made: 1,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    orderData.push(newOrder);
    
    // Reduce inventory
    recipe.ingredients.forEach(ing => {
        const inventoryItem = inventoryData.find(i => i.id === ing.inventory_id);
        if (inventoryItem) {
            inventoryItem.quantity -= ing.quantity_required;
        }
    });
    
    // Update UI
    renderInventoryTable();
    renderOrdersTable();
    renderRecentOrders();
    updateDashboardStats();
    renderAlerts();
    renderInventoryChart();
    
    showNotification(`Order created for ${recipe.name}`, 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center transition-all transform translate-y-0 opacity-100`;
    
    let bgColor, textColor, icon;
    
    switch(type) {
        case 'success':
            bgColor = 'bg-green-500';
            textColor = 'text-white';
            icon = '<i class="fas fa-check-circle mr-2"></i>';
            break;
        case 'error':
            bgColor = 'bg-red-500';
            textColor = 'text-white';
            icon = '<i class="fas fa-exclamation-circle mr-2"></i>';
            break;
        case 'warning':
            bgColor = 'bg-amber-500';
            textColor = 'text-white';
            icon = '<i class="fas fa-exclamation-triangle mr-2"></i>';
            break;
        default:
            bgColor = 'bg-primary-500';
            textColor = 'text-white';
            icon = '<i class="fas fa-info-circle mr-2"></i>';
    }
    
    notification.className += ` ${bgColor} ${textColor}`;
    notification.innerHTML = `${icon} ${message}`;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}