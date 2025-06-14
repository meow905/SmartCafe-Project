// const TelegramBot = require("node-telegram-bot-api");

// const token = "7679080253:AAHNA7a7cGGLOZX8WR4MX46AOso1csYwnBU"; // замените на реальный токен
// const bot = new TelegramBot(token);

// function notifyUser(userId, status) {
//   let statusText = "";
//   let options = {};
//   switch (status) {
//     case "accepted":
//       statusText = "✅ Ваш заказ принят.";
//       break;
//     case "cooking":
//       statusText = "👨‍🍳 Ваш заказ готовится.";
//       break;
//     case "ready":
//       statusText = "📦 Ваш заказ готов и ожидает на выдаче.";
//       break;
//     case "paid":
//       statusText = "💵 Спасибо! Заказ оплачен. Приятного аппетита!";
//       break;
//     default:
//       statusText = `ℹ️ Статус заказа: ${status}`;
//       options = {
//         reply_markup: {
//           keyboard: [["Оплачено"]],
//           resize_keyboard: true,
//         },
//       };
//   }

//   bot.sendMessage(userId, statusText, options).catch(console.error);
// }

// module.exports = notifyUser;

const TelegramBot = require("node-telegram-bot-api");
const token = "7679080253:AAHNA7a7cGGLOZX8WR4MX46AOso1csYwnBU";
const bot = new TelegramBot(token, { polling: false });

// function notifyUser(userId, status, order) {
//   let message = "";

//   switch (status) {
//     case "accepted":
//       message = `✅ Заказ #${order.id} принят в работу.`;
//       break;
//     case "ready":
//       message = `🍽 Заказ #${order.id} готов! Подойдите за ним.`;
//       bot.sendMessage(userId, message).then(() => {
//         bot.sendMessage(userId, "Выберите способ оплаты:", {
//           reply_markup: {
//             inline_keyboard: [
//               [
//                 {
//                   text: "Оплачено (наличные)",
//                   callback_data: `paid:${order.id}`,
//                 },
//               ],
//             ],
//           },
//         });
//       });
//       return;
//     case "paid":
//       const items = JSON.parse(order.items)
//         .map((i) => `${i.name} — ${i.price} Сомони`)
//         .join("\n");
//       const total = JSON.parse(order.items).reduce(
//         (sum, i) => sum + i.price,
//         0
//       );
//       message = `✅ Оплата принята\n\n${items}\n\nИтого: ${total} Сомони\n💰 ОПЛАЧЕНО`;
//       break;
//     default:
//       message = `Статус заказа #${order.id}: ${status}`;
//   }

//   bot.sendMessage(userId, message).catch(console.error);
// }

// module.exports = notifyUser;

function notifyUser(userId, status) {
  let statusText = "";
  let options = {};
  switch (status) {
    case "accepted":
      statusText = "✅ Ваш заказ принят.";
      break;
    case "cooking":
      statusText = "👨‍🍳 Ваш заказ готовится.";
      break;
    case "ready":
      statusText = "📦 Ваш заказ готов и ожидает на выдаче.";
      break;
    case "paid":
      statusText = "💵 Спасибо! Заказ оплачен. Приятного аппетита!";
      break;
    default:
      statusText = `ℹ️ Статус заказа: ${status}`;
      options = {
        reply_markup: {
          keyboard: [["Оплачено"]],
          resize_keyboard: true,
        },
      };
  }

  bot.sendMessage(userId, statusText, options).catch(console.error);
}

module.exports = notifyUser;
