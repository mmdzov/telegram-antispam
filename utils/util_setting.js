const bot = require("../config/requires");
const fs = require("fs");
const { Markup } = require("telegraf");
const { getUserAllGroups } = require("../dist/group.js");

let backToHome = Markup.keyboard([
  Markup.button.callback("بازگشت", "backToHome"),
])
  .oneTime()
  .resize();

const sureInlineKey = Markup.inlineKeyboard([
  [Markup.button.callback("فهمیدم", "acceptAndDelete")],
  // [
  //   Markup.button.callback(
  //     "فهمیدم و دیگر نمایش داده نشود",
  //     "acceptAndDeleteForEver"
  //   ),
  // ],
]);
async function viewUserFilter(ctx) {
  let groups = fs.readFileSync("data/groups.json", "utf8");
  groups = JSON.parse(groups);
  let groupIndex = -1;
  if (ctx.chat.type === "supergroup") {
    groupIndex = groups.findIndex((item) => item.chatId === ctx.chat.id);
  } else {
    //
  }
  const userHasAdmin = groups[groupIndex].admin.includes(ctx.message.from.id);
  if (!userHasAdmin) return;
  let data = await fs.readFileSync("data/filters.json", { encoding: "utf8" });
  data = JSON.parse(data);
  let index = await data.findIndex((item) => item?.userId === ctx.from.id);
  let d = data[index].list.join("   |   ");
  bot.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
  bot.telegram.sendMessage(
    ctx.chat.id,
    `
    کلمات فیلتر شده:

${d}

    `,
    {
      reply_markup: {
        inline_keyboard: sureInlineKey.reply_markup.inline_keyboard,
      },
    }
  );
}

async function addFilter(ctx, msg = "") {
  let groups = fs.readFileSync("data/groups.json", "utf8");
  groups = JSON.parse(groups);
  let groupIndex = -1;
  if (ctx.chat.type === "supergroup") {
    groupIndex = groups.findIndex((item) => item.chatId === ctx.chat.id);
  } else {
    //
  }
  const userHasAdmin = groups[groupIndex].admin.includes(ctx.message.from.id);
  if (!userHasAdmin) return;
  let data = await fs.readFileSync("data/filters.json", { encoding: "utf8" });
  data = JSON.parse(data);
  let index = await data.findIndex((item) => item?.userId === ctx.from.id);
  let message = msg
    ? msg
        .split(" ")
        .filter((item, i) => i !== 0)
        .join("")
    : ctx.update.message.text.match(/[^\/filter ].+/gi)?.join("");
  if (message && message.trim().length > 0) {
    if (index >= 0) {
      if (data[index].list.findIndex((item) => item === message) === -1) {
        data[index].list.push(message);
        await fs.writeFileSync("data/filters.json", JSON.stringify(data));
        bot.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
        bot.telegram.sendMessage(
          ctx.chat.id,
          `کلمه فیلتر ${msg
            .split(" ")
            .filter((item, i) => i !== 0)
            .join("")} افزوده شد.`,
          {
            reply_markup: {
              inline_keyboard: sureInlineKey.reply_markup.inline_keyboard,
            },
          }
        );
      } else {
        ctx.reply("کلمه فیلتر قبلا افزوده شده.");
      }
    } else {
      let list = [];
      list.push(message);
      data.push({ userId: ctx.from.id, list });
      fs.writeFileSync("data/filters.json", JSON.stringify(data));
      ctx.reply("کلمه فیلتر افزوده شد.");
    }
  } else {
    ctx.reply("قربان کلمه فیلتر معتبر نیست!");
  }
}

async function removeFilter(ctx, msg = "") {
  let groups = fs.readFileSync("data/groups.json", "utf8");
  groups = JSON.parse(groups);
  let groupIndex = -1;
  if (ctx.chat.type === "supergroup") {
    groupIndex = groups.findIndex((item) => item.chatId === ctx.chat.id);
  } else {
    //
  }
  const userHasAdmin = groups[groupIndex].admin.includes(ctx.message.from.id);
  if (!userHasAdmin) return;
  let data = await fs.readFileSync("data/filters.json", { encoding: "utf8" });
  data = JSON.parse(data);
  let index = await data.findIndex((item) => item?.userId === ctx.from.id);
  let message = msg
    ? msg
        .split(" ")
        .filter((item, i) => i !== 0)
        .join("")
    : ctx.update.message.text.match(/[^\/filter ].+/gi)?.join("");
  if (message && message.trim().length > 0) {
    if (index >= 0) {
      if (data[index].list.filter((item) => item === message).length > 0) {
        let filtered = data[index].list.filter((item) => item != message);
        data[index].list = filtered;
        await fs.writeFileSync("data/filters.json", JSON.stringify(data));
        bot.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
        bot.telegram.sendMessage(
          ctx.chat.id,
          `کلمه فیلتر ${msg
            .split(" ")
            .filter((item, i) => i !== 0)
            .join("")} حذف شد.`,
          {
            reply_markup: {
              inline_keyboard: sureInlineKey.reply_markup.inline_keyboard,
            },
          }
        );
      } else {
        ctx.reply("کلمه فیلتر در لیست موجود نیست.");
      }
    } else {
      ctx.reply("شما هنوز کلمه فیلتری ثبت نکردید");
    }
  } else {
    ctx.reply("قربان کلمه فیلتر معتبر نیست!");
  }
}

module.exports = {
  viewUserFilter,
  addFilter,
  removeFilter,
};
