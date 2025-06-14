const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const orders = require("./orders");

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Получить все заказы
app.get("/api/orders", (req, res) => {
  res.json(orders.getOrders());
});

// Обновить статус заказа
app.put("/api/orders/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  if (orders.updateOrderStatus(id, status)) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

// Создать новый заказ (можно вызывать из bot.js через fetch или axios)
app.post("/api/orders", (req, res) => {
  const order = orders.createOrder(req.body);
  res.json(order);
});

app.listen(port, () => {
  console.log(`Kitchen API running on http://localhost:${port}`);
});
