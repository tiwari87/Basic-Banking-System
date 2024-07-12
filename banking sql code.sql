-- Create the database
CREATE DATABASE banking_system;

-- Connect to the banking_system database
\c banking_system;

-- Create the customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    balance NUMERIC(10, 2) NOT NULL
);

-- Create the transfers table
CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES customers(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES customers(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Insert dummy data into the customers table
INSERT INTO customers (name, email, balance) VALUES
('Alok', 'alok@example.com', 4500.00),
('Prince', 'prince@example.com', 80000.00),
('Mohit', 'mohit@example.com', 7800.00),
('Dev', 'dev@example.com', 100000.00),
('Aman', 'aman@example.com', 20500.00),
('Shlok', 'shlok@example.com', 76000.00),
('Raj', 'Raj@example.com', 43000.00),
('Humm', 'humm@example.com', 38500.00),
('Vickey', 'Vickey@example.com', 90500.00),
('Vikash', 'vikash@example.com', 45000.00);
