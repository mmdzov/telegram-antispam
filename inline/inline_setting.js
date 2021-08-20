require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const bot = new Telegraf(process.env.TOKEN);
const { callback: b } = Markup.button;

let inlineSetting = Markup.inlineKeyboard([
  [b("بازگشت", "backToHome")],
  //   [b("محدودیت بعد از پیام متوالی", "limitAfterSpam")],
  [b("افزودن فیلتر کلمات", "addFilter")],
  [b("حذف از فیلتر کلمات", "removeFromFilter")],
  [b("مشاهده لیست فیلتر کلمات", "seeFilterList")],
  [b("خروج ربات از همه گروه ها", "leaveBotFromAllGroup")],
  [b("خروج ربات از گروه", "leaveBotFromGroup")],
]);
let filterMessage = Markup.inlineKeyboard([
  [b("بازگشت", "backToHome")],
  [b("ثبت و اتمام", "finishFiltering")],
]);
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
  }
}

module.exports = { inlineSetting, inlineSettingAction };
