const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key-change-this-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// In-memory database for serverless deployment
let database = {
    admins: [
        {
            id: 1,
            username: 'admin',
            password: bcrypt.hashSync('admin123', 10),
            email: 'admin@example.com',
            created_at: new Date().toISOString()
        }
    ],
    products: [
        {
            id: 1,
            name: "Fresh Bananas",
            description: "Organic fresh bananas (1 bunch)",
            price: 2.99,
            category: "groceries",
            image_url: null,
            stock_quantity: 50,
            created_at: "2025-07-20T05:44:09.510Z",
            updated_at: "2025-07-20T05:44:09.510Z"
        },
        {
            id: 2,
            name: "Whole Milk",
            description: "Fresh whole milk (1 gallon)",
            price: 3.49,
            category: "groceries",
            image_url: null,
            stock_quantity: 30,
            created_at: "2025-07-20T05:44:09.510Z",
            updated_at: "2025-07-20T05:44:09.510Z"
        },
        {
            id: 3,
            name: "Cotton T-Shirt",
            description: "Comfortable cotton t-shirt",
            price: 19.99,
            category: "clothes",
            image_url: null,
            stock_quantity: 25,
            created_at: "2025-07-20T05:44:09.510Z",
            updated_at: "2025-07-20T05:44:09.510Z"
        },
        {
            id: 4,
            name: "Denim Jeans",
            description: "Classic blue denim jeans",
            price: 49.99,
            category: "clothes",
            image_url: null,
            stock_quantity: 15,
            created_at: "2025-07-20T05:44:09.510Z",
            updated_at: "2025-07-20T05:44:09.510Z"
        },
        {
            id: 5,
            name: "JavaScript Guide",
            description: "Complete guide to modern JavaScript",
            price: 29.99,
            category: "books",
            image_url: null,
            stock_quantity: 20,
            created_at: "2025-07-20T05:44:09.510Z",
            updated_at: "2025-07-20T05:44:09.510Z"
        },
        {
            id: 6,
            name: "Cooking Recipes",
            description: "100 delicious family recipes",
            price: 24.99,
            category: "books",
            image_url: null,
            stock_quantity: 12,
            created_at: "2025-07-20T05:44:09.510Z",
            updated_at: "2025-07-20T05:44:09.510Z"
        },
        {
            id: 7,
            name: "Brown Bread",
            description: "Healthy brown bread",
            price: 5,
            category: "groceries",
            image_url: "/uploads/1752990456746-Brown_bread.webp",
            stock_quantity: 50,
            created_at: "2025-07-20T05:47:36.752Z",
            updated_at: "2025-07-20T05:49:27.171Z"
        }
    ],
    customers: [],
    orders: [],
    orderItems: []
};

