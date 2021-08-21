const bot = require("../config/requires");
const { Markup } = require("telegraf");
const { viewUserFilter } = require("../utils/util_setting");
const {
  addSession,
  removeSession,
  browseSessions,
} = require("../utils/util_session");
const {
  getUserAllGroups,
  LeaveBotFromAllGroups,
  leaveBotFromGroup,
} = require("../group/group");
const { callback: b } = Markup.button;

let inlineSetting = Markup.inlineKeyboard([
  [b("بازگشت", "backToHome")],
  [b("افزودن فیلتر کلمات", "addFilter")],
  [b("حذف از فیلتر کلمات", "removeFromFilter")],
  [b("مشاهده لیست فیلتر کلمات", "seeFilterList")],
  [b("خروج ربات از همه گروه ها", "leaveBotFromAllGroup")],
  [b("خروج ربات از گروه", "leaveBotFromGroup")],
]);

let sure = Markup.inlineKeyboard([
  [b("آیا مطمئنی قربان؟", "sure")],
  [b("بله✅", "yes"), b("خیر❌", "no")],
]);

let filterMessage = Markup.inlineKeyboard([[b("بازگشت", "backToHome")]]);

function inlineSettingAction(ctx) {
  const key = ctx.match[0];
  if (key === "addFilter") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: filterMessage.reply_markup.inline_keyboard,
    });
    ctx.telegram.sendMessage(
      ctx.from.id,
      "کلمه ای که میخواهید فیلتر کنید را بنویسید..."
    );
    addSession(
      {
        chatId: ctx.chat.id,
        from: ctx.from.id,
        message_id: ctx.update.callback_query.message.message_id,
      },
      "addFilter"
    );
  }
  if (key === "removeFromFilter") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: filterMessage.reply_markup.inline_keyboard,
    });
    ctx.telegram.sendMessage(
      ctx.from.id,
      "کلمه ای که میخواهید از فیلتر حذف شود را بنویسید..."
    );
    addSession(
      {
        chatId: ctx.chat.id,
        from: ctx.from.id,
        message_id: ctx.update.callback_query.message.message_id,
      },
      "unFilter"
    );
  } else if (key === "leaveBotFromAllGroup") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: sure.reply_markup.inline_keyboard,
    });
    addSession(
      {
        from: ctx.from.id,
      },
      "leaveBotfromAllGroup"
    );
  } else if (key === "no") {
    removeSession("from", ctx.from.id);
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineSetting.reply_markup.inline_keyboard,
    });
  } else if (key === "yes") {
    browseSessions(ctx, { payload: "leaveBotfromAllGroup" }, (index) => {
      if (index >= 0) {
        LeaveBotFromAllGroups(ctx);
        removeSession("from", ctx.from.id);
        ctx.editMessageReplyMarkup({
          inline_keyboard: inlineSetting.reply_markup.inline_keyboard,
        });
      }
    });
    browseSessions(ctx, { payload: "leaveFromGroup" }, (index, item) => {
      if (index >= 0) {
        leaveBotFromGroup(ctx, item.payload);
        removeSession("from", ctx.from.id);
        ctx.editMessageReplyMarkup({
          inline_keyboard: inlineSetting.reply_markup.inline_keyboard,
        });
      }
    });
  } else if (key === "leaveBotFromGroup") {
    let names = [];
    getUserAllGroups(ctx.from.id).forEach((item) => {
      names.push({ name: item.groupName, id: item.chatId });
    });
    let groups = Markup.inlineKeyboard([
      [b("بازگشت", "backToHome")],
      ...names.map((item) => {
        return [b(item.name, `leaveFromGroup: ${item.id}`)];
      }),
    ]);
    ctx.editMessageReplyMarkup({
      inline_keyboard: groups.reply_markup.inline_keyboard,
    });
  } else if (key.includes("leaveFromGroup")) {
    addSession({ from: ctx.from.id }, key);
    ctx.editMessageReplyMarkup({
      inline_keyboard: sure.reply_markup.inline_keyboard,
    });
  } else if (key === "seeFilterList") {
    viewUserFilter(ctx);
  } else if (key === "backToHome") {
    removeSession(ctx.from.id);
  }
}

module.exports = { inlineSetting, inlineSettingAction };
