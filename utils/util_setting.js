const bot = require("../config/requires");
const fs = require("fs");
const { Markup } = require("telegraf");
const { getUserAllGroups } = require("../group/group");

let backToHome = Markup.keyboard([
  Markup.button.callback("بازگشت", "backToHome"),
])
  .oneTime()
  .resize();

async function viewUserFilter(ctx) {
  let data = await fs.readFileSync("data/filters.json", { encoding: "utf8" });
  data = JSON.parse(data);
  let index = await data.findIndex((item) => item?.userId === ctx.from.id);
  let d = data[index].list.join("   |   ");
  bot.telegram.sendMessage(
    ctx.from.id,
    `
    کلمات فیلتر شده:

${d}

    `
  );
}

async function addFilter(ctx) {
  let data = await fs.readFileSync("data/filters.json", { encoding: "utf8" });
  data = JSON.parse(data);
  let index = await data.findIndex((item) => item?.userId === ctx.from.id);
  const message = ctx.update.message.text.match(/[^\/filter ].+/gi)?.join("");
  if (message && message.trim().length > 0) {
    if (index >= 0) {
      if (data[index].list.findIndex((item) => item === message) === -1) {
        data[index].list.push(message);
        await fs.writeFileSync("data/filters.json", JSON.stringify(data));
        ctx.reply("کلمه فیلتر افزوده شد.");
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

async function removeFilter(ctx) {
  let data = await fs.readFileSync("data/filters.json", { encoding: "utf8" });
  data = JSON.parse(data);
  let index = await data.findIndex((item) => item?.userId === ctx.from.id);

  const message = ctx.update.message.text.match(/[^\/unfilter ].+/gi)?.join("");
  if (message && message.trim().length > 0) {
    if (index >= 0) {
      if (data[index].list.filter((item) => item === message).length > 0) {
        let filtered = data[index].list.filter((item) => item != message);
        data[index].list = filtered;
        await fs.writeFileSync("data/filters.json", JSON.stringify(data));
        ctx.reply("کلمه فیلتر حذف شد.");
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
