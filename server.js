require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');  // ✅ Import multer
const csv = require('fast-csv');   // ✅ Import fast-csv
const fs = require('fs');          // ✅ Import file system module




const app = express();
const PORT = process.env.PORT || 3000;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,               // 💡 Required for Render
    rejectUnauthorized: false    // 💥 Allows self-signed certs
  }
});





// PostgreSQL Connection

app.use(cors({
  origin: [
    "https://baseball-stats-app-ii38-otm48f64q-harleyphilippes-projects.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));


app.use(express.json());

// Get all players from the database
app.get('/players', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM players ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get a specific player by ID
app.get('/players/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM players WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Player with ID ${id} not found.` });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Add a new player
app.post('/players', async (req, res) => {
    const { name, position } = req.body;

    if (!name || !position) {
        return res.status(400).json({ error: 'Name and position are required.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO players (name, position) VALUES ($1, $2) RETURNING *',
            [name, position]
        );
        res.status(201).json({ message: 'Player added successfully!', player: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Could not add player. Name might already exist.' });
    }
});

// Update a player's details
app.put('/players/:id', async (req, res) => {
    const { id } = req.params;
    const { name, position } = req.body;

    try {
        const result = await pool.query(
            'UPDATE players SET name = $1, position = $2 WHERE id = $3 RETURNING *',
            [name, position, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Player with ID ${id} not found.` });
        }

        res.json({ message: 'Player updated successfully.', player: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Delete a player
app.delete('/players/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM players WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Player with ID ${id} not found.` });
        }

        res.json({ message: 'Player deleted successfully.', player: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

//delete stats 
app.delete("/stats/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM stats WHERE id = $1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Stat not found" });
    }

    res.json({ message: "Stat deleted successfully" });
  } catch (error) {
    console.error("Error deleting stat:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});







//Get all games
app.get('/games', async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM games ORDER BY date DESC');
        res.json(result.rows);
    
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error'});
    }

});

//Add a new game
app.post('/games', async (req, res) => {
    const { date, opponent, location, result } = req.body;

    if (!date || !opponent) {
        return res.status(400).json({ error: 'Date and opponent are required.' });
    }

    try {
        const queryResult = await pool.query(
            'INSERT INTO games (date, opponent, location, result) VALUES ($1, $2, $3, $4) RETURNING *',
            [date, opponent, location || null, result || null]
        );
        res.status(201).json({ message: 'Game added successfully!', game: queryResult.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not add game.' });
    }
});








// Get all player stats
app.get('/stats', async (req, res) => {
    const { player_id, game_id, start_date, end_date, sort_by } = req.query;
    let query = `
        SELECT stats.id, players.name, games.date, games.opponent, stats.at_bats, stats.hits, stats.runs, stats.RBIs, stats.home_runs
        FROM stats
        JOIN players ON stats.player_id = players.id
        JOIN games ON stats.game_id = games.id
    `;
    let conditions = [];
    let values = [];

    if (player_id) {
        conditions.push(`stats.player_id = $${values.length + 1}`);
        values.push(player_id);
    }

    if (game_id) {
        conditions.push(`stats.game_id = $${values.length + 1}`);
        values.push(game_id);
    }

    if (start_date) {
        conditions.push(`games.date >= $${values.length + 1}`);
        values.push(start_date);
    }

    if (end_date) {
        conditions.push(`games.date <= $${values.length + 1}`);
        values.push(end_date);
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (sort_by === 'hits') {
        query += ' ORDER BY stats.hits DESC';
    } else if (sort_by === 'home_runs') {
        query += ' ORDER BY stats.home_runs DESC';
    } else {
        query += ' ORDER BY games.date DESC';
    }

    try {
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

  



//player career stats
app.get('/players/:id/stats', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            SELECT players.name,
                COUNT(stats.game_id) AS games_played,
                SUM(stats.hits) AS total_hits,
                SUM(stats.home_runs) AS total_home_runs,
                ROUND(AVG(stats.at_bats), 2) AS avg_at_bats,
                ROUND(CASE 
                    WHEN SUM(stats.at_bats) > 0 
                    THEN (SUM(stats.hits) * 1.0) / SUM(stats.at_bats) 
                    ELSE 0 
                END, 3) AS batting_average
            FROM players
            LEFT JOIN stats ON players.id = stats.player_id
            WHERE players.id = $1
            GROUP BY players.name;
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Player with ID ${id} not found.` });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});





//leaderboards stats
app.get("/stats/leaderboard", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
            p.name, 
            COUNT(s.game_id) AS games_played, 
            SUM(s.hits) AS total_hits, 
            SUM(s.home_runs) AS total_home_runs,
            SUM(s.runs) AS total_runs,
            SUM(s.at_bats) * 1.0 / COUNT(s.game_id) AS avg_at_bats,
            ROUND(SUM(s.hits) * 1.0 / NULLIF(SUM(s.at_bats), 0), 3) AS batting_average,
            -- Calculate OBP: (H + BB + HBP) / (AB + BB + HBP + SF)
            ROUND((SUM(s.hits) + SUM(s.walks) + SUM(s.hit_by_pitch)) * 1.0 / 
                  NULLIF((SUM(s.at_bats) + SUM(s.walks) + SUM(s.hit_by_pitch) + SUM(s.sacrifice_flies)), 0), 3) 
                  AS on_base_percentage
        FROM stats s
        JOIN players p ON s.player_id = p.id
        GROUP BY p.name
        ORDER BY on_base_percentage DESC;`
      );
  
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching leaderboard stats:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

  app.get("/stats/all_players/slugging", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT g.date, p.name AS player_name, 
               (SUM(s.hits) + SUM(2 * s.doubles) + SUM(3 * s.triples) + SUM(4 * s.home_runs))::FLOAT / NULLIF(SUM(s.at_bats), 0) AS slugging_percentage
        FROM stats s
        JOIN games g ON s.game_id = g.id
        JOIN players p ON s.player_id = p.id
        GROUP BY g.date, p.name
        ORDER BY g.date;
      `);
  
      // ✅ Ensure slugging_percentage is formatted as a number with 3 decimal places
      const formattedData = result.rows.map(row => ({
        date: row.date,
        player_name: row.player_name,
        slugging_percentage: parseFloat(row.slugging_percentage).toFixed(3) // Format to 3 decimals
      }));
  
      res.json(formattedData);
    } catch (error) {
      console.error("Error fetching slugging percentages:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  



// compare players
app.get('/stats/compare/:player1/:player2', async (req, res) => {
    const { player1, player2 } = req.params;

    try {
        const result = await pool.query(`
            SELECT players.id, players.name,
                COUNT(stats.game_id) AS games_played,
                SUM(stats.hits) AS total_hits, 
                SUM(stats.home_runs) AS total_home_runs,
                SUM(stats.runs) AS total_runs,
                ROUND(AVG(stats.at_bats), 2) AS avg_at_bats,
                ROUND(CASE 
                    WHEN SUM(stats.at_bats) > 0 
                    THEN (SUM(stats.hits) * 1.0) / SUM(stats.at_bats) 
                    ELSE 0 
                END, 3) AS batting_average
            FROM players
            LEFT JOIN stats ON players.id = stats.player_id
            WHERE players.id = $1 OR players.id = $2
            GROUP BY players.id, players.name;
        `, [player1, player2]);

        if (result.rows.length < 2) {
            return res.status(404).json({ error: "One or both players not found or have no stats recorded." });
        }

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

//game by game data 
app.get("/stats/player/:playerId/games", async (req, res) => {
    const playerId = req.params.playerId;
  
    try {
      const result = await pool.query(
        `SELECT g.date, p.name AS player_name, 
                (SUM(s.hits) * 1.0 / SUM(s.at_bats)) AS batting_average 
         FROM stats s
         JOIN games g ON s.game_id = g.id
         JOIN players p ON s.player_id = p.id
         WHERE s.player_id = $1
         GROUP BY g.date, p.name
         ORDER BY g.date;`,
        [playerId]
      );
  
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching player game stats:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  // get all players in one graph 
  app.get("/stats/all_players/games", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT g.date, p.name AS player_name, 
                (SUM(s.hits) * 1.0 / SUM(s.at_bats)) AS batting_average 
         FROM stats s
         JOIN games g ON s.game_id = g.id
         JOIN players p ON s.player_id = p.id
         GROUP BY g.date, p.name
         ORDER BY g.date;`
      );
  
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching all players' game stats:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

// getting obp 
  app.get("/stats/all_players/obp", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT g.date, p.name AS player_name, 
                (SUM(s.hits + s.walks + s.hit_by_pitch)::FLOAT / 
                NULLIF(SUM(s.at_bats + s.walks + s.hit_by_pitch + s.sacrifice_flies), 0)) 
                AS on_base_percentage
            FROM stats s
            JOIN games g ON s.game_id = g.id
            JOIN players p ON s.player_id = p.id
            GROUP BY g.date, p.name
            ORDER BY g.date;
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching OBP stats:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

  
// OPS (On-Base + Slugging) Trends per Game
app.get("/stats/all_players/ops", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT g.date, p.name AS player_name, 
                    (SUM(s.walks + s.hit_by_pitch) + SUM(s.hits) * 1.0) / NULLIF(SUM(s.at_bats + s.walks + s.hit_by_pitch + s.sacrifice_flies), 0) 
                    + (SUM(s.hits) + SUM(2 * s.doubles) + SUM(3 * s.triples) + SUM(4 * s.home_runs))::FLOAT / NULLIF(SUM(s.at_bats), 0) 
                    AS ops
             FROM stats s
             JOIN games g ON s.game_id = g.id
             JOIN players p ON s.player_id = p.id
             GROUP BY g.date, p.name
             ORDER BY g.date;`
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching OPS trends:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// getting players runs 
app.get("/stats/all_players/runs", async (req, res) => {
    try {
      const query = `
        SELECT g.date, p.name AS player_name, SUM(s.runs) AS total_runs
        FROM stats s
        JOIN games g ON s.game_id = g.id
        JOIN players p ON s.player_id = p.id
        GROUP BY g.date, p.name
        ORDER BY g.date;
      `;
  
      const { rows } = await pool.query(query);
      res.json(rows);
    } catch (error) {
      console.error("Error fetching runs scored trends:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
// getting rbis
  app.get("/stats/all_players/rbis", async (req, res) => {
    try {
      const query = `
        SELECT g.date, p.name AS player_name, SUM(s.rbis) AS total_rbis
        FROM stats s
        JOIN games g ON s.game_id = g.id
        JOIN players p ON s.player_id = p.id
        GROUP BY g.date, p.name
        ORDER BY g.date;
      `;
  
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching RBIs trends:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  //getting stolen bases 
  app.get("/stats/all_players/stolen_bases", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT g.date, p.name AS player_name, SUM(s.stolen_bases) AS total_stolen_bases
         FROM stats s
         JOIN games g ON s.game_id = g.id
         JOIN players p ON s.player_id = p.id
         GROUP BY g.date, p.name
         ORDER BY g.date;`
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching stolen bases trends:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  //getting strikeouts
  app.get("/stats/all_players/strikeouts", async (req, res) => {
    try {
      const query = `
        SELECT g.date, p.name AS player_name, SUM(s.strikeouts) AS total_strikeouts
        FROM stats s
        JOIN games g ON s.game_id = g.id
        JOIN players p ON s.player_id = p.id
        GROUP BY g.date, p.name
        ORDER BY g.date;
      `;
      const { rows } = await pool.query(query);
      res.json(rows);
    } catch (error) {
      console.error("Error fetching strikeout trends:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  //getting walks
  app.get("/stats/all_players/walks", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT g.date, p.name AS player_name, SUM(s.walks) AS total_walks
        FROM stats s
        JOIN games g ON s.game_id = g.id
        JOIN players p ON s.player_id = p.id
        GROUP BY g.date, p.name
        ORDER BY g.date;
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching walk trends:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // GET /stats/all_players/hbp
  app.get("/stats/all_players/hbp", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          g.date,
          p.name AS player_name,
          SUM(s.hit_by_pitch) AS hit_by_pitch
        FROM stats s
        JOIN players p ON s.player_id = p.id
        JOIN games g ON s.game_id = g.id
        GROUP BY g.date, p.name
        ORDER BY g.date;
      `);
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching HBP trends:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  //getting sacrifice flies
  app.get("/stats/all_players/sacrifice_flies", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          g.date, 
          p.name AS player_name,
          SUM(s.sacrifice_flies) AS sacrifice_flies
        FROM stats s
        JOIN players p ON s.player_id = p.id
        JOIN games g ON s.game_id = g.id
        GROUP BY g.date, p.name
        ORDER BY g.date;
      `);
  
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching sacrifice flies trends:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  // Update player stats for a specific stat entry
app.put('/stats/:id', async (req, res) => {
  const { id } = req.params;
  const {
      player_id, game_id, at_bats, hits, runs, RBIs, home_runs, walks,
      strikeouts, doubles, triples, hit_by_pitch, sacrifice_flies, stolen_bases
  } = req.body;

  if (!player_id || !game_id) {
      return res.status(400).json({ error: 'Player ID and Game ID are required.' });
  }

  if (
      at_bats < 0 || hits < 0 || runs < 0 || RBIs < 0 || home_runs < 0 ||
      walks < 0 || strikeouts < 0 || doubles < 0 || triples < 0 ||
      hit_by_pitch < 0 || sacrifice_flies < 0 || stolen_bases < 0
  ) {
      return res.status(400).json({ error: 'Stat values cannot be negative.' });
  }

  try {
      const result = await pool.query(
          `UPDATE stats 
           SET player_id = $1, game_id = $2, at_bats = $3, hits = $4, runs = $5,
               RBIs = $6, home_runs = $7, walks = $8, strikeouts = $9, doubles = $10,
               triples = $11, hit_by_pitch = $12, sacrifice_flies = $13, stolen_bases = $14
           WHERE id = $15 RETURNING *`,
          [
              player_id, game_id, at_bats, hits, runs, RBIs, home_runs,
              walks, strikeouts, doubles, triples, hit_by_pitch, sacrifice_flies,
              stolen_bases, id
          ]
      );

      if (result.rows.length === 0) {
          return res.status(404).json({ error: `Stat entry with ID ${id} not found.` });
      }

      res.json({ message: 'Stat entry updated successfully.', stat: result.rows[0] });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error while updating stat.' });
  }
});

  
  
  







// Add player stats for a game
// Add complete player stats for a game
app.post('/stats', async (req, res) => {
    const {
      player_id,
      game_id,
      at_bats = 0,
      hits = 0,
      runs = 0,
      RBIs = 0,
      home_runs = 0,
      walks = 0,
      strikeouts = 0,
      doubles = 0,
      triples = 0,
      hit_by_pitch = 0,
      sacrifice_flies = 0,
      stolen_bases = 0
    } = req.body;
  
    // Required fields check
    if (!player_id || !game_id) {
      return res.status(400).json({ error: 'Player ID and Game ID are required.' });
    }
  
    // Numeric fields validation
    const statFields = {
      at_bats, hits, runs, RBIs, home_runs,
      walks, strikeouts, doubles, triples,
      hit_by_pitch, sacrifice_flies, stolen_bases
    };
  
    for (const [field, value] of Object.entries(statFields)) {
      if (value < 0) {
        return res.status(400).json({ error: `${field} cannot be negative.` });
      }
    }
  
    if (hits > at_bats) {
      return res.status(400).json({ error: 'Hits cannot be greater than at-bats.' });
    }
  
    try {
      const playerCheck = await pool.query('SELECT id FROM players WHERE id = $1', [player_id]);
      const gameCheck = await pool.query('SELECT id FROM games WHERE id = $1', [game_id]);
  
      if (playerCheck.rows.length === 0) {
        return res.status(400).json({ error: `Player with ID ${player_id} does not exist.` });
      }
  
      if (gameCheck.rows.length === 0) {
        return res.status(400).json({ error: `Game with ID ${game_id} does not exist.` });
      }
  
      const result = await pool.query(
        `INSERT INTO stats (
          player_id, game_id, at_bats, hits, runs, RBIs, home_runs,
          walks, strikeouts, doubles, triples,
          hit_by_pitch, sacrifice_flies, stolen_bases
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        RETURNING *`,
        [
          player_id, game_id, at_bats, hits, runs, RBIs, home_runs,
          walks, strikeouts, doubles, triples,
          hit_by_pitch, sacrifice_flies, stolen_bases
        ]
      );
  
      res.status(201).json({
        message: 'Player stats recorded successfully!',
        stats: result.rows[0]
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not add player stats.' });
    }
  });
  
  


//uploading roster from csv
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname);
        }
    })
});


app.post('/upload-roster', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Please upload a CSV file.' });
    }

    const filePath = req.file.path;
    const players = [];

    try {
        const stream = fs.createReadStream(filePath)
            .pipe(csv.parse({ headers: true }))
            .on('error', (err) => {
                console.error('CSV Parsing Error:', err);
                return; // Do NOT send response inside the event
            })
            
            .on('data', (row) => {
                console.log('Processing row:', row); // ✅ Debugging log
                if (row.name && row.position) {
                    players.push([row.name, row.position]);
                }
            })
            
            .on('end', async () => {
                if (players.length === 0) {
                    return res.status(400).json({ error: 'CSV file is empty or formatted incorrectly.' });
                }

                try {
                    for (const player of players) {
                        await pool.query(
                            'INSERT INTO players (name, position) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                            player
                        );
                    }
                    fs.unlinkSync(filePath); // ✅ Delete file after processing
                    return res.json({ message: 'Roster uploaded successfully!', playersAdded: players.length });
                } catch (dbErr) {
                    console.error('Database Insert Error:', dbErr);
                    return res.status(500).json({ error: 'Could not process CSV file.' });
                }
            });

        stream.on('error', (err) => {
            console.error('File Read Error:', err);
            return res.status(500).json({ error: 'Error reading CSV file.' });
        });

    } catch (err) {
        console.error('Unexpected Server Error:', err);
        return res.status(500).json({ error: 'Unexpected server error occurred.' });
    }
});

// upload stats backend csv 
app.post('/upload-stats', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a CSV file.' });
  }

  const filePath = req.file.path;
  const stats = [];

  try {
    const stream = fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: true }))
      .on('data', (row) => {
        stats.push(row);
      })
      .on('end', async () => {
        try {
          for (const stat of stats) {
            const {
              player_id, game_id, at_bats, hits, runs, RBIs, home_runs,
              walks, strikeouts, doubles, triples, hit_by_pitch, sacrifice_flies, stolen_bases
            } = stat;

            await pool.query(
              `INSERT INTO stats (
                player_id, game_id, at_bats, hits, runs, RBIs, home_runs,
                walks, strikeouts, doubles, triples, hit_by_pitch, sacrifice_flies, stolen_bases
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
              [
                player_id, game_id, at_bats, hits, runs, RBIs, home_runs,
                walks, strikeouts, doubles, triples, hit_by_pitch, sacrifice_flies, stolen_bases
              ]
            );
          }

          fs.unlinkSync(filePath); // Clean up
          res.json({ message: 'Stats uploaded successfully!', total: stats.length });
        } catch (err) {
          console.error('Insert error:', err);
          res.status(500).json({ error: 'Error saving stats to database.' });
        }
      });
  } catch (err) {
    console.error('Unexpected server error:', err);
    res.status(500).json({ error: 'Unexpected server error occurred.' });
  }
});













app.get('/', (req, res) => {
    res.send('Welcome to the Baseball Stats API!');
});

app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()'); // Gets the current timestamp from DB
        res.json({ message: "Database connection successful!", timestamp: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database connection failed." });
    }
});

console.log("DATABASE_URL:", process.env.DATABASE_URL);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
