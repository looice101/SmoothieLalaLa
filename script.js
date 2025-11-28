// Game State
let playerName = "Player";
let level = 1;
let currentSmoothie = "";
let addedIngredients = [];
let money = 100;
let reputation = 0;
let orderTimeLimit = 60;
let orderTimerInterval;
let currentOrder = null;
let currentCustomer = null;
let currentReward = 0;

// Player Inventory - Start with some ingredients
let inventory = {
    Strawberry: 5,
    Banana: 5,
    Mango: 5,
    Blueberries: 5,
    Pineapple: 5,
    Watermelon: 5,
    Milk: 5,
    Ice: 999, // Infinite ice
    Spinach: 5,
    Yogurt: 5
};

// Recipes
const recipes = {
    1: {
        Strawberry: { 
            ingredients: { Strawberry: 3, Milk: 5, Ice: 1 }, 
            color: "#ff4d94",
            price: 15
        },
        Banana: { 
            ingredients: { Banana: 3, Milk: 5, Ice: 1 }, 
            color: "#ffe066",
            price: 12
        },
        Mango: { 
            ingredients: { Mango: 4, Milk: 6, Ice: 1 }, 
            color: "#ffb84d",
            price: 18
        }
    },
    2: {
        MixedBerry: { 
            ingredients: { Strawberry: 2, Blueberries: 2, Milk: 6, Ice: 1 }, 
            color: "#b366ff",
            price: 20
        },
        Tropical: { 
            ingredients: { Mango: 2, Pineapple: 2, Banana: 1, Milk: 6, Ice: 1 }, 
            color: "#ffcc00",
            price: 22
        },
        GreenDetox: { 
            ingredients: { Spinach: 3, Banana: 2, Yogurt: 4, Ice: 1 }, 
            color: "#78c850",
            price: 25
        }
    }
};

// Emoji mapping for ingredients
const ingredientEmojis = {
    Strawberry: "🍓",
    Banana: "🍌",
    Mango: "🥭",
    Blueberries: "🫐",
    Pineapple: "🍍",
    Watermelon: "🍉",
    Milk: "🥛",
    Ice: "🧊",
    Spinach: "🥬",
    Yogurt: "🍶"
};

// Color mapping for ingredients
const ingredientColors = {
    Strawberry: '#ff4d94',
    Banana: '#ffe066',
    Mango: '#ffb84d',
    Blueberries: '#b366ff',
    Pineapple: '#ffe66d',
    Watermelon: '#ff6b9d',
    Milk: '#ffffff',
    Ice: '#88d3ce',
    Spinach: '#78c850',
    Yogurt: '#fffacd'
};

// Smoothie names for display
const smoothieNames = {
    Strawberry: "Strawberry Dream",
    Banana: "Banana Bliss", 
    Mango: "Mango Tango",
    MixedBerry: "Mixed Berry Blast",
    Tropical: "Tropical Paradise",
    GreenDetox: "Green Detox"
};

// DOM Elements
const screens = document.querySelectorAll('.screen');
const playerNameInput = document.getElementById('playerName');
const welcomeMsg = document.getElementById('welcomeMsg');
const levelDisplay = document.getElementById('levelDisplay');
const moneyDisplay = document.getElementById('money');
const reputationDisplay = document.getElementById('reputation');
const shopMoney = document.getElementById('shopMoney');
const orderDetails = document.getElementById('orderDetails');
const orderTimer = document.getElementById('orderTimer');
const recipeTitle = document.getElementById('recipeTitle');
const recipeList = document.getElementById('recipeList');
const ingredientsInBlender = document.getElementById('ingredientsInBlender');
const blenderLiquid = document.getElementById('blenderLiquid');
const cupFill = document.getElementById('cupFill');
const resultMsg = document.getElementById('resultMsg');
const levelResult = document.getElementById('levelResult');
const earningsDisplay = document.getElementById('earningsDisplay');
const currentCustomerAvatar = document.getElementById('currentCustomerAvatar');

// Track current ingredient counts for the order
let currentIngredientCounts = {};