// Helper function to get next ID
function getNextId(table) {
    if (database[table].length === 0) return 1;
    return Math.max(...database[table].map(item => item.id)) + 1;
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Routes

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const admin = database.admins.find(a => a.username === username);
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { 
                id: admin.id, 
                username: admin.username,
                role: 'admin'
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all products
app.get('/api/products', (req, res) => {
    try {
        res.json(database.products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
    try {
        const product = database.products.find(p => p.id === parseInt(req.params.id));
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Add new product (admin only)
app.post('/api/products', authenticateToken, (req, res) => {
    try {
        const { name, description, price, category, stock_quantity } = req.body;
        
        const newProduct = {
            id: getNextId('products'),
            name,
            description,
            price: parseFloat(price),
            category,
            image_url: null,
            stock_quantity: parseInt(stock_quantity),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        database.products.push(newProduct);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product (admin only)
app.put('/api/products/:id', authenticateToken, (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const productIndex = database.products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const { name, description, price, category, stock_quantity } = req.body;
        
        database.products[productIndex] = {
            ...database.products[productIndex],
            name,
            description,
            price: parseFloat(price),
            category,
            stock_quantity: parseInt(stock_quantity),
            updated_at: new Date().toISOString()
        };

        res.json(database.products[productIndex]);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product (admin only)
app.delete('/api/products/:id', authenticateToken, (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const productIndex = database.products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }

        database.products.splice(productIndex, 1);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Create order
app.post('/api/orders', (req, res) => {
    try {
        const { customer_name, customer_email, customer_phone, items, total_amount } = req.body;
        
        const newOrder = {
            id: getNextId('orders'),
            customer_name,
            customer_email,
            customer_phone,
            total_amount: parseFloat(total_amount),
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        database.orders.push(newOrder);

        // Add order items
        items.forEach(item => {
            const orderItem = {
                id: getNextId('orderItems'),
                order_id: newOrder.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: parseFloat(item.price),
                created_at: new Date().toISOString()
            };
            database.orderItems.push(orderItem);
        });

        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Get all orders (admin only)
app.get('/api/admin/orders', authenticateToken, (req, res) => {
    try {
        const ordersWithItems = database.orders.map(order => {
            const items = database.orderItems.filter(item => item.order_id === order.id);
            const itemsWithProducts = items.map(item => {
                const product = database.products.find(p => p.id === item.product_id);
                return {
                    ...item,
                    product_name: product ? product.name : 'Unknown Product'
                };
            });
            
            return {
                ...order,
                items: itemsWithProducts
            };
        });

        res.json(ordersWithItems);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Submit contact form
app.post('/api/contact', (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        // In a real application, you would save this to a database or send an email
        console.log('Contact form submission:', { name, email, message });
        
        res.json({ message: 'Thank you for your message! We will get back to you soon.' });
    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).json({ error: 'Failed to submit contact form' });
    }
});

// Export for Vercel
module.exports = app;

// Start server (for local development)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Admin panel: http://localhost:${PORT}/admin`);
        console.log(`Default admin credentials: username: admin, password: admin123`);
    });
}

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key-change-this-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Database file paths
const dbFiles = {
    admins: 'data/admins.json',
    products: 'data/products.json',
    customers: 'data/customers.json',
    orders: 'data/orders.json',
    orderItems: 'data/order_items.json'
};

// Create data directory
if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
}

// Initialize database files
function initializeDatabase() {
    // Create admins file
    if (!fs.existsSync(dbFiles.admins)) {
        const defaultPassword = bcrypt.hashSync('admin123', 10);
        const admins = [{
            id: 1,
            username: 'admin',
            password: defaultPassword,
            email: 'admin@shopall.com',
            created_at: new Date().toISOString()
        }];
        fs.writeFileSync(dbFiles.admins, JSON.stringify(admins, null, 2));
    }

    // Create products file
    if (!fs.existsSync(dbFiles.products)) {
        const products = [
            { id: 1, name: 'Fresh Bananas', description: 'Organic fresh bananas (1 bunch)', price: 2.99, category: 'groceries', image_url: null, stock_quantity: 50, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: 2, name: 'Whole Milk', description: 'Fresh whole milk (1 gallon)', price: 3.49, category: 'groceries', image_url: null, stock_quantity: 30, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: 3, name: 'Cotton T-Shirt', description: 'Comfortable cotton t-shirt', price: 19.99, category: 'clothes', image_url: null, stock_quantity: 25, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: 4, name: 'Denim Jeans', description: 'Classic blue denim jeans', price: 49.99, category: 'clothes', image_url: null, stock_quantity: 15, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: 5, name: 'JavaScript Guide', description: 'Complete guide to modern JavaScript', price: 29.99, category: 'books', image_url: null, stock_quantity: 20, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: 6, name: 'Cooking Recipes', description: '100 delicious family recipes', price: 24.99, category: 'books', image_url: null, stock_quantity: 12, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];
        fs.writeFileSync(dbFiles.products, JSON.stringify(products, null, 2));
    }

    // Create other files if they don't exist
    [dbFiles.customers, dbFiles.orders, dbFiles.orderItems].forEach(file => {
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, JSON.stringify([], null, 2));
        }
    });
}

// Helper functions for database operations
function readDataFile(file) {
    try {
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function writeDataFile(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function getNextId(data) {
    if (data.length === 0) return 1;
    return Math.max(...data.map(item => item.id)) + 1;
}

// Initialize database
initializeDatabase();

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// ROUTES

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    try {
        const admins = readDataFile(dbFiles.admins);
        const admin = admins.find(a => a.username === username);

        if (!admin || !bcrypt.compareSync(password, admin.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, admin: { id: admin.id, username: admin.username, email: admin.email } });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Get all products (public)
app.get('/api/products', (req, res) => {
    try {
        const products = readDataFile(dbFiles.products);
        const category = req.query.category;
        
        let filteredProducts = products.filter(p => p.stock_quantity > 0);
        
        if (category) {
            filteredProducts = filteredProducts.filter(p => p.category === category);
        }

        res.json(filteredProducts);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    try {
        const products = readDataFile(dbFiles.products);
        const product = products.find(p => p.id === parseInt(req.params.id));
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin: Add product
app.post('/api/admin/products', authenticateToken, upload.single('image'), (req, res) => {
    const { name, description, price, category, stock_quantity } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const products = readDataFile(dbFiles.products);
        const newProduct = {
            id: getNextId(products),
            name,
            description,
            price: parseFloat(price),
            category,
            image_url,
            stock_quantity: parseInt(stock_quantity),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        products.push(newProduct);
        writeDataFile(dbFiles.products, products);
        
        res.json({ id: newProduct.id, message: 'Product added successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add product' });
    }
});

// Admin: Update product
app.put('/api/admin/products/:id', authenticateToken, upload.single('image'), (req, res) => {
    const { name, description, price, category, stock_quantity } = req.body;
    const productId = parseInt(req.params.id);

    try {
        const products = readDataFile(dbFiles.products);
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = products[productIndex];
        product.name = name;
        product.description = description;
        product.price = parseFloat(price);
        product.category = category;
        product.stock_quantity = parseInt(stock_quantity);
        product.updated_at = new Date().toISOString();

        if (req.file) {
            product.image_url = `/uploads/${req.file.filename}`;
        }

        writeDataFile(dbFiles.products, products);
        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Admin: Delete product
app.delete('/api/admin/products/:id', authenticateToken, (req, res) => {
    try {
        const products = readDataFile(dbFiles.products);
        const filteredProducts = products.filter(p => p.id !== parseInt(req.params.id));
        
        writeDataFile(dbFiles.products, filteredProducts);
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Create customer
app.post('/api/customers', (req, res) => {
    const { name, email, phone, address } = req.body;

    try {
        const customers = readDataFile(dbFiles.customers);
        
        // Check if email already exists
        if (customers.find(c => c.email === email)) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const newCustomer = {
            id: getNextId(customers),
            name,
            email,
            phone,
            address,
            created_at: new Date().toISOString()
        };

        customers.push(newCustomer);
        writeDataFile(dbFiles.customers, customers);
        
        res.json({ id: newCustomer.id, message: 'Customer created successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create customer' });
    }
});

// Create order
app.post('/api/orders', (req, res) => {
    const { customer_info, items, total_amount } = req.body;

    try {
        const customers = readDataFile(dbFiles.customers);
        const orders = readDataFile(dbFiles.orders);
        const orderItems = readDataFile(dbFiles.orderItems);

        // Find or create customer
        let customer = customers.find(c => c.email === customer_info.email);
        
        if (!customer) {
            customer = {
                id: getNextId(customers),
                name: customer_info.name,
                email: customer_info.email,
                phone: customer_info.phone,
                address: customer_info.address,
                created_at: new Date().toISOString()
            };
            customers.push(customer);
            writeDataFile(dbFiles.customers, customers);
        }

        // Create order
        const newOrder = {
            id: getNextId(orders),
            customer_id: customer.id,
            total_amount: parseFloat(total_amount),
            status: 'pending',
            order_date: new Date().toISOString()
        };

        orders.push(newOrder);
        writeDataFile(dbFiles.orders, orders);

        // Create order items
        items.forEach(item => {
            const orderItem = {
                id: getNextId(orderItems),
                order_id: newOrder.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price
            };
            orderItems.push(orderItem);
        });

        writeDataFile(dbFiles.orderItems, orderItems);
        
        res.json({ order_id: newOrder.id, message: 'Order created successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Admin: Get all orders
app.get('/api/admin/orders', authenticateToken, (req, res) => {
    try {
        const orders = readDataFile(dbFiles.orders);
        const customers = readDataFile(dbFiles.customers);

        const ordersWithCustomers = orders.map(order => {
            const customer = customers.find(c => c.id === order.customer_id);
            return {
                ...order,
                customer_name: customer ? customer.name : 'Unknown',
                customer_email: customer ? customer.email : 'Unknown',
                customer_phone: customer ? customer.phone : 'Unknown'
            };
        }).sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

        res.json(ordersWithCustomers);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin: Get order details
app.get('/api/admin/orders/:id', authenticateToken, (req, res) => {
    const orderId = parseInt(req.params.id);

    try {
        const orders = readDataFile(dbFiles.orders);
        const customers = readDataFile(dbFiles.customers);
        const orderItems = readDataFile(dbFiles.orderItems);
        const products = readDataFile(dbFiles.products);

        const order = orders.find(o => o.id === orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const customer = customers.find(c => c.id === order.customer_id);
        const items = orderItems
            .filter(oi => oi.order_id === orderId)
            .map(oi => {
                const product = products.find(p => p.id === oi.product_id);
                return {
                    ...oi,
                    product_name: product ? product.name : 'Unknown Product'
                };
            });

        const orderWithDetails = {
            ...order,
            customer_name: customer ? customer.name : 'Unknown',
            customer_email: customer ? customer.email : 'Unknown',
            customer_phone: customer ? customer.phone : 'Unknown',
            customer_address: customer ? customer.address : 'Unknown',
            items
        };

        res.json(orderWithDetails);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin: Update order status
app.put('/api/admin/orders/:id/status', authenticateToken, (req, res) => {
    const { status } = req.body;
    const orderId = parseInt(req.params.id);

    try {
        const orders = readDataFile(dbFiles.orders);
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        orders[orderIndex].status = status;
        writeDataFile(dbFiles.orders, orders);
        
        res.json({ message: 'Order status updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Admin: Get dashboard stats
app.get('/api/admin/dashboard', authenticateToken, (req, res) => {
    try {
        const products = readDataFile(dbFiles.products);
        const orders = readDataFile(dbFiles.orders);
        const customers = readDataFile(dbFiles.customers);

        const totalRevenue = orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, order) => sum + order.total_amount, 0);

        const stats = {
            total_products: products.length,
            total_orders: orders.length,
            total_customers: customers.length,
            total_revenue: totalRevenue
        };

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Serve admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve main website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Create uploads directory
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
    console.log(`Default admin credentials: username: admin, password: admin123`);
});

module.exports = app;
