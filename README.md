# Examen Batiment - Node.js Project

## 📋 Project Overview
This is a Node.js web application for managing buildings, levels, players, and real-time communication using Socket.IO. The project uses Express.js, MongoDB with Mongoose, and Twig templating engine.

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)
- pnpm package manager

### Setup Steps
1. **Clone/Navigate to the project directory**
   ```bash
   cd /path/to/Examen-Batiment
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure MongoDB**
   - Ensure MongoDB is running on `localhost:27017`
   - Create a database called `myexam2023`
   - Create a user with credentials: `admin:password`
   - Or modify `config/dbconnection.json` with your MongoDB connection string

4. **Start the development server**
   ```bash
   pnpm start
   # or
   pnpm run dev
   ```

5. **Access the application**
   - Server runs on `http://localhost:3000`
   - Socket.IO will be available for real-time communication

## 🏗️ Project Structure

```
├── app.js                    # Main application file with Socket.IO setup
├── package.json             # Project dependencies and scripts
├── nodemon.json            # Nodemon configuration
├── config/
│   └── dbconnection.json   # MongoDB connection configuration
├── controller/             # Business logic controllers
│   ├── batimentcontroller.js
│   ├── chatcontroller.js
│   ├── classroomcontroller.js
│   └── joueurcontroller.js
├── model/                  # MongoDB/Mongoose models
│   ├── batiment.js
│   ├── chat.js
│   ├── classroom.js
│   ├── joueur.js
│   ├── niveau.js
│   └── partie.js
├── routes/                 # Express route definitions
│   ├── batiment.js
│   ├── classroom.js
│   └── joueur.js
├── views/                  # Twig template files
│   ├── batiment.twig
│   ├── chat.twig
│   └── partie.twig
└── middl/                  # Middleware (validation)
    └── validate.js
```

## 📝 How to Create New Components

### 1. Creating a New Model

**Step 1:** Create a new file in `/model/` directory
```javascript
// model/product.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: String,
  price: Number,
  description: String,
  category: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("product", ProductSchema);
```

### 2. Creating a New Controller

**Step 2:** Create a new file in `/controller/` directory
```javascript
// controller/productcontroller.js
const Product = require("../model/product");

// Add a new product
async function addProduct(req, res, next) {
  try {
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category
    });
    
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Get all products
async function getAllProducts(req, res, next) {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get product by ID
async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update product
async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Delete product
async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
```

### 3. Creating New Routes

**Step 3:** Create a new file in `/routes/` directory
```javascript
// routes/product.js
const express = require("express");
const router = express.Router();
const ProductController = require("../controller/productcontroller");

// POST /product/add - Create new product
router.post("/add", ProductController.addProduct);

// GET /product/getall - Get all products
router.get("/getall", ProductController.getAllProducts);

// GET /product/getbyid/:id - Get product by ID
router.get("/getbyid/:id", ProductController.getProductById);

// PUT /product/update/:id - Update product
router.put("/update/:id", ProductController.updateProduct);

// DELETE /product/delete/:id - Delete product
router.delete("/delete/:id", ProductController.deleteProduct);

// GET /product/view - Render product view
router.get("/view", (req, res, next) => {
  res.render("product");
});

module.exports = router;
```

**Step 4:** Register the route in `app.js`
```javascript
// Add this line with other route imports
const productrouter = require("./routes/product");

// Add this line with other route registrations
app.use("/product", productrouter);
```

### 4. Creating New Views

**Step 5:** Create a new file in `/views/` directory
```html
<!-- views/product.twig -->
<!DOCTYPE html>
<html>
<head>
    <title>Products</title>
    <script src="/socket.io/socket.io.js"></script>
</head>
<body>
    <h1>Product Management</h1>
    
    <form id="productForm">
        <input type="text" id="name" placeholder="Product Name" required>
        <input type="number" id="price" placeholder="Price" required>
        <textarea id="description" placeholder="Description"></textarea>
        <input type="text" id="category" placeholder="Category">
        <button type="submit">Add Product</button>
    </form>
    
    <div id="products"></div>
    
    <script>
        const socket = io();
        
        // Handle form submission
        document.getElementById('productForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const productData = {
                name: document.getElementById('name').value,
                price: document.getElementById('price').value,
                description: document.getElementById('description').value,
                category: document.getElementById('category').value
            };
            
            // Emit to socket
            socket.emit('addProduct', productData);
        });
        
        // Listen for product updates
        socket.on('productAdded', function(data) {
            console.log('New product added:', data);
            // Update UI here
        });
    </script>
</body>
</html>
```

## 🔌 Socket.IO Integration Guide

### Basic Socket.IO Concepts

**Key Differences:**
- `socket.emit()` = sends message to **ONE** specific client
- `io.emit()` = sends message to **ALL** connected clients (broadcast)
- `socket.on()` = listens for events from the client

### Adding Socket.IO to Your Controllers

