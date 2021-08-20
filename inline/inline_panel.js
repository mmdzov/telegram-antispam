const { Markup } = require("telegraf");
const { getUserAllGroups } = require("../group/group");
const { callback: b } = Markup.button;

const inlinePanel = (userId) => {
  let names = [];
  getUserAllGroups(userId).forEach((item) => {
    names.push({ name: item.groupName, id: item.chatId });
  });
  return Markup.inlineKeyboard([
    [b("بازگشت", "backToHome")],
    ...names.map((item) => {
      return [b(item.name, `manageGroup: ${item.id}`)];
    }),
  ]);
};

module.exports = inlinePanel;
