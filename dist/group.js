const fs = require("fs");
const { Scenes, Markup } = require("telegraf");
const bot = require("../config/requires");
const { removeSession } = require("../utils/util_session");
const sureInlineKey = Markup.inlineKeyboard([
  [Markup.button.callback("فهمیدم", "acceptAndDelete")],
]);
async function joinGroup(newData, cb) {
  try {
    let data = await fs.readFileSync("data/groups.json", {
      encoding: "utf8",
    });
    data = JSON.parse(data);
    let index = await data.findIndex((item) => item.chatId === newData.chatId);
    // console.log(index);
    if (index === -1) {
      await data.push(newData);
      await fs.writeFileSync("data/groups.json", JSON.stringify(data));
      cb("گروه با موفقیت ثبت شد");
    } else {
      cb("دستور بده قربان");
    }
  } catch (e) {
    console.log(e);
  }
}

function getUserAllGroups(userId) {
  let groups = fs.readFileSync("data/groups.json");
  groups = JSON.parse(groups);
  let userGroups = [];
  groups.forEach((item) => {
    let index = item.admin.findIndex((uid) => uid === userId);
    if (index >= 0) {
      userGroups.push(item);
    }
  });
  return userGroups;
}

async function LeaveBotFromAllGroups(ctx) {
  let groups = fs.readFileSync("data/groups.json");
  groups = JSON.parse(groups);
  groups = groups.map((item) => {
    let index = item.admin.findIndex((uid) => uid === ctx.from.id);
    if (index >= 0) {
      ctx.telegram.leaveChat(item.chatId);
    } else {
      return item;
    }
  });
  fs.writeFileSync("data/groups.json", JSON.stringify(groups ?? []), (err) => {
    if (err) console.log(err);
  });
  ctx.reply("ربات از تمام گروه هایی که ادمین بود خارج شد.");
}
async function leaveBotFromGroup(ctx, key) {
  let groups = fs.readFileSync("data/groups.json");
  groups = JSON.parse(groups);
  let groupName = "";
  let groupId = +key.match(/[0-9\-]/g).join("");
  const trimGroups = groups.filter((item) => {
    const index = item.admin.findIndex((uid) => uid === ctx.from.id);
    if (index >= 0) {
      if (item.chatId !== groupId) return item;
      else groupName = item.groupName;
    }
  });
  ctx.telegram.leaveChat(groupId);

  fs.writeFileSync(
    "data/groups.json",
    JSON.stringify(trimGroups ?? []),
    (err) => {
      if (err) console.log(err);
    }
  );
  ctx.reply(`ربات از گروه خارج شد.`);
}

function selectPanelGroup(ctx, groupId) {
  fs.readFile("data/session.group.json", "utf8", (err, data) => {
    if (err) console.log(err);
    data = JSON.parse(data);
    const index = data.findIndex((item) => item.userId === ctx.from.id);
    if (index >= 0) {
      const filteredData = data.filter(
        (item) => item.userId !== data[index].userId
      );
      fs.writeFile(
        "data/session.group.json",
        JSON.stringify(filteredData),
        (err) => {
          if (err) console.log(err);
        }
      );
    } else {
      data.push({ userId: ctx.from.id, groupId });
      fs.writeFile("data/session.group.json", JSON.stringify(data), (err) => {
        if (err) console.log(err);
      });
    }
  });
}

function limitSendMessageGroup(ctx) {
  // console.log(ctx.update.callback_query);
  const message = +ctx.message.text;
  if (!message || message > 1000 || message < 3) {
    ctx.reply("فقط اعداد 3 تا 1000 مورد قبول هستند");
    return;
  }
  fs.readFile("data/sessions.json", "utf8", (err, data) => {
    if (err) console.log(err);
    data = JSON.parse(data);
    const index = data.findIndex(
      (item) => item.body.from === ctx.from.id && item.payload === "limitSend"
    );
    if (index >= 0) {
      getAndModifyGroupLocks(ctx, "limitSend", message);
      // ctx.editMessageReplyMarkup(
      //   data[index].chatId,
      //   data[index].message_id,
      //   undefined,
      //   g.inlineGroup(ctx, { key: "limitSend", value: message })
      //     .inlineGroupLocks
      // );
      ctx.reply("اعمال شد");
    } else {
      ctx.reply("مشکلی پیش آمده لطفا بازگشت بزنید و دوباره امتحان کنید");
    }
  });
}