**Example 1: Real-time Product Management**
```javascript
// In app.js - Add to the socket connection handler
io.on("connection", async (socket) => {
  console.log("user connected");
  
  // Listen for new product creation
  socket.on("addProduct", async (data) => {
    try {
      // Save to database (call your controller function)
      const product = await addProductSocket(data);
      
      // Broadcast to ALL clients that a new product was added
      io.emit("productAdded", product);
    } catch (error) {
      // Send error to the specific client only
      socket.emit("error", { message: error.message });
    }
  });
  
  // Listen for product updates
  socket.on("updateProduct", async (data) => {
    try {
      const updatedProduct = await updateProductSocket(data.id, data);
      
      // Broadcast update to ALL clients
      io.emit("productUpdated", updatedProduct);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });
  
  // Listen for product deletion
  socket.on("deleteProduct", async (productId) => {
    try {
      await deleteProductSocket(productId);
      
      // Notify ALL clients about deletion
      io.emit("productDeleted", { id: productId });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });
});
```

**Example 2: Real-time Chat System**
```javascript
// In app.js socket connection
socket.on("msg", (data) => {
  // Save message to database
  add(data.object);
  
  // Broadcast message to ALL connected clients
  io.emit("msg", data.name + ": " + data.object);
});

socket.on("typing", (data) => {
  // Broadcast typing indicator to ALL clients except sender
  socket.broadcast.emit("typing", data + " is typing");
});
```

### Frontend Socket.IO Implementation

**HTML Template with Socket.IO:**
```html
<!-- Include Socket.IO client library -->
<script src="/socket.io/socket.io.js"></script>

<script>
// Connect to Socket.IO server
const socket = io();

// Send data to server
function sendMessage() {
  const messageData = {
    name: "John",
    object: "Hello World!"
  };
  socket.emit("msg", messageData);
}

// Listen for incoming messages
socket.on("msg", function(data) {
  console.log("Received message:", data);
  // Update UI with new message
  document.getElementById('messages').innerHTML += '<div>' + data + '</div>';
});

// Listen for typing indicators
socket.on("typing", function(data) {
  document.getElementById('typing-indicator').textContent = data;
});

// Listen for errors
socket.on("error", function(data) {
  alert("Error: " + data.message);
});

// Handle connection events
socket.on("connect", function() {
  console.log("Connected to server");
});

socket.on("disconnect", function() {
  console.log("Disconnected from server");
});
</script>
```

### Socket Functions for Controllers

**Create helper functions in your controllers:**
```javascript
// controller/productcontroller.js

// Regular HTTP function
async function addProduct(req, res, next) {
  // Handle HTTP request...
}

// Socket.IO function (no res object)
async function addProductSocket(data) {
  try {
    const product = new Product({
      name: data.name,
      price: data.price,
      description: data.description,
      category: data.category
    });
    
    const savedProduct = await product.save();
    return savedProduct;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  addProduct,
  addProductSocket,
  // ... other functions
};
```

## 🔧 Common Socket.IO Patterns for Exam

### 1. Real-time Game Updates
```javascript
// Client sends game action
socket.emit("gameAction", {
  playerId: "123",
  action: "move",
  position: { x: 10, y: 20 }
});

// Server processes and broadcasts to all
socket.on("gameAction", (data) => {
  // Update game state
  updateGameState(data);
  
  // Broadcast to ALL players
  io.emit("gameUpdate", {
    playerId: data.playerId,
    newPosition: data.position
  });
});
```

### 2. Live Notifications
```javascript
// Server sends notification to specific user
socket.emit("notification", {
  type: "success",
  message: "Building constructed successfully!"
});

// Server broadcasts to all users
io.emit("notification", {
  type: "info",
  message: "New player joined the game!"
});
```

### 3. Room-based Communication
```javascript
// Join a specific room
socket.join("building_123");

// Send message to specific room only
io.to("building_123").emit("roomMessage", "Construction started!");
```

## 🎯 Quick Reference for Exam

### Essential Socket.IO Events in this Project:
- `"partie"` - Start new game
- `"construire"` - Build something
- `"aff"` - Display player info
- `"calcul"` - Calculate building totals
- `"msg"` - Chat messages
- `"typing"` - Typing indicators

### Database Connection:
```javascript
const mongoconnect = require("./config/dbconnection.json");
mongo.connect(mongoconnect.url)
```

### Route Pattern:
```javascript
router.post("/add", Controller.addFunction);
router.get("/getall", Controller.getAllFunction);
router.get("/getbyid/:id", Controller.getByIdFunction);
router.delete("/deletebyid/:id", Controller.deleteFunction);
```

### Model Pattern:
```javascript
const Schema = mongoose.Schema;
const ModelName = new Schema({
  field1: String,
  field2: Number,
  field3: Boolean,
  field4: { type: Date, default: Date.now }
});
module.exports = mongoose.model("modelname", ModelName);
```

Good luck with your exam! 🍀