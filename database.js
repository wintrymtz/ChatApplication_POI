const mysql = require("mysql2/promise");
const config = {
    host: "localhost",
    database: "BD_POI",
    user: "root",
    password: "Max232004",
    connectionLimit: 100,
}
const db = mysql.createPool(config);//pool

module.exports = db;
