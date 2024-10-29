const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');  // PostgreSQL client

const app = express();  // Initialize the app FIRST
const PORT = 5000;  // Backend will run on port 5000

// PostgreSQL connection pool
const pool = new Pool({
  user: 'postgres',            // Your PostgreSQL username
  host: 'localhost',
  database: 'postgres',        // Name of the database you created
  password: 'Sandra',    // Your PostgreSQL password
  port: 5433,                   // PostgreSQL port (make sure it's correct)
});

// Define CORS options (Optional: use for restricted access)
const corsOptions = {
  origin: ['http://localhost:3000', 'https://your-vercel-app.vercel.app'], // Allowed origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

// Apply middleware AFTER initializing `app`
app.use(cors(corsOptions));  // Enable CORS
app.use(express.json());  // Parse JSON request bodies

// GET all products
app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).send('Server Error');
  }
});

// POST a new product
app.post('/products', async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;
    const result = await pool.query(
      'INSERT INTO products (name, description, price, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, price, quantity]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding product:', error.message);
    res.status(500).send('Server Error');
  }
});

// PUT (edit) a product by ID
app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, quantity } = req.body;
    const result = await pool.query(
      'UPDATE products SET name = $1, description = $2, price = $3, quantity = $4 WHERE id = $5 RETURNING *',
      [name, description, price, quantity, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error editing product:', error.message);
    res.status(500).send('Server Error');
  }
});

// DELETE a product by ID
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).send('Server Error');
  }
});

// Start the server AFTER everything is set up
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
