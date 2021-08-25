const { Telegraf } = require("telegraf");
const {
  joinGroup,
  getAndModifyGroupLocks,
  limitSendMessageGroup,
  setWelcomeMsg,
  changeGroupName,
  changeGroupBio,
  getUserAllGroups,
  filterGroupMessage,
  deleteMessageFromGroup,
  getGroupWelcomeMessage,
  aboutUser,
} = require("./dist/group.js");
require("dotenv").config();
const bot = new Telegraf(process.env.TOKEN);
let fs = require("fs");
const inlineSetting = require("./inline/inline_setting");
const inlineMain = require("./inline/inline_main");
const panel = require("./inline/inline_panel");
const g = require("./inline/inline_group");
const inlineAnalysis = require("./inline/inline_analysis");
const inlineAutomate = require("./inline/inline_automate");
const commandFilter = require("./commands/com_filter");
const {
  addFilter,
  removeFilter,
  viewUserFilter,
} = require("./utils/util_setting");
const {
  banUserFromReply,
  unbanUserFromReply,
  handleBanUserWithKey,
  viewBanUsers,
  viewBanUsersAll,
  handleBan,
  clearBanList,
  clearBanListAll,
  banallGroupFromReply,
} = require("./dist/ban.js");
const { removeSession } = require("./utils/util_session.js");
const { addMessageLog, hasLastMsgId } = require("./utils/message.log.js");

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
                admin: [ctx.from.id],
                banlist: [],
                locks: {
                  full: false,
                  auto: { hasEnabled: false, now: null, expire: null },
                  filter: true,
                  message: false,
                  voice: false,
                  photo: false,
                  video: false,
                  gif: false,
                  sticker: false,
                  file: false,
                  limitSend: 10,
                  addUser: false,
                },
                rules: {
                  verify: false,
                  joinMessage: false,
                },
                welcomeMsg: "",
              },

              (msg) => {
                ctx.telegram
                  .sendMessage(ctx.message.from.id, msg, inlineMain)
                  .then((item) => {
                    // console.log(item.message_id)
                    addMessageLog(ctx, item.message_id);
                  });
              }
            );
          });
        }
      }
    });
    ctx.telegram.deleteMessage(ctx.message.chat.id, ctx.message.message_id);
  } else {
    const hasGroupExist = getUserAllGroups(ctx.from.id);
    if (hasGroupExist.length > 0) {
      ctx.telegram
        .sendMessage(ctx.message.from.id, "دستور بده قربان", inlineMain)
        .then((item) => {
          addMessageLog(ctx, item.message_id);
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
  }
});

bot.action(/.+/, (ctx, next) => {
  const key = ctx.match[0];
  if (key.includes("acceptAndDelete")) {
    ctx.getChatAdministrators().then((admin) => {
      if (admin.some((item) => item.user.id === ctx.from.id)) {
        ctx.telegram.deleteMessage(
          ctx.chat.id,
          ctx.update.callback_query.message.message_id
        );
      }
    });
    return next();
  }
  let lastMsgId = hasLastMsgId(
    ctx,
    ctx.update.callback_query.message.message_id
  );

  //!check message logs
  if (!lastMsgId) return;
  let group = getAndModifyGroupLocks(ctx);
  const locks = group?.locks;
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
      inline_keyboard: panel.inlinePanel(ctx.from.id).reply_markup
        .inline_keyboard,
    });
  } else if (key.includes("manageGroup")) {
    ctx.editMessageReplyMarkup({
      inline_keyboard:
        g.inlineGroup(ctx).groupKeys.reply_markup.inline_keyboard,
    });
  } else if (key === "bans") {
    ctx.editMessageReplyMarkup({
      inline_keyboard:
        g.inlineGroup(ctx).inlineGroupManageBans.reply_markup.inline_keyboard,
    });
  } else if (key === "group") {
    ctx.editMessageReplyMarkup({
      inline_keyboard:
        g.inlineGroup(ctx).inlineGroupManage.reply_markup.inline_keyboard,
    });
  } else if (key === "lockGroup") {
    ctx.editMessageReplyMarkup({
      inline_keyboard:
        g.inlineGroup(ctx).inlineGroupLocks.reply_markup.inline_keyboard,
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
  inlineSetting.inlineSettingAction(ctx);
  panel.inlinePanelAction(ctx);
  g.inlineGroupAction(ctx);
  return next();
});

bot.hears("مسدود", (ctx, next) => {
  banUserFromReply(ctx);
  return next();
});
bot.hears("مسدود همه", (ctx, next) => {
  banallGroupFromReply(ctx);
  return next();
});
bot.hears("حذف مسدود", (ctx, next) => {
  unbanUserFromReply(ctx);
  return next();
});
bot.hears("حذف مسدود همه", (ctx, next) => {
  unbanUserFromReply(ctx);
  return next();
});
bot.hears("لیست مسدود", (ctx, next) => {
  viewBanUsers(ctx);
  return next();
});
bot.hears("لیست مسدود همه", (ctx, next) => {
  viewBanUsersAll(ctx);
  return next();
});
bot.hears("درباره", (ctx, next) => {
  aboutUser(ctx, "درباره");
  return next();
});
bot.hears("من", (ctx, next) => {
  aboutUser(ctx, "من");
  return next();
});
bot.hears("پاکسازی مسدود همه", (ctx, next) => {
  clearBanListAll(ctx);
  return next();
});
bot.hears("پاکسازی مسدود", (ctx, next) => {
  clearBanList(ctx);
  return next();
});

bot.on("message", (ctx, next) => {
  // console.log(ctx);

  fs.readFile("data/sessions.json", "utf8", (err, data) => {
    data = JSON.parse(data);
    const index = data.findIndex((item) => item.body.from === ctx.from.id);
    if (index >= 0) {
      if (data[index].payload === "addFilter") {
        addFilter(ctx);
      }
      if (data[index].payload === "unFilter") {
        removeFilter(ctx);
      }
      if (data[index].payload === "banUser") {
        handleBanUserWithKey(ctx, "");
      }
      if (data[index].payload === "unbanUser") {
        handleBanUserWithKey(ctx, "حذف");
      }
      if (data[index].payload === "banallUser") {
        handleBanUserWithKey(ctx, "", "banallUser");
      }
      if (data[index].payload === "unbanallUser") {
        handleBanUserWithKey(ctx, "", "unbanallUser");
      }
      if (data[index].payload === "limitSend") {
        limitSendMessageGroup(ctx);
        removeSession("from", ctx.from.id, "limitSend");
      }
      if (data[index].payload === "setWelcomeMsg") {
        setWelcomeMsg(ctx);
        removeSession("from", ctx.from.id, "setWelcomeMsg");
      }
      if (data[index].payload === "groupChangeName") {
        changeGroupName(ctx);
        removeSession("from", ctx.from.id, "groupChangeName");
      }
      if (data[index].payload === "groupChangeBio") {
        changeGroupBio(ctx);
        removeSession("from", ctx.from.id, "groupChangeBio");
      }
    }
  });
  return next();
});
bot.on("message", (ctx) => {
  if (ctx.message?.left_chat_member) {
    ctx.deleteMessage(ctx.message.message_id);
  } else if (ctx.message?.new_chat_member) {
    ctx.deleteMessage(ctx.message.message_id);
    getGroupWelcomeMessage(ctx);
  }
  // console.log(ctx.message);
  //handle filtering
  const hasReplied = ctx.message?.reply_to_message;
  const message = ctx.message.text;
  if (ctx.chat.type === "supergroup") {
    filterGroupMessage(ctx);
  }
  if (message) {
    if (message.includes("!فیلتر")) {
      removeFilter(ctx, message);
    } else if (message.includes("نمایش فیلتر")) {
      viewUserFilter(ctx);
    } else if (message.includes("فیلتر")) {
      addFilter(ctx, message);
    } else if (message.includes("حذف")) {
      deleteMessageFromGroup(ctx);
    }
    if (!hasReplied) {
      if (message.includes("حذف مسدود همه")) {
        handleBan(ctx, "حذف مسدود همه");
        return;
      } else if (message.includes("حذف مسدود")) {
        handleBan(ctx, "حذف");
        return;
      } else if (message.includes("مسدود")) {
        handleBan(ctx, "");
        return;
      }
    }
  }
});

bot.on("photo", (ctx) => {
  bot.telegram.getFile(ctx.message.photo[0].file_id).then((item) => {
    bot.telegram.setChatPhoto(-1001413685786, ctx.message.photo[0].file_id);
  });
});
commandFilter(bot);

bot.launch();