// Screen Management
function showScreen(screenId) {
    screens.forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Event Listeners
document.getElementById('startBtn').addEventListener('click', () => {
    playerName = playerNameInput.value.trim() || "Player";
    if (playerName) {
        welcomeMsg.textContent = `Hello ${playerName}! Ready to make some delicious smoothies?`;
        showScreen('welcomeScreen');
    }
});

document.getElementById('continueBtn').addEventListener('click', () => {
    showScreen('selectionScreen');
    generateCustomerOrders();
    updateSelectionStats();
});

// Shop buttons
document.getElementById('shopBtn').addEventListener('click', () => {
    showScreen('shopScreen');
    shopMoney.textContent = money;
    setupShopDisplay();
});

document.getElementById('shopBtnResult').addEventListener('click', () => {
    showScreen('shopScreen');
    shopMoney.textContent = money;
    setupShopDisplay();
});

document.getElementById('backToGameBtn').addEventListener('click', () => {
    showScreen('gameScreen');
});

// Next order button
document.getElementById('nextSmoothieBtn').addEventListener('click', () => {
    showScreen('selectionScreen');
    generateCustomerOrders();
    updateSelectionStats();
});

// Customer message generator
function getCustomerMessage(smoothieType) {
    const messages = {
        Strawberry: ["I'm craving something sweet and red!", "Need a strawberry treat!", "Something berry delicious please!"],
        Banana: ["I want something creamy!", "Banana smoothie for energy!", "Make it extra thick with banana!"],
        Mango: ["Tropical vibes please!", "I need a mango getaway!", "Something exotic and sweet!"],
        MixedBerry: ["A berry mix would be perfect!", "Mixed berries are my favorite!", "Berry blast please!"],
        Tropical: ["Take me to the islands!", "I need a tropical vacation!", "Something with island flavors!"],
        GreenDetox: ["Need something healthy and green!", "Feeling detox today!", "Make it green and clean!"]
    };
    
    if (Array.isArray(messages[smoothieType])) {
        return messages[smoothieType][Math.floor(Math.random() * messages[smoothieType].length)];
    }
    return "I'd like a delicious smoothie!";
}

// Random customer data
function getRandomCustomer(smoothieType = null) {
    const customers = [
        { name: "Emma", avatar: "👩‍🎓" },
        { name: "Alex", avatar: "👨‍💼" },
        { name: "Sophia", avatar: "👩‍🍳" },
        { name: "Mike", avatar: "👨‍🔧" },
        { name: "Lily", avatar: "👩‍🎨" },
        { name: "David", avatar: "👨‍🚀" },
        { name: "Sarah", avatar: "👩‍💻" },
        { name: "Tom", avatar: "👨‍🏫" }
    ];
    
    const customer = customers[Math.floor(Math.random() * customers.length)];
    customer.message = smoothieType ? getCustomerMessage(smoothieType) : "I'd like a refreshing smoothie!";
    return customer;
}

// Generate customer orders for selection screen
function generateCustomerOrders() {
    const ordersGrid = document.getElementById('ordersGrid');
    ordersGrid.innerHTML = '';
    
    const availableSmoothies = getAllAvailableSmoothies();
    const orders = [];
    
    // Ensure we have different smoothie types
    const selectedSmoothies = [];
    while (selectedSmoothies.length < Math.min(3, availableSmoothies.length)) {
        const randomSmoothie = availableSmoothies[Math.floor(Math.random() * availableSmoothies.length)];
        if (!selectedSmoothies.includes(randomSmoothie)) {
            selectedSmoothies.push(randomSmoothie);
        } else if (availableSmoothies.length === 1) {
            // If only one smoothie type available, use it multiple times
            selectedSmoothies.push(randomSmoothie);
        }
    }
    
    // Create orders
    selectedSmoothies.forEach((smoothie, index) => {
        const recipe = getRecipe(smoothie);
        const customer = getRandomCustomer(smoothie);
        
        orders.push({
            smoothie: smoothie,
            recipe: recipe,
            customer: customer,
            reward: recipe.price + Math.floor(Math.random() * 8) + 2,
            difficulty: Object.keys(recipe.ingredients).length
        });
    });
    
    // Display orders
    orders.forEach((order, index) => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="customer-header">
                <div class="customer-avatar">${order.customer.avatar}</div>
                <div class="customer-info">
                    <h3>${order.customer.name}</h3>
                    <div class="difficulty-stars">${'⭐'.repeat(order.difficulty)}</div>
                </div>
            </div>
            <p class="customer-quote">"${order.customer.message}"</p>
            
            <div class="order-recipe">
                <h4>${smoothieNames[order.smoothie] || order.smoothie} Smoothie</h4>
                ${Object.entries(order.recipe.ingredients).map(([ing, qty]) => `
                    <div class="recipe-item">
                        <span class="recipe-emoji">${ingredientEmojis[ing]}</span>
                        <span class="recipe-ingredient">${ing}</span>
                        <span class="recipe-quantity">${qty}x</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-footer">
                <div class="order-reward">💰 $${order.reward}</div>
                <div class="order-timer-info">⏱️ ${orderTimeLimit}s</div>
            </div>
            <button class="accept-order-btn" data-order-index="${index}">Accept Order</button>
        `;
        
        ordersGrid.appendChild(orderCard);
    });
    
    // Add event listeners to accept buttons
    document.querySelectorAll('.accept-order-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderIndex = parseInt(e.target.dataset.orderIndex);
            acceptCustomerOrder(orders[orderIndex]);
        });
    });
}

