// const { db } = require("./database");

// module.exports = {
//   createOrder(order, callback) {
//     const { tableId, userId, items, status = "pending" } = order;
//     const itemsStr = JSON.stringify(items);

//     db.run(
//       `INSERT INTO orders (table_id, user_id, items, status) VALUES (?, ?, ?, ?)`,
//       [tableId, userId, itemsStr, status],
//       function (err) {
//         if (err) return callback(err);
//         callback(null, { id: this.lastID, tableId, userId, items, status });
//       }
//     );
//   },

//   getOrders(callback) {
//     db.all(`SELECT * FROM orders ORDER BY created_at DESC`, [], (err, rows) => {
//       if (err) return callback(err);
//       const parsed = rows.map((row) => ({
//         ...row,
//         items: JSON.parse(row.items),
//       }));
//       callback(null, parsed);
//     });
//   },

//   updateOrderStatus(id, status, callback) {
//     db.run(
//       `UPDATE orders SET status = ? WHERE id = ?`,
//       [status, id],
//       function (err) {
//         if (err) return callback(err);
//         callback(null, this.changes > 0);
//       }
//     );
//   },

//   markLatestOrderPaid(userId, callback) {
//     db.get(
//       `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
//       [userId],
//       (err, row) => {
//         if (err || !row) return callback(err || new Error("Not found"));
//         db.run(
//           `UPDATE orders SET status = 'paid' WHERE id = ?`,
//           [row.id],
//           function (err) {
//             if (err) return callback(err);
//             callback(null, { ...row, items: JSON.parse(row.items) });
//           }
//         );
//       }
//     );
//   },
// };

const { db } = require("./database");

module.exports = {
  createOrder(order, callback) {
    const { tableId, userId, items, status = "pending" } = order;
    const itemsStr = JSON.stringify(items);

    db.run(
      `INSERT INTO orders (table_id, user_id, items, status) VALUES (?, ?, ?, ?)`,
      [tableId, userId, itemsStr, status],
      function (err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, tableId, userId, items, status });
      }
    );
  },

  getOrders(callback) {
    db.all(`SELECT * FROM orders ORDER BY created_at DESC`, [], (err, rows) => {
      if (err) return callback(err);
      const parsed = rows.map((row) => ({
        ...row,
        items: JSON.parse(row.items),
      }));
      callback(null, parsed);
    });
  },

  getOrderById(id, callback) {
    db.get(`SELECT * FROM orders WHERE id = ?`, [id], (err, row) => {
      if (err) return callback(err);
      if (!row) return callback(null, null);
      row.items = JSON.parse(row.items);
      callback(null, row);
    });
  },

  updateOrderStatus(id, status, callback) {
    db.run(
      `UPDATE orders SET status = ? WHERE id = ?`,
      [status, id],
      function (err) {
        if (err) return callback(err);
        callback(null, this.changes > 0);
      }
    );
  },
};
