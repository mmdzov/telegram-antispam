const fs = require("fs");

function commandFilter(bot) {
  bot.command("filter", async (ctx) => {
    let data = await fs.readFileSync("data/filters.json", { encoding: "utf8" });
    data = JSON.parse(data);
    let index = await data.findIndex((item) => item?.userId === ctx.from.id);
    const message = ctx.update.message.text.match(/[^\/filter ].+/gi)?.join("");
    if (message && message.trim().length > 0) {
      if (index >= 0) {
        if (data[index].list.findIndex((item) => item === message) === -1) {
          data[index].list.push(message);
          await fs.writeFileSync("data/filters.json", JSON.stringify(data));
          ctx.telegram.sendMessage(ctx.from.id, "کلمه فیلتر افزوده شد.");
        }
      } else {
        let list = [];
        list.push(message);
        data.push({ userId: ctx.from.id, list });
        fs.writeFileSync("data/filters.json", JSON.stringify(data));
        ctx.telegram.sendMessage(ctx.from.id, "کلمه فیلتر افزوده شد.");
      }
    } else {
      ctx.telegram.sendMessage(ctx.from.id, "قربان کلمه فیلتر معتبر نیست!");
    }
  });
  bot.command("unfilter", async (ctx) => {
    let data = await fs.readFileSync("data/filters.json", { encoding: "utf8" });
    data = JSON.parse(data);
    let index = await data.findIndex((item) => item?.userId === ctx.from.id);

    const message = ctx.update.message.text
      .match(/[^\/unfilter ].+/gi)
      ?.join("");
    if (message && message.trim().length > 0) {
      if (index >= 0) {
        if (data[index].list.filter((item) => item === message).length > 0) {
          let filtered = data[index].list.filter((item) => item != message);
          data[index].list = filtered;
          await fs.writeFileSync("data/filters.json", JSON.stringify(data));
          ctx.telegram.sendMessage(ctx.from.id, "کلمه فیلتر حذف شد.");
        }
      } else {
        ctx.telegram.sendMessage(
          ctx.from.id,
          "شما هنوز کلمه فیلتری ثبت نکردید"
        );
      }
    } else {
      ctx.telegram.sendMessage(ctx.from.id, "قربان کلمه فیلتر معتبر نیست!");
    }
  });
  
  bot.command("filters", async (ctx) => {
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
  });
}

module.exports = commandFilter;