// Get all available smoothies based on level
function getAllAvailableSmoothies() {
    const availableSmoothies = [];
    for (let lvl = 1; lvl <= level; lvl++) {
        if (recipes[lvl]) {
            availableSmoothies.push(...Object.keys(recipes[lvl]));
        }
    }
    return availableSmoothies;
}

// Accept a customer order
function acceptCustomerOrder(order) {
    currentOrder = order.smoothie;
    currentSmoothie = order.smoothie;
    currentCustomer = order.customer;
    currentReward = order.reward;
    
    showScreen('gameScreen');
    startOrder();
}

// Start the order
function startOrder() {
    // Reset everything
    addedIngredients = [];
    currentIngredientCounts = {};
    
    // Clear blender content
    const ingredientsInBlender = document.getElementById('ingredientsInBlender');
    const blenderLiquid = document.getElementById('blenderLiquid');
    const cupFill = document.getElementById('cupFill');
    
    if (ingredientsInBlender) ingredientsInBlender.innerHTML = '';
    if (blenderLiquid) {
        blenderLiquid.style.height = '0%';
        blenderLiquid.style.background = '#f8f9fa';
    }
    if (cupFill) cupFill.style.height = '0%';
    
    resultMsg.classList.add('hidden');
    
    // Update UI with customer info
    currentCustomerAvatar.textContent = currentCustomer.avatar;
    orderDetails.textContent = `${currentCustomer.name}: "${currentCustomer.message}"`;
    orderTimer.style.width = '100%';
    orderTimer.style.background = '#4ecdc4';
    
    // Show recipe with counts
    const recipe = getRecipe(currentSmoothie);
    recipeTitle.textContent = `${smoothieNames[currentSmoothie] || currentSmoothie} Smoothie Recipe`;
    recipeList.innerHTML = '';
    
    // Initialize ingredient counts
    for (const [ingredient, quantity] of Object.entries(recipe.ingredients)) {
        currentIngredientCounts[ingredient] = 0;
        
        const li = document.createElement('div');
        li.className = 'recipe-item';
        li.id = `recipe-${ingredient}`;
        li.innerHTML = `
            <span class="ingredient-emoji">${ingredientEmojis[ingredient]}</span>
            <span class="ingredient-name">${ingredient}</span>
            <span class="ingredient-count">
                <span class="count-display">0/${quantity}</span>
            </span>
        `;
        recipeList.appendChild(li);
    }
    
    // Start timer
    startOrderTimer();
    updateGameStats();
    updateInventoryDisplay();
    
    // Setup drag and drop - this will now properly reset listeners
    setupDragAndDrop();
}

// Get recipe for any smoothie
function getRecipe(smoothieName) {
    for (let lvl = 1; lvl <= 2; lvl++) {
        if (recipes[lvl] && recipes[lvl][smoothieName]) {
            return recipes[lvl][smoothieName];
        }
    }
    return recipes[1].Strawberry;
}

