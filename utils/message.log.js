const fs = require("fs");
const bot = require("../config/requires");

function addMessageLog(ctx, messageId) {
  let logs = fs.readFileSync("data/msglog.json", "utf8");
  logs = JSON.parse(logs);
  const logIndex = logs.findIndex((item) => item.userId === ctx.from.id);
  if (logs[logIndex]?.list) {
    logs[logIndex].list.map((item) => {
      bot.telegram
        .editMessageText(
          ctx.chat.id,
          item,
          ctx.inlineMessageId,
          "دستور بده قربان"
        )
        .catch((e) => {
        //   console.log(e);
        });
    });
    logs[logIndex].list = [
      logs[logIndex].list[logs[logIndex].list.length - 1],
      messageId,
    ];
  } else if (logIndex === -1) {
    logs.push({ userId: ctx.from.id, list: [messageId] });
  } else {
    logs[logIndex].list = [messageId];
  }
  fs.writeFileSync("data/msglog.json", JSON.stringify(logs));
}
function hasLastMsgId(ctx, messageId) {
  let logs = fs.readFileSync("data/msglog.json", "utf8");
  logs = JSON.parse(logs);
  const index = logs.findIndex((item) => item.userId === ctx.from.id);
  let lastMsgId = logs[index].list.slice(-1)[0];
  if (lastMsgId === messageId) return true;
  return false;
}
module.exports = { addMessageLog, hasLastMsgId };
