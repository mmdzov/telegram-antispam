const fs = require("fs");
const { Scenes, Markup } = require("telegraf");
const bot = require("../config/requires");
const { inlineNewAdmin } = require("../inline/inline_newAdmin");
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
    try {
      fs.readFileSync(`message-logs/${Math.abs(newData.chatId)}.json`, "utf8");
    } catch (e) {
      if (e?.code === "ENOENT") {
        fs.writeFileSync(
          `message-logs/${"g-" + Math.abs(newData.chatId)}.json`,
          JSON.stringify([])
        );
      }
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

function deletePanelGroup(ctx, groupId) {
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
    }
  });
}
function selectPanelGroup(ctx, groupId) {
  fs.readFile("data/session.group.json", "utf8", (err, data) => {
    if (err) console.log(err);
    data = JSON.parse(data);
    data.push({ userId: ctx.from.id, groupId });
    fs.writeFile("data/session.group.json", JSON.stringify(data), (err) => {
      if (err) console.log(err);
    });
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
    const userHasAdmin = groups[groupIndex]?.admin?.includes(
      ctx.message.from.id
    );
    if (!userHasAdmin) return;
  } else {
    //
  }
  let message = ctx.message.text.match(/[0-9]/g)?.join("");
  // console.log(ctx.message.text);
  let b = 0;
  for (let i = 0; i <= +message; i++) {
    b = ctx.message.message_id - i;
    // console.log(b);
    bot.telegram
      .deleteMessage(groups[groupIndex]?.chatId ?? ctx.from.id, b)
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
        if (item === "FIRST_NAME")
          item = ctx.message.new_chat_member.first_name;
        if (item === "GROUP_NAME") {
          item = i.title;
          return item;
        }
        // if (item === "LAST_NAME") item = ctx.message.new_chat_member.last_name;
        if (item === "USERNAME")
          item = "@" + ctx.message.new_chat_member.username;
        return item;
      }
      return item;
    });
    ctx.reply(s.join(" "));
  }
}

function setAdminTitle(ctx) {
  const title = ctx.message.text.trim().split("لقب").join("");
  console.log(ctx.message.reply_to_message.from.id);
  bot.telegram.setChatAdministratorCustomTitle(
    ctx.chat.id,
    ctx.message.reply_to_message.from.id,
    title
  );
}

function setPromoteSession(ctx) {
  let sspr = fs.readFileSync("data/session.promote.json");
  sspr = JSON.parse(sspr);
  const index = sspr.findIndex(
    (item) => item.chat === ctx.chat.id && item.from === ctx.from.id
  );
  let ss = {
    from: ctx.from.id,
    target: ctx?.message.reply_to_message?.from?.id,
    chat: ctx.chat.id,
    messageId: [ctx.message.message_id],
    access: {
      can_restrict_members: false,
      can_promote_members: false,
      can_pin_messages: true,
      can_manage_voice_chats: true,
      can_manage_chat: true,
      can_invite_users: true,
      can_delete_messages: true,
      can_change_info: true,
      is_anonymous: false,
    },
  };
  if (index >= 0) {
    if (sspr[index].messageId.length === 2) {
      bot.telegram.deleteMessage(ctx.chat.id, sspr[index].messageId[1]);
      bot.telegram.deleteMessage(ctx.chat.id, sspr[index].messageId[0]);
    }
    sspr[index] = ss;
  } else {
    sspr.push(ss);
  }
  fs.writeFileSync("data/session.promote.json", JSON.stringify(sspr));
}

function changePromoteSession(ctx, msgId = 0) {
  let sspr = fs.readFileSync("data/session.promote.json");
  sspr = JSON.parse(sspr);
  const index = sspr.findIndex(
    (item) => item.chat === ctx.chat.id && item.from === ctx.from.id
  );
  sspr[index].messageId.push(msgId);
  fs.writeFileSync("data/session.promote.json", JSON.stringify(sspr));
  return sspr[index].access;
}

function getSessionPromoteAccess(ctx, key, value) {
  let sspr = fs.readFileSync("data/session.promote.json", "utf8");
  sspr = JSON.parse(sspr);
  const index = sspr.findIndex(
    (item) =>
      item.chat === ctx.chat?.id &&
      item.messageId.slice(-1)[0] ===
        ctx.update?.callback_query?.message?.message_id &&
      item.from === ctx.update?.callback_query?.from?.id
  );
  //   console.log(sspr);
  let access = sspr[index]?.access;
  if (key && value) {
    sspr[index].access[key] = value;
    console.log(key, value);
    fs.writeFileSync("data/session.promote.json", JSON.stringify(sspr));
  }
  return { access, target: sspr[index]?.target };
}

async function promoteToAdminKeys(ctx) {
  const userId = ctx.message?.reply_to_message;
  if (ctx.chat.type !== "supergroup") return;
  if (!userId) return;
  const admins = await ctx.getChatAdministrators(ctx.chat.id);
  if (admins.filter((admin) => admin.user.id !== ctx.from.id).length === 0) {
    ctx.reply(`کاربر ${ctx.from.id} شما ادمین نیستی.`);
    return;
  }
  setPromoteSession(ctx);
  let { message_id } = await bot.telegram.sendMessage(
    ctx.chat.id,
    "سطح دسترسی مدیر جدید را مشخص کنید قربان.",
    inlineNewAdmin(ctx, getSessionPromoteAccess(ctx).access)
  );
  let result = await changePromoteSession(ctx, message_id);
  bot.telegram.editMessageReplyMarkup(
    ctx.chat.id,
    message_id,
    ctx.inlineMessageId,
    {
      inline_keyboard: inlineNewAdmin(ctx, result).reply_markup.inline_keyboard,
    }
  );
}

function setChatAdminTitle(ctx) {
  ctx
    .setChatAdministratorCustomTitle(
      ctx.message.reply_to_message.from.id,
      ctx.message.text
        .split(" ")
        .filter((_, i) => i !== 0)
        .join(" ")
    )
    .then((res) => {
      ctx.reply(`عنوان ثبت شد.`);
    })
    .catch((e) => {
      ctx.reply(`کاربر باید حتما توسط ربات ادمین شده باشد قربان.`);
    });
}

async function getLocks(ctx) {
  let groups = fs.readFileSync("data/groups.json", "utf8");
  groups = JSON.parse(groups);
  const index = groups.findIndex((item) => item.chatId === ctx.chat.id);
  let hasAdmin = await userHasAdmin(ctx);
  return { locks: groups[index].locks, userHasAdmin: hasAdmin };
}

module.exports = {
  joinGroup,
  filterGroupMessage,
  setAdminTitle,
  getUserAllGroups,
  getLocks,
  promoteToAdminKeys,
  LeaveBotFromAllGroups,
  getGroupInviteLink,
  leaveBotFromGroup,
  getGroupWelcomeMessage,
  changeGroupInviteLink,
  deleteMessageFromGroup,
  getSessionPromoteAccess,
  changeGroupBio,
  changeGroupName,
  selectPanelGroup,
  setChatAdminTitle,
  getAndModifyGroupLocks,
  setWelcomeMsg,
  aboutUser,
  deletePanelGroup,
};
