const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres-service',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'demo_db',
  port: 5432,
  connectionTimeoutMillis: 2000,
});

// Liveness Probe Endpoint
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Readiness Probe Endpoint (Verifies DB Connectivity)
app.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).send('READY');
  } catch (err) {
    res.status(500).send('DATABASE_UNAVAILABLE');
  }
});

// Main Data Endpoint
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: 'Kubernetes App Connected to PostgreSQL Successfully!',
      db_time: result.rows[0].now,
      pod_name: process.env.HOSTNAME
    });
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Application listening on port ${port}`);
});