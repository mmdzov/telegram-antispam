const { Telegraf, Markup } = require("telegraf");
const { joinGroup } = require("./group/group");
require("dotenv").config();
const bot = new Telegraf(process.env.TOKEN);
let fs = require("fs");
const inlineSetting = require("./inline/inline_setting");
const inlineMain = require("./inline/inline_main");
const inlinePanel = require("./inline/inline_panel");
const inlineGroup = require("./inline/inline_group");
const inlineAnalysis = require("./inline/inline_analysis");
const inlineAutomate = require("./inline/inline_automate");
const commandFilter = require("./commands/com_filter");

bot.start((ctx) => {
  if (ctx.chat.type === "supergroup") {
    ctx.getChatAdministrators().then((then) => {
      let botHasAdmin = then.filter((item) => item.user.username === ctx.me)[0];
      let userHasAdmin = then.filter(
        (item) => item.user.id === ctx.message.from.id
      )[0];
      if (!botHasAdmin) {
        ctx.reply(`
              سلام ${ctx.message.from.first_name} 👮🏻‍♂️

پلیس امنیت گروه آماده خدمت رسانی هست.

کافیه من رو ادمین کنی.

آماده اجرای دستوراتت هستم قربان👮🏻‍♂️
              `);
      } else {
        if (userHasAdmin) {
          ctx.getChatAdministrators().then((then) => {
            let admins = [];
            then.forEach((item) => {
              admins.push(item.user.id);
            });
            joinGroup(
              {
                chatId: ctx.chat.id,
                date: ctx.message.date,
                groupName: ctx.chat.title,
                admin: admins,
              },
              (msg) => {
                ctx.telegram.sendMessage(ctx.message.from.id, msg, inlineMain);
              }
            );
          });
        } else {
          ctx.telegram.deleteMessage(
            ctx.message.chat.id,
            ctx.message.message_id
          );
        }
      }
    });
  } else {
    ctx.reply(
      `
            سلام ${ctx.message.from.first_name} 👮🏻‍♂
        
        پلیس امنیت گروه آماده خدمت رسانی هست.
        
        کافیه من رو توی گروهی که میخوای امنیتش رو تامین کنی ادد کنی و بعد ادمینم کنی و بعد بهم اجازه بدی که امنیت گروه تا چه حد تامین بشه.
        
        آماده اجرای دستوراتت هستم قربان👮🏻‍♂
            `
    );
  }
});

bot.action(/.+/, (ctx) => {
  const key = ctx.match[0];
  if (key === "backToHome") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineMain.reply_markup.inline_keyboard,
    });
  } else if (key === "settings") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineSetting.inlineSetting.reply_markup.inline_keyboard,
    });
  } else if (key === "panel") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlinePanel(ctx.from.id).reply_markup.inline_keyboard,
    });
  } else if (key.includes("manageGroup")) {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup().groupKeys.reply_markup.inline_keyboard,
    });
  } else if (key === "bans") {
    ctx.editMessageReplyMarkup({
      inline_keyboard:
        inlineGroup().inlineGroupManageBans.reply_markup.inline_keyboard,
    });
  } else if (key === "group") {
    ctx.editMessageReplyMarkup({
      inline_keyboard:
        inlineGroup().inlineGroupManage.reply_markup.inline_keyboard,
    });
  } else if (key === "lockGroup") {
    ctx.editMessageReplyMarkup({
      inline_keyboard:
        inlineGroup().inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "analysis") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineAnalysis().reply_markup.inline_keyboard,
    });
  } else if (key === "automate") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineAutomate.inlineAutomate(ctx.from.id).reply_markup
        .inline_keyboard,
    });
  } else if (key.includes("inlineAutomate")) {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineAutomate.inlineAutomateList(ctx.from.id)
        .reply_markup.inline_keyboard,
    });
  }
  console.log(ctx);
  inlineSetting.inlineSettingAction(ctx);
});

commandFilter(bot);

bot.launch();
