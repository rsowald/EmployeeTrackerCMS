// Enable access to .env variables
require('dotenv').config();

const mysql = require('mysql2/promise');

const getConnection = async () => {
    return mysql.createConnection({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
};

module.exports = getConnection;