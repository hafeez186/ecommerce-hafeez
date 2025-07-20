// Product Data - Now loaded from database
let products = {
    groceries: [],
    clothes: [],
    books: []
};

// Default icons for categories
const categoryIcons = {
    groceries: {
        'Fresh Bananas': '�',
        'Whole Milk': '🥛',
        'Brown Bread': '🍞',
        'Fresh Tomatoes': '🍅',
        'Free Range Eggs': '🥚',
        'Chicken Breast': '🍗',
        'Greek Yogurt': '🥛',
        'Olive Oil': '🫒',
        'default': '�'
    },
    clothes: {
        'Cotton T-Shirt': '👕',
        'Denim Jeans': '👖',
        'Summer Dress': '👗',
        'Sneakers': '�',
        'Hoodie': '🧥',
        'Formal Shirt': '👔',
        'Leather Jacket': '🧥',
        'Sports Shorts': '🩳',
        'default': '�'
    },
    books: {
        'JavaScript Guide': '📚',
        'Cooking Recipes': '📖',
        'Mystery Novel': '📕',
        'Science Encyclopedia': '📘',
        'Art History': '�',
        'Self-Help Guide': '📗',
        'Children\'s Stories': '📚',
        'Biography Collection': '📖',
        'default': '�'
    }
};

// Load products from database
async function loadProductsFromDatabase() {
    try {
        const response = await fetch('/api/products');
        const allProducts = await response.json();
        
        // Organize products by category
        products = {
            groceries: [],
            clothes: [],
            books: []
        };
        
        allProducts.forEach(product => {
            if (products[product.category]) {
                // Add icon if not present
                if (!product.icon) {
                    product.icon = categoryIcons[product.category][product.name] || 
                                  categoryIcons[product.category]['default'];
                }
                products[product.category].push(product);
            }
        });
        
        return true;
    } catch (error) {
        console.error('Failed to load products:', error);
        return false;
    }
}

// Shopping Cart
let cart = [];

// Initialize the website
document.addEventListener('DOMContentLoaded', async function() {
    // Load products from database
    const productsLoaded = await loadProductsFromDatabase();
    
    if (productsLoaded) {
        loadProducts();
    } else {
        // Fallback to show loading error
        document.querySelectorAll('.products-grid').forEach(grid => {
            grid.innerHTML = '<p style="text-align: center; color: #e74c3c; grid-column: 1/-1;">Failed to load products. Please check your internet connection.</p>';
        });
    }
    
    setupEventListeners();
    updateCartDisplay();
});

// Load products into their respective sections
function loadProducts() {
    loadCategoryProducts('groceries', 'groceriesGrid');
    loadCategoryProducts('clothes', 'clothesGrid');
    loadCategoryProducts('books', 'booksGrid');
}

function loadCategoryProducts(category, gridId) {
    const grid = document.getElementById(gridId);
    const categoryProducts = products[category];
    
    grid.innerHTML = '';
    
    categoryProducts.forEach(product => {
        const productCard = createProductCard(product);
        grid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <div class="product-image">
            <span style="font-size: 4rem;">${product.icon}</span>
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                Add to Cart
            </button>
        </div>
    `;
    
    return card;
}

// Cart Functions
function addToCart(productId) {
    // Find product in all categories
    let product = null;
    for (let category in products) {
        product = products[category].find(p => p.id === productId);
        if (product) break;
    }
    
    if (!product) return;
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    showAddedToCartMessage(product.name);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)} each</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="quantity-btn" onclick="removeFromCart(${item.id})" style="background: #e74c3c; margin-left: 10px;">×</button>
                </div>
            </div>
        `).join('');
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.toggle('open');
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Get customer information
    const customerName = prompt('Please enter your full name:');
    if (!customerName) return;
    
    const customerEmail = prompt('Please enter your email address:');
    if (!customerEmail) return;
    
    const customerPhone = prompt('Please enter your phone number:');
    if (!customerPhone) return;
    
    const customerAddress = prompt('Please enter your delivery address:');
    if (!customerAddress) return;
    
    // Prepare order data
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderData = {
        customer_info: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: customerAddress
        },
        items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
        })),
        total_amount: total
    };
    
    // Submit order to backend
    submitOrder(orderData);
}

async function submitOrder(orderData) {
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            const itemsList = cart.map(item => `${item.name} (${item.quantity}x)`).join('\n');
            const message = `Thank you for your order!\n\nOrder ID: #${result.order_id}\n\nItems:\n${itemsList}\n\nTotal: $${orderData.total_amount.toFixed(2)}\n\nYour order will be processed shortly.\nYou will receive a confirmation email at ${orderData.customer_info.email}`;
            
            alert(message);
            
            // Clear cart
            cart = [];
            updateCartDisplay();
            toggleCart();
        } else {
            alert('Error placing order: ' + result.error);
        }
    } catch (error) {
        console.error('Order submission failed:', error);
        alert('Failed to place order. Please try again or contact support.');
    }
}

// Utility Functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function showAddedToCartMessage(productName) {
    // Create a temporary message
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1002;
        opacity: 0;
        transition: opacity 0.3s;
    `;
    message.textContent = `${productName} added to cart!`;
    
    document.body.appendChild(message);
    
    // Animate in
    setTimeout(() => {
        message.style.opacity = '1';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        message.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(message);
        }, 300);
    }, 3000);
}

// Search Functionality
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        searchProducts(searchTerm);
    });
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        });
    }
    
    // Contact form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        });
    }
    
    // Close cart when clicking outside
    document.addEventListener('click', function(e) {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartIcon = document.querySelector('.cart-icon');
        
        if (!cartSidebar.contains(e.target) && !cartIcon.contains(e.target) && cartSidebar.classList.contains('open')) {
            toggleCart();
        }
    });
}

function searchProducts(searchTerm) {
    if (!searchTerm) {
        loadProducts();
        return;
    }
    
    // Search in all categories
    for (let category in products) {
        const grid = document.getElementById(category + 'Grid');
        const filteredProducts = products[category].filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
        
        grid.innerHTML = '';
        
        if (filteredProducts.length > 0) {
            filteredProducts.forEach(product => {
                const productCard = createProductCard(product);
                grid.appendChild(productCard);
            });
        } else {
            grid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">No products found in this category.</p>';
        }
    }
}

// Refresh products (for admin updates)
async function refreshProducts() {
    await loadProductsFromDatabase();
    loadProducts();
}

// Smooth navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add loading effect to buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const button = e.target;
            const originalText = button.textContent;
            
            button.innerHTML = '<span class="loading"></span> Adding...';
            button.disabled = true;
            
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 1000);
        }
    });
    
    // Add scroll effect to header
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
});
