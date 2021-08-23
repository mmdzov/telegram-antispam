const { Markup } = require("telegraf");
const { getUserAllGroups } = require("../dist/group.js");
const { callback: b } = Markup.button;

const inlineAutomate = (userId) => {
  let names = [];
  getUserAllGroups(userId).forEach((item) => {
    names.push({ name: item.groupName, id: item.chatId });
  });
  return Markup.inlineKeyboard([
    [b("بازگشت", "backToHome")],
    ...names.map((item) => {
      return [b(item.name, `inlineAutomate: ${item.id}`)];
    }),
  ]);
};
const inlineAutomateList = () => {
  return Markup.inlineKeyboard([
    [b("بازگشت", "backToHome")],
    [b("ارسال پیام به گروه", "sendMessageToGroup")],
    [b("ارسال نظرسنجی به گروه", "sendVoteToGroup")],
    [b("ارسال پیام زمان دار", "sendTimingMessage")],
    [b("حذف همه پیام ها", "deleteAllMessages")],
    [b("حذف کردن پیام ها", "deleteMessages")],
    [b("حذف تمام کاربران", "deleteAllUsers")],
    [b("حذف پیام زمان دار", "deleteTimingMessage")],
    [b("حذف دلیت اکانت ها", "deleteDeletedAccounts")],
    [b("حذف کاربران غیر فعال", "deleteDisableUsers")],
  ]);
};
module.exports = { inlineAutomate, inlineAutomateList };