function getAndModifyGroupLocks(ctx, key, value, rule = false) {
  let sessions = fs.readFileSync("data/session.group.json", "utf8");
  sessions = JSON.parse(sessions);
  const groupIndex = sessions.findIndex((item) => item.userId === ctx.from.id);
  const groupId = +sessions[groupIndex]?.groupId;
  let groups = fs.readFileSync("data/groups.json", "utf8");
  groups = JSON.parse(groups);
  const index = groups.findIndex((item) => item.chatId === groupId);
  if (key && value !== "") {
    if (rule) {
      groups[index].rules[key] = value;
    } else {
      if (key === "full") {
        for (let i in groups[index]?.locks) {
          if (typeof groups[index]?.locks[i] === "boolean") {
            groups[index].locks[i] = value;
          }
        }
      } else {
        groups[index].locks[key] = value;
      }
    }
    fs.writeFile("data/groups.json", JSON.stringify(groups), (err) => {
      if (err) {
        console.log(err);
      }
    });
    // ctx.reply(`اعمال شد`);
  }
  return groups[index];
}

function setWelcomeMsg(ctx) {
  const message = ctx.message.text;
  let groups = fs.readFileSync("data/groups.json", "utf8");
  groups = JSON.parse(groups);
  let sessionGroup = fs.readFileSync("data/session.group.json", "utf8");
  sessionGroup = JSON.parse(sessionGroup);
  const index = sessionGroup.findIndex((item) => item.userId === ctx.from.id);
  const groupId = sessionGroup[index].groupId;
  const groupIndex = groups.findIndex((item) => item.chatId === +groupId);
  if (groups[groupIndex].admin.includes(ctx.from.id)) {
    groups[groupIndex].welcomeMsg = message;
    fs.writeFileSync("data/groups.json", JSON.stringify(groups));
    ctx.reply("با موفقیت ثبت شد.");
  } else {
    ctx.reply("شما ادمین نیستی.");
  }
}

function changeGroupName(ctx) {
  let sessionGroup = fs.readFileSync("data/session.group.json", "utf8");
  sessionGroup = JSON.parse(sessionGroup);
  const sessionGroupIndex = sessionGroup.findIndex(
    (item) => item.userId === ctx.from.id
  );
  const groupId = sessionGroup[sessionGroupIndex].groupId;
  let groups = fs.readFileSync("data/groups.json", "utf8");
  groups = JSON.parse(groups);
  const index = groups.findIndex((item) => item.chatId === +groupId);
  if (groups[index].admin.includes(ctx.from.id)) {
    bot.telegram.setChatTitle(groups[index].chatId, ctx.message.text);
    ctx.reply("نام گروه تغییر کرد.");
  } else {
    ctx.reply("شما ادمین نیستیی.");
  }
}

function changeGroupBio(ctx) {
  let sessionGroup = fs.readFileSync("data/session.group.json", "utf8");
  sessionGroup = JSON.parse(sessionGroup);
  const sessionGroupIndex = sessionGroup.findIndex(
    (item) => item.userId === ctx.from.id
  );
  const groupId = sessionGroup[sessionGroupIndex].groupId;
  let groups = fs.readFileSync("data/groups.json", "utf8");
  groups = JSON.parse(groups);
  const index = groups.findIndex((item) => item.chatId === +groupId);
  if (groups[index].admin.includes(ctx.from.id)) {
    bot.telegram.setChatDescription(groups[index].chatId, ctx.message.text);
    ctx.reply("بیوی گروه تغییر کرد.");
  } else {
    ctx.reply("شما ادمین نیستیی.");
  }
}

function getGroupInviteLink(ctx) {
  let sessionGroups = fs.readFileSync("data/session.group.json", "utf8");
  sessionGroups = JSON.parse(sessionGroups);
  const index = sessionGroups.findIndex((item) => item.userId === ctx.from.id);
  const groupId = sessionGroups[index]?.groupId;
  ctx.telegram.exportChatInviteLink(groupId).then((item) => {
    ctx.reply(`لینک گروه:

${item}`);
  });
}

function changeGroupInviteLink(ctx) {
  let sessionGroups = fs.readFileSync("data/session.group.json", "utf8");
  sessionGroups = JSON.parse(sessionGroups);
  const index = sessionGroups.findIndex((item) => item.userId === ctx.from.id);
  const groupId = sessionGroups[index]?.groupId;
  ctx.telegram.createChatInviteLink(groupId).then((item) => {
    ctx.reply(`لینک گروه تغییر کرد. لینک جدید:

${item.invite_link}`);
  });
}

