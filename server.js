const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const port = 3000; // Changed port from 5432 to 3000 to avoid conflict with PostgreSQL

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection
const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'adarsh@123',  // Replace with your PostgreSQL password
    database: 'postgres',
    port: 5432 // Default PostgreSQL port
});

pool.connect((error) => {
    if (error) {
        console.error('Error connecting to PostgreSQL Database:', error);
        process.exit(1);
    } else {
        console.log('Connected to PostgreSQL Database.');
    }
});

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Mohita.html'));
});

app.get('/customers', (req, res) => {
    pool.query('SELECT * FROM customers', (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Database query failed' });
        } else {
            res.json(results.rows);
        }
    });
});

app.get('/customer/:id', (req, res) => {
    const customerId = req.params.id;
    pool.query('SELECT * FROM customers WHERE id = $1', [customerId], (error, result) => {
        if (error) {
            res.status(500).json({ error: 'Database query failed' });
        } else {
            res.json(result.rows[0]);
        }
    });
});

app.post('/transfer', (req, res) => {
    const { fromId, toId, transferAmount } = req.body;

    pool.connect((error, client, done) => {
        if (error) {
            res.status(500).json({ error: 'Failed to connect to database' });
            return;
        }

        const rollback = (err) => {
            client.query('ROLLBACK', (rollbackErr) => {
                done();
                if (rollbackErr) {
                    res.status(500).json({ error: 'Error rolling back transaction' });
                } else {
                    res.status(400).json({ error: err });
                }
            });
        };

        client.query('BEGIN', (err) => {
            if (err) return rollback(err);

            client.query('SELECT balance FROM customers WHERE id = $1', [fromId], (err, results) => {
                if (err) return rollback(err);

                const senderCurrentBalance = results.rows[0].balance;
                if (senderCurrentBalance < transferAmount) {
                    return rollback('Insufficient funds.');
                }

                client.query('UPDATE customers SET balance = balance - $1 WHERE id = $2', [transferAmount, fromId], (err) => {
                    if (err) return rollback(err);

                    client.query('UPDATE customers SET balance = balance + $1 WHERE id = $2', [transferAmount, toId], (err) => {
                        if (err) return rollback(err);

                        client.query('INSERT INTO transfers (sender_id, receiver_id, amount) VALUES ($1, $2, $3)', [fromId, toId, transferAmount], (err) => {
                            if (err) return rollback(err);

                            client.query('COMMIT', (err) => {
                                if (err) return rollback(err);

                                done();
                                res.send('Transfer completed successfully.');
                            });
                        });
                    });
                });
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