// FIXED: Completely reset drag and drop by recreating both ingredients and blender
function setupDragAndDrop() {
    // Remove all existing event listeners by completely recreating the ingredients panel
    const ingredientsPanel = document.querySelector('.ingredients-panel');
    
    // Save the original HTML for ingredients
    const originalIngredientsHTML = `
        <h3>Drag Ingredients to Blender</h3>
        <div class="ingredients-grid" id="ingredientsGrid">
            <div class="ingredient" draggable="true" data-name="Strawberry">
                <div class="ingredient-icon">🍓</div>
                <span>Strawberry</span>
            </div>
            <div class="ingredient" draggable="true" data-name="Banana">
                <div class="ingredient-icon">🍌</div>
                <span>Banana</span>
            </div>
            <div class="ingredient" draggable="true" data-name="Mango">
                <div class="ingredient-icon">🥭</div>
                <span>Mango</span>
            </div>
            <div class="ingredient" draggable="true" data-name="Blueberries">
                <div class="ingredient-icon">🫐</div>
                <span>Blueberries</span>
            </div>
            <div class="ingredient" draggable="true" data-name="Pineapple">
                <div class="ingredient-icon">🍍</div>
                <span>Pineapple</span>
            </div>
            <div class="ingredient" draggable="true" data-name="Watermelon">
                <div class="ingredient-icon">🍉</div>
                <span>Watermelon</span>
            </div>
            <div class="ingredient" draggable="true" data-name="Milk">
                <div class="ingredient-icon">🥛</div>
                <span>Milk</span>
            </div>
            <div class="ingredient" draggable="true" data-name="Ice">
                <div class="ingredient-icon">🧊</div>
                <span>Ice</span>
            </div>
            <div class="ingredient" draggable="true" data-name="Spinach">
                <div class="ingredient-icon">🥬</div>
                <span>Spinach</span>
            </div>
            <div class="ingredient" draggable="true" data-name="Yogurt">
                <div class="ingredient-icon">🍶</div>
                <span>Yogurt</span>
            </div>
        </div>
    `;
    
    ingredientsPanel.innerHTML = originalIngredientsHTML;
    
    // Also recreate the blender container to reset its event listeners
    const blenderContainer = document.querySelector('.blender-container');
    const originalBlenderHTML = `
        <div class="blender" id="blender">
            <div id="blenderContent" class="blender-content">
                <div class="blender-liquid" id="blenderLiquid"></div>
                <div id="ingredientsInBlender" class="ingredients-in-blender"></div>
            </div>
            <div class="blender-base"></div>
            <div class="blender-lid"></div>
        </div>
        <button id="blendBtn" class="blend-btn">BLEND! 🌀</button>
    `;
    
    blenderContainer.innerHTML = originalBlenderHTML;
    
    // Get fresh references
    const ingredients = document.querySelectorAll('.ingredient');
    const blender = document.getElementById('blender');
    const blendBtn = document.getElementById('blendBtn');
    
    // Reattach blend button event listener
    blendBtn.addEventListener('click', blendSmoothie);
    
    // Setup drag start for ingredients - FRESH listeners
    ingredients.forEach(ingredient => {
        ingredient.addEventListener('dragstart', (e) => {
            const ingredientName = ingredient.dataset.name;
            if (inventory[ingredientName] > 0) {
                e.dataTransfer.setData('text/plain', ingredientName);
                ingredient.classList.add('dragging');
            } else {
                e.preventDefault();
                showMessage(`No ${ingredientName} left! Buy more from the shop.`);
            }
        });
        
        ingredient.addEventListener('dragend', (e) => {
            ingredient.classList.remove('dragging');
        });
    });
    
    // Setup blender drop zone - FRESH listeners
    blender.addEventListener('dragover', (e) => {
        e.preventDefault();
        blender.classList.add('drop-zone');
    });
    
    blender.addEventListener('dragleave', (e) => {
        blender.classList.remove('drop-zone');
    });
    
    blender.addEventListener('drop', (e) => {
        e.preventDefault();
        blender.classList.remove('drop-zone');
        
        const ingredientName = e.dataTransfer.getData('text/plain');
        addIngredientToBlender(ingredientName);
    });
    
    // Update inventory display for the new ingredients
    updateInventoryDisplay();
}

