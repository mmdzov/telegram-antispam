const { Markup } = require("telegraf");
const { getUserAllGroups, selectPanelGroup } = require("../dist/group.js");
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

function inlinePanelAction(ctx) {
  const key = ctx.match[0];
  if (key === "backToHome") {
    selectPanelGroup(ctx);
  }
  if (key.includes("manageGroup")) {
    selectPanelGroup(ctx, key.match(/[0-9\-]/g).join(""));
  }
}

module.exports = {
  inlinePanel,
  inlinePanelAction,
};
