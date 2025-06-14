const TelegramBot = require("node-telegram-bot-api");
const menu = require("./menu");
const ordersDB = require("./orders");
const db = require("./database");

const token = "7679080253:AAHNA7a7cGGLOZX8WR4MX46AOso1csYwnBU";
const bot = new TelegramBot(token, { polling: true });

console.log("Бот запущен и слушает Telegram...");

const userStates = {};

function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function showMainMenu(chatId) {
  bot.sendMessage(chatId, "Добро пожаловать! Выберите категорию:", {
    reply_markup: {
      keyboard: [...chunkArray(Object.keys(menu), 3)], //, ["/заказ"]
      resize_keyboard: true,
    },
  });
}

bot.onText(/\/start(?:\s+(\w+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;
  let tableId = match[1];

  if (!tableId) {
    db.getUserByTelegramId(telegramId, (err, user) => {
      if (user && user.table_id) {
        tableId = user.table_id;
        userStates[chatId] = { tableId, items: [] };
        showMainMenu(chatId);
      } else {
        bot.sendMessage(
          chatId,
          "Пожалуйста, отсканируйте QR-код или введите команду /start <номер_стола>"
        );
      }
    });
  } else {
    db.saveUser(
      {
        telegram_id: telegramId,
        username: msg.from.username,
        table_id: tableId,
      },
      () => {
        userStates[chatId] = { tableId, items: [] };
        showMainMenu(chatId);
      }
    );
  }
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!userStates[chatId]) return;

  if (menu[text]) {
    menu[text].forEach((item) => {
      bot.sendPhoto(chatId, item.photo, {
        caption: `${item.name}\n${item.composition}\nЦена: ${item.price} Сомони`,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `Выбрать ${item.name}`,
                callback_data: `add:${text}:${item.name}`,
              },
            ],
          ],
        },
      });
    });
  }
});

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const [action, category, name] = query.data.split(":");

  if (action === "add") {
    const item = menu[category].find((i) => i.name === name);
    if (!item) return;

    if (!userStates[chatId]) {
      userStates[chatId] = { tableId: null, items: [] };
    }

    userStates[chatId].items.push(item);

    bot.answerCallbackQuery({
      callback_query_id: query.id,
      text: `${item.name} добавлен в заказ`,
    });

    bot.sendMessage(chatId, `Вы добавили "${item.name}"`, {
      reply_markup: {
        keyboard: [["/заказ", "Меню"]],
        resize_keyboard: true,
      },
    });
  }
});

bot.onText(/Меню/, (msg) => {
  showMainMenu(msg.chat.id);
});

bot.onText(/\/заказ/, (msg) => {
  const chatId = msg.chat.id;
  const state = userStates[chatId];

  if (!state || !state.items.length) {
    return bot.sendMessage(chatId, "Вы ещё не выбрали блюда.");
  }

  const summary = state.items
    .map((i) => `${i.name} — ${i.price} Сомони`)
    .join("\n");
  const total = state.items.reduce((sum, i) => sum + i.price, 0);

  ordersDB.createOrder(
    {
      tableId: state.tableId,
      userId: chatId,
      items: state.items,
      status: "pending",
    },
    (err, order) => {
      if (err) {
        console.error("Ошибка создания заказа:", err);
        return bot.sendMessage(chatId, "❌ Ошибка при оформлении заказа.");
      }

      bot.sendMessage(
        chatId,
        `✅ Ваш заказ принят!\n\n${summary}\n\nИтого: ${total} Сомони`,
        {
          reply_markup: {
            // remove_keyboard: true,
            keyboard: [["Меню"]],
            resize_keyboard: true,
          },
        }
      );
      bot.sendMessage(chatId, "Ожидайте, мы уведомим вас о статусе заказа.");

      userStates[chatId].items = [];
    }
  );
});

// Оплата (наличными)
bot.onText(/Оплачено/, (msg) => {
  const chatId = msg.chat.id;

  ordersDB.markLatestOrderPaid(chatId, (err, order) => {
    if (err || !order) {
      return bot.sendMessage(
        chatId,
        "❌ Не удалось отметить заказ как оплаченный."
      );
    }

    const summary = order.items
      .map((i) => `${i.name} — ${i.price} Сомони`)
      .join("\n");
    const total = order.items.reduce((sum, i) => sum + i.price, 0);

    bot.sendMessage(
      chatId,
      `💵 Оплата получена!\n\n🧾 Ваш чек:\n\n${summary}\n\nИтого: ${total} Сомони`,
      {
        reply_markup: {
          remove_keyboard: true,
        },
      }
    );
  });
});
