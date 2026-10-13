-- Run once on an existing database because the old seed hashes did not match the demo passwords.
USE icu_central_command;

UPDATE users SET password = '$2a$10$O/0NRmiT0VCFVQHNZAWCOOlglaU7LTqarf2qnfgyIYRx5w.MnXIM.' WHERE username = 'admin';
UPDATE users SET password = '$2a$10$W/8s6BwgomzUdy5PO/0Lx.gf/2WP5OdWrL2vaRiSQ.JOmUuz7I0HC' WHERE username IN ('doctor1', 'doctor2');
UPDATE users SET password = '$2a$10$BuLhar5LLZUOawo0hCHW6.ozrApoIrkk.5gZvUEE8mBqFno1xoV6m' WHERE username IN ('nurse1', 'nurse2');

SELECT username, role, LEFT(password, 7) AS hash_prefix FROM users;