// Helper function to show messages
function showMessage(message) {
    resultMsg.textContent = message;
    resultMsg.classList.remove('hidden');
    setTimeout(() => resultMsg.classList.add('hidden'), 2000);
}

// Add ingredient to blender (ONE at a time)
function addIngredientToBlender(ingredientName) {
    if (inventory[ingredientName] <= 0) {
        showMessage(`No ${ingredientName} left! Buy more from the shop.`);
        return;
    }
    
    // Use ONE ingredient from inventory
    inventory[ingredientName]--;
    addedIngredients.push(ingredientName);
    
    // Update the count for this ingredient
    const recipe = getRecipe(currentSmoothie);
    if (recipe.ingredients[ingredientName]) {
        currentIngredientCounts[ingredientName] = (currentIngredientCounts[ingredientName] || 0) + 1;
    }
    
    // Add visual ingredient to blender
    const ingredientsInBlender = document.getElementById('ingredientsInBlender');
    if (ingredientsInBlender) {
        const fruit = document.createElement('div');
        fruit.className = 'fruit-in-blender';
        fruit.textContent = ingredientEmojis[ingredientName];
        fruit.style.color = ingredientColors[ingredientName];
        ingredientsInBlender.appendChild(fruit);
    }
    
    // Update blender liquid color and level
    updateBlenderAppearance();
    
    // Update recipe display to show current counts
    updateRecipeCounts();
    updateInventoryDisplay();
}

// Update recipe to show current counts with visual feedback
function updateRecipeCounts() {
    const recipe = getRecipe(currentSmoothie);
    
    for (const [ingredient, required] of Object.entries(recipe.ingredients)) {
        const currentCount = currentIngredientCounts[ingredient] || 0;
        const recipeItem = document.getElementById(`recipe-${ingredient}`);
        if (!recipeItem) continue;
        
        const countElement = recipeItem.querySelector('.count-display');
        countElement.textContent = `${currentCount}/${required}`;
        
        // Update visual feedback
        if (currentCount >= required) {
            recipeItem.classList.add('ingredient-complete');
            countElement.innerHTML = `${currentCount}/${required} ✅`;
        } else {
            recipeItem.classList.remove('ingredient-complete');
        }
        
        // Change color based on progress
        if (currentCount > 0 && currentCount < required) {
            recipeItem.style.background = 'rgba(255, 243, 205, 0.5)';
            recipeItem.style.border = '2px solid #ffe066';
        } else if (currentCount >= required) {
            recipeItem.style.background = 'rgba(212, 237, 218, 0.7)';
            recipeItem.style.border = '2px solid #28a745';
        } else {
            recipeItem.style.background = '#f8f9fa';
            recipeItem.style.border = '2px solid transparent';
        }
    }
}

// Update inventory display
function updateInventoryDisplay() {
    const ingredients = document.querySelectorAll('.ingredient');
    const inventoryGrid = document.getElementById('inventoryGrid');
    
    // Update the main ingredient display
    ingredients.forEach(ingredient => {
        const ingredientName = ingredient.dataset.name;
        const count = inventory[ingredientName];
        
        if (count <= 0) {
            ingredient.style.opacity = '0.5';
            ingredient.style.cursor = 'not-allowed';
            ingredient.title = 'Out of stock - buy more!';
        } else {
            ingredient.style.opacity = '1';
            ingredient.style.cursor = 'grab';
            ingredient.title = `${count} in stock`;
        }
    });
    
    // Update the inventory grid display
    if (inventoryGrid) {
        inventoryGrid.innerHTML = '';
        
        const categories = {
            'Fruits': ['Strawberry', 'Banana', 'Mango', 'Blueberries', 'Pineapple', 'Watermelon'],
            'Bases': ['Milk', 'Yogurt'],
            'Extras': ['Ice', 'Spinach']
        };
        
        Object.entries(categories).forEach(([category, items]) => {
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'inventory-category';
            categoryHeader.textContent = category;
            categoryHeader.style.gridColumn = '1 / -1';
            categoryHeader.style.fontWeight = 'bold';
            categoryHeader.style.color = '#ff6b6b';
            categoryHeader.style.marginTop = '10px';
            inventoryGrid.appendChild(categoryHeader);
            
            items.forEach(ingredient => {
                if (inventory.hasOwnProperty(ingredient)) {
                    const inventoryItem = document.createElement('div');
                    inventoryItem.className = 'inventory-item';
                    inventoryItem.innerHTML = `
                        <div class="inventory-emoji">${ingredientEmojis[ingredient]}</div>
                        <div class="inventory-count">${inventory[ingredient]}</div>
                        <div class="inventory-name">${ingredient}</div>
                    `;
                    inventoryGrid.appendChild(inventoryItem);
                }
            });
        });
    }
}

