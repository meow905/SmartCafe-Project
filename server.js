const express = require("express");
const path = require("path");
const orders = require("./orders");
const notifyUser = require("./notifier");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/api/orders", (req, res) => {
  orders.getOrders((err, data) => {
    if (err) return res.status(500).json({ error: "Ошибка получения заказов" });
    res.json(data);
  });
});

app.post("/api/orders/:id/status", (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  orders.updateOrderStatus(orderId, status, (err, updated) => {
    if (err || !updated) {
      return res.status(500).json({ error: "Ошибка обновления статуса" });
    }

    orders.getOrderById(orderId, (err, order) => {
      if (order) {
        notifyUser(order.user_id, status, order);
      }
    });

    res.json({ success: true });
  });
});

app.listen(3000, () => {
  console.log("Сервер запущен на http://localhost:3000");
});
