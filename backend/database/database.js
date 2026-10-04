const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "lyvo.db");

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

console.log("SQLite database connected successfully ✅");

module.exports = db;