// Update blender appearance based on ingredients
function updateBlenderAppearance() {
    const blenderLiquid = document.getElementById('blenderLiquid');
    if (!blenderLiquid) return;
    
    const totalIngredients = addedIngredients.length;
    const maxIngredients = 15;
    
    // Calculate liquid level
    const liquidLevel = Math.min((totalIngredients / maxIngredients) * 80, 80);
    blenderLiquid.style.height = `${liquidLevel}%`;
    
    // Calculate blended color based on ingredients
    if (totalIngredients > 0) {
        const colorCounts = {};
        addedIngredients.forEach(ingredient => {
            colorCounts[ingredient] = (colorCounts[ingredient] || 0) + 1;
        });
        
        // Calculate weighted average color
        let totalRed = 0, totalGreen = 0, totalBlue = 0, totalWeight = 0;
        
        Object.entries(colorCounts).forEach(([ingredient, count]) => {
            const color = ingredientColors[ingredient];
            const rgb = hexToRgb(color);
            if (rgb) {
                totalRed += rgb.r * count;
                totalGreen += rgb.g * count;
                totalBlue += rgb.b * count;
                totalWeight += count;
            }
        });
        
        if (totalWeight > 0) {
            const avgRed = Math.round(totalRed / totalWeight);
            const avgGreen = Math.round(totalGreen / totalWeight);
            const avgBlue = Math.round(totalBlue / totalWeight);
            const blendedColor = `rgb(${avgRed}, ${avgGreen}, ${avgBlue})`;
            
            blenderLiquid.style.background = `linear-gradient(to top, transparent 30%, ${blendedColor} 100%)`;
        }
    }
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Order timer
function startOrderTimer() {
    let timeLeft = orderTimeLimit;
    clearInterval(orderTimerInterval);
    
    orderTimerInterval = setInterval(() => {
        timeLeft--;
        const percentage = (timeLeft / orderTimeLimit) * 100;
        orderTimer.style.width = `${percentage}%`;
        
        // Change color based on time
        if (percentage < 30) {
            orderTimer.style.background = '#ff6b6b';
        } else if (percentage < 60) {
            orderTimer.style.background = '#ffe66d';
        }
        
        if (timeLeft <= 0) {
            clearInterval(orderTimerInterval);
            handleOrderFailed("Time's up! Customer left disappointed.");
        }
    }, 1000);
}

// Blend smoothie function
function blendSmoothie() {
    const recipe = getRecipe(currentSmoothie);
    let success = true;
    
    // Check if all ingredients meet requirements
    for (const [ingredient, required] of Object.entries(recipe.ingredients)) {
        const added = currentIngredientCounts[ingredient] || 0;
        if (added < required) {
            success = false;
            break;
        }
    }
    
    // Start blending animation
    const blenderElement = document.querySelector('.blender');
    blenderElement.classList.add('blending');
    clearInterval(orderTimerInterval);
    
    setTimeout(() => {
        blenderElement.classList.remove('blending');
        const ingredientsInBlender = document.getElementById('ingredientsInBlender');
        if (ingredientsInBlender) ingredientsInBlender.innerHTML = '';
        
        if (success && currentSmoothie === currentOrder) {
            handleOrderSuccess();
        } else if (success) {
            handleWrongSmoothie();
        } else {
            handleOrderFailed("Wrong ingredients! The smoothie doesn't taste right.");
        }
    }, 2000);
}

// Check if order was perfect (no extra ingredients)
function checkPerfectOrder() {
    const recipe = getRecipe(currentSmoothie);
    
    // Check if exactly matched (no extra ingredients)
    for (const [ingredient, count] of Object.entries(currentIngredientCounts)) {
        if (count !== recipe.ingredients[ingredient]) {
            return false;
        }
    }
    
    // Check if all required ingredients are present
    for (const [ingredient, count] of Object.entries(recipe.ingredients)) {
        if ((currentIngredientCounts[ingredient] || 0) !== count) {
            return false;
        }
    }
    
    return true;
}

// Order success
function handleOrderSuccess() {
    const recipe = getRecipe(currentSmoothie);
    const timeBonus = Math.floor((parseFloat(orderTimer.style.width) / 100) * 8);
    const perfectBonus = checkPerfectOrder() ? 5 : 0;
    const totalEarnings = currentReward + timeBonus + perfectBonus;
    
    money += totalEarnings;
    reputation += 1;
    
    // Fill cup with smoothie color
    const cupFill = document.getElementById('cupFill');
    if (cupFill) {
        cupFill.style.height = '100%';
        cupFill.style.background = `linear-gradient(to top, transparent 10%, ${recipe.color} 100%)`;
    }
    
    // Show enhanced success message
    let bonusText = '';
    if (timeBonus > 0) bonusText += ` +$${timeBonus} time bonus`;
    if (perfectBonus > 0) bonusText += ` +$${perfectBonus} perfect order`;
    
    resultMsg.innerHTML = `
        <div style="font-size: 1.3em; margin-bottom: 10px;">🎉 Perfect! 🎉</div>
        <div>${currentCustomer.name} loved your ${smoothieNames[currentSmoothie] || currentSmoothie} Smoothie!</div>
        <div style="font-weight: bold; margin-top: 8px;">You earned $${totalEarnings}${bonusText}</div>
    `;
    resultMsg.classList.remove('hidden');
    resultMsg.style.background = 'linear-gradient(135deg, #d4edda, #c3e6cb)';
    resultMsg.style.border = '2px solid #28a745';
    
    // Check level up
    if (reputation >= level * 5 && level < 2) {
        level++;
        levelDisplay.textContent = level;
        
        // Show level up message
        setTimeout(() => {
            const levelUpMsg = document.createElement('div');
            levelUpMsg.className = 'result-message';
            levelUpMsg.innerHTML = `
                <div style="font-size: 1.5em; color: #ff6b6b; margin-bottom: 10px;">🌟 Level Up! 🌟</div>
                <div>You've reached Level ${level}!</div>
                <div>New smoothies unlocked! 🎊</div>
            `;
            levelUpMsg.style.background = 'linear-gradient(135deg, #ffe66d, #ffd166)';
            levelUpMsg.style.border = '2px solid #ffd166';
            document.body.appendChild(levelUpMsg);
            
            setTimeout(() => {
                levelUpMsg.remove();
            }, 3000);
        }, 1000);
    }
    
    // Move to result screen
    setTimeout(() => {
        showScreen('resultScreen');
        levelResult.textContent = "🎊 Order Complete! 🎊";
        earningsDisplay.innerHTML = `
            <div style="font-size: 1.4em; color: #27ae60; margin-bottom: 10px;">+$${totalEarnings}</div>
            <div>💰 Base: $${currentReward}</div>
            ${timeBonus > 0 ? `<div>⚡ Time Bonus: +$${timeBonus}</div>` : ''}
            ${perfectBonus > 0 ? `<div>⭐ Perfect Order: +$${perfectBonus}</div>` : ''}
        `;
    }, 3000);
}

// Wrong smoothie
function handleWrongSmoothie() {
    const cupFill = document.getElementById('cupFill');
    if (cupFill) {
        cupFill.style.height = '100%';
        cupFill.style.background = 'linear-gradient(to top, transparent, #66666688)';
    }
    money += 5;
    resultMsg.textContent = "You made the wrong smoothie! Small tip: $5";
    resultMsg.classList.remove('hidden');
    
    setTimeout(() => {
        showScreen('resultScreen');
        levelResult.textContent = "Wrong Order";
        earningsDisplay.textContent = "You made a different smoothie!";
    }, 3000);
}

// Order failed
function handleOrderFailed(message) {
    reputation = Math.max(0, reputation - 1);
    resultMsg.textContent = message;
    resultMsg.classList.remove('hidden');
    
    setTimeout(() => {
        showScreen('resultScreen');
        levelResult.textContent = "Order Failed";
        earningsDisplay.textContent = "Better luck next time!";
    }, 3000);
}

// Shop functionality
function setupShopDisplay() {
    const shopItems = document.querySelectorAll('.shop-item');
    shopItems.forEach(item => {
        const ingredientName = item.dataset.name;
        const count = inventory[ingredientName];
        
        // Remove existing inventory count if any
        const existingCount = item.querySelector('.shop-inventory-count');
        if (existingCount) {
            existingCount.remove();
        }
        
        // Add inventory count badge
        const inventoryCount = document.createElement('div');
        inventoryCount.className = 'shop-inventory-count';
        inventoryCount.textContent = count;
        item.appendChild(inventoryCount);
        
        // Update item appearance based on inventory
        if (count <= 2) {
            item.style.borderColor = '#ff6b6b';
        }
    });
}

// Shop items - buy ONE ingredient at a time
document.querySelectorAll('.shop-item').forEach(item => {
    item.addEventListener('click', () => {
        const cost = parseInt(item.dataset.cost);
        const ingredientName = item.dataset.name;
        
        if (money >= cost) {
            money -= cost;
            inventory[ingredientName] += 1; // Buy ONE ingredient
            
            showMessage(`Bought 1 ${ingredientName}!`);
            
            updateGameStats();
            shopMoney.textContent = money;
            updateInventoryDisplay();
            setupShopDisplay();
        } else {
            showMessage('Not enough money! Complete more orders.');
        }
    });
});

// Update game stats
function updateGameStats() {
    moneyDisplay.textContent = money;
    reputationDisplay.textContent = reputation;
    levelDisplay.textContent = level;
}

function updateSelectionStats() {
    document.getElementById('selectionMoney').textContent = money;
    document.getElementById('selectionReputation').textContent = reputation;
}

// Initialize game
function initializeGame() {
    updateGameStats();
    updateInventoryDisplay();
    setupShopDisplay();
    
    // Add CSS for enhanced elements
    const style = document.createElement('style');
    style.textContent = `
        .customer-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }
        .customer-info h3 {
            margin: 0;
            color: #333;
        }
        .difficulty-stars {
            font-size: 0.9em;
            color: #ffd700;
        }
        .customer-quote {
            font-style: italic;
            color: #666;
            margin: 10px 0;
            text-align: center;
        }
        .order-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 15px 0 10px 0;
        }
        .inventory-category {
            border-bottom: 2px solid #ff6b6b;
            padding-bottom: 5px;
            margin-bottom: 8px;
        }
        .inventory-name {
            font-size: 0.7em;
            color: #666;
            text-align: center;
        }
        .shop-inventory-count {
            position: absolute;
            top: 8px;
            right: 8px;
            background: #4ecdc4;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8em;
            font-weight: bold;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .inventory-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            padding: 8px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 10px;
            text-align: center;
            transition: all 0.3s ease;
        }
        .inventory-item:hover {
            background: rgba(255, 255, 255, 1);
            transform: scale(1.05);
        }
        .recipe-item.ingredient-complete {
            background: rgba(212, 237, 218, 0.7) !important;
            border: 2px solid #28a745 !important;
            transform: scale(1.02);
        }
    `;
    document.head.appendChild(style);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.getElementById('shopScreen').classList.contains('active')) {
            showScreen('gameScreen');
        }
    }
    
    // Quick blend with spacebar (when in game screen)
    if (e.key === ' ' && document.getElementById('gameScreen').classList.contains('active')) {
        e.preventDefault();
        document.getElementById('blendBtn').click();
    }
});

// Initialize the game when page loads
window.addEventListener('load', initializeGame);

console.log('🥤 Smoothie Game Loaded! Ready to blend! 🎉');