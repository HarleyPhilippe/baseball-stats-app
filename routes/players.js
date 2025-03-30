// routes/players.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Adjust the path if your db config is elsewhere

// GET /players - return all players
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM players ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching players:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
