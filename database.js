const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "cafe.db"));

// Создание таблиц, если ещё не созданы
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id INTEGER UNIQUE,
      username TEXT,
      table_id TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      table_id TEXT,
      items TEXT,
      status TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// 🔹 Сохранить или обновить пользователя
function saveUser({ telegram_id, username, table_id }, callback = () => {}) {
  db.run(
    `
    INSERT INTO users (telegram_id, username, table_id)
    VALUES (?, ?, ?)
    ON CONFLICT(telegram_id)
    DO UPDATE SET username = excluded.username, table_id = excluded.table_id
  `,
    [telegram_id, username, table_id],
    callback
  );
}

// 🔹 Получить пользователя по Telegram ID
function getUserByTelegramId(telegram_id, callback) {
  db.get(`SELECT * FROM users WHERE telegram_id = ?`, [telegram_id], callback);
}

// 🔹 Создать заказ
function createOrder({ userId, tableId, items, status }, callback) {
  db.run(
    `
    INSERT INTO orders (user_id, table_id, items, status)
    VALUES (?, ?, ?, ?)
  `,
    [userId, tableId, JSON.stringify(items), status],
    function (err) {
      callback(err, { id: this?.lastID });
    }
  );
}

// 🔹 Получить историю заказов пользователя
function getOrdersByUser(userId, callback) {
  db.all(
    `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
    [userId],
    callback
  );
}

module.exports = {
  db,
  saveUser,
  getUserByTelegramId,
  createOrder,
  getOrdersByUser,
};