async function filterGroupMessage(ctx) {
  const message = ctx.message?.text;
  let groups = fs.readFileSync("data/groups.json", "utf8");
  groups = JSON.parse(groups);
  const index = groups.findIndex((item) => item.chatId === ctx.chat.id);
  if (await userHasAdmin(ctx)) return;
  if (groups[index].locks.filter) {
    let filters = fs.readFileSync("data/filters.json", "utf8");
    filters = JSON.parse(filters);
    const filterIndex = filters.findIndex(
      (item) => item.userId === groups[index].admin[0]
    );
    if (message) {
      let modifyMsg = message?.replace(/[\u200B-\u200D\uFEFF]/g, " ");
      modifyMsg = modifyMsg.replace("  ", " ");
      modifyMsg = modifyMsg.split(" ");
      modifyMsg.forEach((item) => {
        if (filters[filterIndex].list.includes(item)) {
          bot.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
        }
      });
    }
  }
}

async function userHasAdmin(ctx) {
  let admins = await ctx.getChatAdministrators();
  let hasAdmin = await admins.some((a) => a.user.id === ctx.from.id);
  return hasAdmin;
}

async function aboutUser(ctx, mode = "") {
  if (ctx.message.text.trim() !== mode) return;
  const replied = ctx.message?.reply_to_message;
  const user = await bot.telegram.getChat(
    replied ? replied.from.id : ctx.message.from.id
  );
  let aboutTemp = [
    `آیدی عددی : ${user.id}`,
    `نام : ${user.first_name}`,
    `نام کاربری : ${"@" + user.username}`,
    `${user?.bio ? `بیو : ${user.bio}` : ""}`,
  ];

  bot.telegram.sendMessage(ctx.chat.id, `${aboutTemp.join("\n\n")}`, {
    reply_markup: {
      inline_keyboard: sureInlineKey.reply_markup.inline_keyboard,
    },
  });
}

function deleteMessageFromGroup(ctx) {
  let groups = fs.readFileSync("data/groups.json", "utf8");
  groups = JSON.parse(groups);
  let groupIndex = -1;
  if (ctx.chat.type === "supergroup") {
    groupIndex = groups.findIndex((item) => item.chatId === ctx.chat.id);
  } else {
    //
  }
  const userHasAdmin = groups[groupIndex]?.admin?.includes(ctx.message.from.id);
  if (!userHasAdmin) return;
  let message = ctx.message.text.match(/[0-9]/g).join("");
  let b = 0;
  for (let i = 0; i <= +message; i++) {
    b = ctx.message.message_id - i;
    // console.log(b);
    bot.telegram
      .deleteMessage(groups[groupIndex].chatId, b)
      .then((t) => {
        // console.log(t);
      })
      .catch((e) => {
        // console.log(e);
      });
  }
}

async function getGroupWelcomeMessage(ctx) {
  let groups = fs.readFileSync("data/groups.json", "utf8");
  groups = JSON.parse(groups);
  let groupIndex = -1;
  if (ctx.chat.type === "supergroup") {
    groupIndex = groups.findIndex((item) => item.chatId === ctx.chat.id);
  } else {
    //
  }

  // const userHasAdmin = groups[groupIndex].admin.includes(ctx.message.from.id);
  // if (!userHasAdmin) return;
  const splitWelcome = groups[groupIndex].welcomeMsg.trim().split(" ");
  if (splitWelcome.length > 0) {
    let i = await bot.telegram.getChat(groups[groupIndex].chatId);
    let s = splitWelcome.map((item) => {
      if (/[A-Z]/g.test(item)) {
        if (item === "FIRST_NAME") item = ctx.from.first_name;
        if (item === "GROUP_NAME") {
          item = i.title;
          return item;
        }
        if (item === "LAST_NAME") item = ctx.from.last_name;
        if (item === "USERNAME") item = "@" + ctx.from.username;
        return item;
      }
      return item;
    });
    ctx.reply(s.join(" "));
  }
}

module.exports = {
  joinGroup,
  filterGroupMessage,
  getUserAllGroups,
  LeaveBotFromAllGroups,
  getGroupInviteLink,
  leaveBotFromGroup,
  getGroupWelcomeMessage,
  changeGroupInviteLink,
  deleteMessageFromGroup,
  changeGroupBio,
  changeGroupName,
  selectPanelGroup,
  getAndModifyGroupLocks,
  setWelcomeMsg,
  aboutUser,
  limitSendMessageGroup,
};
