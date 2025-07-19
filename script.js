// Product Data
const products = {
    groceries: [
        {
            id: 1,
            name: "Fresh Bananas",
            price: 2.99,
            description: "Organic fresh bananas (1 bunch)",
            icon: "🍌"
        },
        {
            id: 2,
            name: "Whole Milk",
            price: 3.49,
            description: "Fresh whole milk (1 gallon)",
            icon: "🥛"
        },
        {
            id: 3,
            name: "Brown Bread",
            price: 2.29,
            description: "Whole grain brown bread loaf",
            icon: "🍞"
        },
        {
            id: 4,
            name: "Fresh Tomatoes",
            price: 4.99,
            description: "Organic red tomatoes (2 lbs)",
            icon: "🍅"
        },
        {
            id: 5,
            name: "Free Range Eggs",
            price: 5.99,
            description: "Farm fresh eggs (12 count)",
            icon: "🥚"
        },
        {
            id: 6,
            name: "Chicken Breast",
            price: 8.99,
            description: "Fresh chicken breast (2 lbs)",
            icon: "🍗"
        },
        {
            id: 7,
            name: "Greek Yogurt",
            price: 4.49,
            description: "Plain Greek yogurt (32 oz)",
            icon: "🥛"
        },
        {
            id: 8,
            name: "Olive Oil",
            price: 12.99,
            description: "Extra virgin olive oil (500ml)",
            icon: "🫒"
        }
    ],
    clothes: [
        {
            id: 101,
            name: "Cotton T-Shirt",
            price: 19.99,
            description: "Comfortable cotton t-shirt (Multiple colors)",
            icon: "👕"
        },
        {
            id: 102,
            name: "Denim Jeans",
            price: 49.99,
            description: "Classic blue denim jeans (All sizes)",
            icon: "👖"
        },
        {
            id: 103,
            name: "Summer Dress",
            price: 39.99,
            description: "Flowy summer dress (Various patterns)",
            icon: "👗"
        },
        {
            id: 104,
            name: "Sneakers",
            price: 79.99,
            description: "Comfortable running sneakers",
            icon: "👟"
        },
        {
            id: 105,
            name: "Hoodie",
            price: 34.99,
            description: "Warm fleece hoodie (Unisex)",
            icon: "🧥"
        },
        {
            id: 106,
            name: "Formal Shirt",
            price: 29.99,
            description: "Professional formal shirt",
            icon: "👔"
        },
        {
            id: 107,
            name: "Leather Jacket",
            price: 129.99,
            description: "Premium leather jacket",
            icon: "🧥"
        },
        {
            id: 108,
            name: "Sports Shorts",
            price: 24.99,
            description: "Athletic shorts for sports",
            icon: "🩳"
        }
    ],
    books: [
        {
            id: 201,
            name: "JavaScript Guide",
            price: 29.99,
            description: "Complete guide to modern JavaScript",
            icon: "📚"
        },
        {
            id: 202,
            name: "Cooking Recipes",
            price: 24.99,
            description: "100 delicious family recipes",
            icon: "📖"
        },
        {
            id: 203,
            name: "Mystery Novel",
            price: 16.99,
            description: "Thrilling mystery adventure",
            icon: "📕"
        },
        {
            id: 204,
            name: "Science Encyclopedia",
            price: 39.99,
            description: "Complete science reference book",
            icon: "📘"
        },
        {
            id: 205,
            name: "Art History",
            price: 34.99,
            description: "Journey through art history",
            icon: "📙"
        },
        {
            id: 206,
            name: "Self-Help Guide",
            price: 22.99,
            description: "Personal development and growth",
            icon: "📗"
        },
        {
            id: 207,
            name: "Children's Stories",
            price: 18.99,
            description: "Collection of bedtime stories",
            icon: "📚"
        },
        {
            id: 208,
            name: "Biography Collection",
            price: 27.99,
            description: "Famous personalities biographies",
            icon: "📖"
        }
    ]
};

// Shopping Cart
let cart = [];

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
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
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsList = cart.map(item => `${item.name} (${item.quantity}x)`).join('\n');
    
    const message = `Thank you for your order!\n\nItems:\n${itemsList}\n\nTotal: $${total.toFixed(2)}\n\nYour order will be processed shortly.`;
    alert(message);
    
    // Clear cart
    cart = [];
    updateCartDisplay();
    toggleCart();
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
