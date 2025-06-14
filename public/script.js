async function fetchOrders() {
  const res = await fetch("/api/orders");
  const data = await res.json();
  renderOrders(data);
}

function renderOrders(orders) {
  const container = document.getElementById("ordersContainer");
  container.innerHTML = "";

  orders.forEach((order) => {
    const orderDiv = document.createElement("div");
    orderDiv.className = "col-md-6";

    const items = JSON.parse(order.items || "[]")
      .map((item) => `<li>${item.name} — ${item.price} Сомони</li>`)
      .join("");

    const statusColor = {
      pending: "secondary",
      accepted: "primary",
      cooking: "warning",
      ready: "success",
      paid: "dark",
    };

    const buttonMap = {
      pending: [{ status: "accepted", label: "Принят" }],
      accepted: [{ status: "cooking", label: "Готовится" }],
      cooking: [{ status: "ready", label: "На выдаче" }],
      ready: [
        { status: "paid", label: "Оплачено" },
        { status: "receipt", label: "Выдать чек" },
      ],
    };

    orderDiv.innerHTML = `
      <div class="card border-${statusColor[order.status] || "light"} shadow">
        <div class="card-header bg-${
          statusColor[order.status] || "light"
        } text-white">
          Заказ #${order.id} — Стол ${order.table_id}
        </div>
        <div class="card-body">
          <ul>${items}</ul>
          <p><strong>Статус:</strong> ${order.status}</p>
          <div class="d-flex flex-wrap gap-2">
            ${(buttonMap[order.status] || [])
              .map(
                (btn) =>
                  `<button class="btn btn-sm btn-outline-${
                    statusColor[btn.status] || "dark"
                  }" 
                          onclick="changeStatus(${order.id}, '${btn.status}')">
                    ${btn.label}
                  </button>`
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
    container.appendChild(orderDiv);
  });
}

async function changeStatus(orderId, newStatus) {
  const res = await fetch(`/api/orders/${orderId}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus }),
  });

  const result = await res.json();
  if (result.success) {
    fetchOrders();
  } else {
    alert("Ошибка при обновлении статуса");
  }
}

setInterval(fetchOrders, 5000); // автообновление каждые 5 сек
fetchOrders();
