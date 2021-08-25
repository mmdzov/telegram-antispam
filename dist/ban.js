const fs = require("fs");
const { removeSession } = require("../utils/util_session");
const bot = require("../config/requires");

async function handleBanDetail(ctx, mode = "") {
  const message = ctx.message.text
    .split(mode === "" ? "مسدود" : "حذف مسدود")
    .filter((item, index) => index !== 0)
    .join("");
  console.log(mode);
  const userId = message?.trim().length >= 8 ? +message.trim() : false;
  let admins = await bot.telegram.getChatAdministrators(ctx.message.chat.id);
  if (
    admins.filter((admin) => admin.user.id === ctx.message.from.id).length === 0
  ) {
    ctx.reply(`کاربر ${ctx.message.from.first_name} شما ادمین نیستی.`);
    return;
  }
  if (userId) {
    const user = await bot.telegram.getChat(+userId);
    let banItem = {
      name: user?.first_name ?? "",
      lastName: user?.last_name ?? "",
      username: "@" + user?.username ?? "",
      id: user.id,
    };
    let groups = fs.readFileSync("data/groups.json", "utf8");
    groups = JSON.parse(groups);
    let index = groups.findIndex((item) => item.chatId === ctx.chat.id);
    if (
      groups[index].banlist.filter((item) => item.id === +userId).length > 0
    ) {
      ctx.reply(`کاربر ${user.first_name} قبلا از گروه مسدود شده قربان`);
      return;
    }
    if (mode === "") {
      if (admins.some((admin) => admin.user.id === user.id)) {
        ctx.reply(`ادمین را نمی توانم مسدود کنم قربان.`);
        return;
      }
      groups[index].banlist.push(banItem);
      ctx.kickChatMember(ctx.chat.id, user.id);
    } else {
      groups[index].banlist = groups[index].banlist.filter(
        (item) => item.id !== user.id
      );
      ctx.unbanChatMember(ctx.chat.id, user.id);
    }
    fs.writeFileSync("data/groups.json", JSON.stringify(groups));
    if (mode === "") {
      ctx.reply(`کاربر ${user.first_name} مسدود شد`);
    } else {
      ctx.reply(`کاربر ${user.first_name} حذف مسدود شد`);
    }
  }
}

function viewBanUsers(ctx) {
  const userId = ctx.from.id;
  fs.readFile("data/groups.json", "utf8", (err, data) => {
    if (err) console.log(err);
    data = JSON.parse(data);
    let SSGPData = fs.readFileSync("data/session.group.json", {
      encoding: "utf8",
    });
    SSGPData = JSON.parse(SSGPData);
    const IndexUid = SSGPData.findIndex((item) => item.userId === userId);
    const groupId = SSGPData[IndexUid].groupId;
    const filteredGroups = data.filter(
      (item) => item.admin.includes(userId) && +item.chatId === +groupId
    )[0];
    const banList = filteredGroups?.banlist;
    if (banList?.length > 0) {
      const mapped = banList.map((item) => {
        return `${
          item?.username ||
          item?.name?.trim() ||
          item?.lastName.trim() ||
          "ناشناس"
        } > ${item.id}`;
      });
      ctx.reply(`لیست مسدود شده ها:

${mapped.join("\n")}
      `);
    } else {
      ctx.reply("لیست کاربران مسدود شده خالیه قربان.");
    }
  });
}

function viewBanUsersAll(ctx) {
  const userId = ctx.from.id;
  fs.readFile("data/groups.json", "utf8", (err, data) => {
    if (err) console.log(err);
    data = JSON.parse(data);
    const userGroups = data.filter(
      (item) => item.admin.includes(userId) && item
    );
    let groupCount = 0;
    const mapped = userGroups.map((item) => {
      if (item?.banlist) {
        let mappedBans = item.banlist.map((i) => {
          return `${
            i?.username || i?.name?.trim() || i?.lastName.trim() || "ناشناس"
          } > ${i.id}`;
        });
        if (mappedBans.length === 0) groupCount++;
        return `${item.groupName}
${mappedBans.join("\n")}
        `;
      } else {
        groupCount++;

        // return `${item.groupName} : بدون مسدودی`;
      }
    });
    if (groupCount === mapped.length) {
      ctx.reply("لیست کاربران مسدود شده تمام گروه ها خالیه قربان");
    } else {
      ctx.reply(mapped.join("\n"));
    }
  });
}

async function clearBanList(ctx) {
  const userId = ctx.from.id;
  const admins = await ctx.getChatAdministrators(ctx.chat.id);
  if (
    admins.filter((admin) => admin.user.id === ctx.message.from.id).length === 0
  ) {
    ctx.reply(`کاربر ${ctx.message.from.first_name} شما ادمین نیستی`);
    return;
  }
  let groupId = "";
  if (ctx.chat.type !== "supergroup") {
    const data = await fs.readFileSync("data/session.group.json", "utf8");
    data = JSON.parse(data);
    const groupIndex = data.findIndex((item) => item.userId === userId);
    groupId = data[groupIndex].groupId;
  } else groupId = ctx.chat.id;
  let groups = await fs.readFileSync("data/groups.json", "utf8");
  groups = JSON.parse(groups);
  const index = groups.findIndex((item) => item.chatId === +groupId);
  if (groups[index].banlist.length === 0) {
    ctx.reply("لیست مسدودی ها خالی است قربان");
    return;
  }
  groups[index]?.banlist.map(({ id }) => {
    ctx.unbanChatMember(groups[index].chatId, id);
  });
  groups[index].banlist = [];
  fs.writeFile("data/groups.json", JSON.stringify(groups), (err) => {
    if (err) console.log(err);
    else ctx.reply("لیست مسدودی ها خالی شد");
  });
}

async function clearBanListAll(ctx) {
  const admins = await ctx.getChatAdministrators(ctx.chat.id);
  if (
    admins.filter((admin) => admin.user.id === ctx.message.from.id).length === 0
  ) {
    ctx.reply(`کاربر ${ctx.message.from.first_name} شما ادمین نیستی`);
    return;
  }
  const userId = ctx.from.id;
  let data = await fs.readFileSync("data/groups.json", "utf8");
  data = JSON.parse(data);
  const banlistExist = data.filter(
    (item) => item.admin.includes(userId) && item?.banlist?.length > 0 && item
  );
  if (banlistExist.length === 0) {
    ctx.reply("لیست همه مسدودی ها خالی است قربان");
    return;
  }
  const mapped = data.map((item) => {
    if (item.admin.includes(userId)) {
      item?.banlist.map(({ id }) => {
        ctx.unbanChatMember(item.chatId, id);
      });
      item.banlist = [];
    }
    return item;
  });
  fs.writeFile("data/groups.json", JSON.stringify(mapped), (err) => {
    if (err) console.log(err);
    else ctx.reply("لیست مسدودی تمام گروه ها خالی شد");
  });
}

function banUserSession(ctx, body = {}, payload = "", prevPayload = []) {
  fs.readFile("data/sessions.json", "utf8", (err, data) => {
    if (err) console.log(err);
    data = JSON.parse(data);
    const index = data.findIndex(
      (item) => item.body.from === ctx.from.id && item.payload === payload
    );
    data = data.filter(
      (item) =>
        item.body.from !== ctx.from.id && !prevPayload.includes(item.payload)
    );

    if (index >= 0) {
    } else {
      data.push({
        body,
        payload,
      });
      fs.writeFile("data/sessions.json", JSON.stringify(data), (err) => {
        if (err) console.log(err);
      });
    }
  });
}

const handleBan = (ctx, mode = "") => {
  const target = ctx.update.message?.reply_to_message;
  if (!target) {
    handleBanDetail(ctx, mode);
    return;
  }
  let banItem = {
    name: target.from?.first_name ?? "",
    lastName: target.from?.last_name ?? "",
    username: "@" + target.from?.username ?? "",
    id: target.from.id,
  };
  fs.readFile("data/groups.json", "utf8", (err, data) => {
    if (err) console.log(err);
    data = JSON.parse(data);
    const index = data.findIndex((item) => item.chatId === target.chat.id);
    const userHasAdmin = data[index].admin.includes(ctx.from.id);
    const targetHasAdmin = data[index].admin.includes(target.from.id);
    if (userHasAdmin) {
      if (!targetHasAdmin) {
        if (data[index]?.banlist.length > 0) {
          if (data[index].banlist.map((item) => item.id === target.from.id)) {
            if (mode === "") {
              ctx.reply(
                `کاربر ${target.from.id} قبلا از گروه ${mode} مسدود شده.`
              );
              return;
            }
            let filteredData = data[index].banlist.filter(
              (item) => item.id !== target.from.id
            );
            data[index].banlist = filteredData;
          } else {
            if (mode === "") {
              data[index].banlist.push(banItem);
            }
          }
        } else {
          if (mode === "") {
            data[index].banlist = [banItem];
          }
        }
        fs.writeFile("data/groups.json", JSON.stringify(data), (err) => {
          if (err) console.log(err);
          else {
            if (mode === "") {
              ctx.telegram.kickChatMember(target.chat.id, target.from.id);
              removeSession("from", ctx.from.id, "banUser");
            } else {
              ctx.unbanChatMember(target.chat.id, target.from.id);
              removeSession("from", ctx.from.id, "unbanUser");
            }
            ctx.reply(`کاربر ${target.from.id} از گروه ${mode} مسدود شد.`);
          }
        });
      } else {
        if (mode === "") {
          ctx.reply(`${mode} مسدود کردن ادمین درتوانم نیست قربان :(`);
        } else {
          ctx.reply(`ادمین توسط ربات مسدود نشده و در لیست مسدودی ربات نیست`);
        }
      }
    } else {
      //   ctx.deleteMessage(ctx.update.message.message_id);
      ctx.reply(`کاربر ${ctx.from.first_name} شما ادمین نیستی`);
    }
  });
};

const handleBanWithKey = (ctx, uid = "", type = "") => {
  const hasUserId = ctx.message.text.match(/[0-9]/g)?.join("");
  bot.telegram
    .getChat(uid ? +uid : +hasUserId)
    .then((user) => {
      fs.readFile("data/groups.json", "utf8", (err, data) => {
        if (err) console.log(err);
        data = JSON.parse(data);
        fs.readFile("data/session.group.json", "utf8", (err, groups) => {
          if (err) console.log(err);
          groups = JSON.parse(groups);
          const groupIndex = groups.findIndex(
            (item) => item.userId === ctx.from.id
          );
          const groupId = groups[groupIndex].groupId;
          const groupIndexItem = data.findIndex(
            (item) => item.chatId === +groupId
          );
          const banItem = {
            name: user?.first_name,
            username: "@" + user?.username,
            id: user.id,
          };

          if (data[groupIndexItem]?.banlist) {
            if (
              data[groupIndexItem].banlist.some((item) => item.id === user.id)
            ) {
              if (type === "") {
                ctx.reply(`کاربر قبلا از گروه مسدود شده قربان.`);
                return;
              } else {
                let bans = data[groupIndexItem].banlist.filter(
                  (item) => item.id !== user.id
                );
                data[groupIndexItem].banList = bans;
              }
            } else {
              if (type === "") {
                data[groupIndexItem].banlist.push(banItem);
              } else {
                ctx.reply("کاربر در لیست مسدودی ها نیست.");
                return;
              }
            }
          } else {
            if (type === "") {
              data[groupIndexItem].banlist = [banItem];
            }
          }
          if (type === "") {
            ctx.kickChatMember(+groupId, user.id);
          }
          fs.writeFile("data/groups.json", JSON.stringify(data), (err) => {
            if (err) console.log(err);
          });
          ctx.reply(`کاربر از گروه ${type} مسدود شد قربان.`);
        });
      });
    })
    .catch((e) => {
      ctx.reply("آیدی عددی کاربر رو اشتباه وارد کردی قربان");
      return;
    });
};

function handleBanUserWithKey(ctx, type = "", mode = "") {
  const hasUserId = ctx.message.text.match(/[0-9]/g)?.join("");

  if (hasUserId?.length >= 8) {
    if (mode === "") {
      handleBanWithKey(ctx);
    } else {
      handleBanallUserWithKey(ctx);
    }
  } else {
    if (ctx.message?.forward_date && !ctx.message?.forward_from?.id) {
      ctx.reply(
        `قربان! هدف فورواردشو بسته من نمیتونم آیدی عددیشو ببینم
میتونی تلگراف رو نصب کنی و آیدیشو از پروفایلش برداری بهم بدی 
یا توی گروه میتونی روی اون فرد ریپلای کنی و کلمه مسدود/حذف مسدود رو تایپ کنی بفرستی
برای اطلاعات بیشتر از /help کمک بگیر
          `
      );
    } else {
      if (mode === "") {
        handleBanWithKey(ctx, ctx.message?.forward_from?.id, type);
      } else handleBanallUserWithKey(ctx, ctx.message?.forward_from?.id);
    }
  }
}

async function banallGroupFromReply(ctx, mode) {
  const admins = await ctx.getChatAdministrators(ctx.chat.id);
  if (
    admins.filter((admin) => admin.user.id === ctx.message.from.id).length === 0
  ) {
    ctx.reply(`کاربر ${ctx.message.from.first_name} شما ادمین نیستی`);
    return;
  }
  let user = {};
  try {
    console.log(ctx.message?.reply_to_message?.from?.id);
    user = await bot.telegram.getChat(
      ctx.message?.reply_to_message?.from?.id
        ? ctx.message?.reply_to_message?.from?.id
        : +ctx.message.text
            .trim()
            .split(/[^0-9]/g)
            .join("")
    );
  } catch (e) {
    console.log(e);
    ctx.reply("کاربر پیدا نشد قربان.");
  }
  let banItem = {
    name: user?.first_name ?? "",
    lastName: user?.last_name ?? "",
    username: "@" + user?.username ?? "",
    id: user.id,
  };
  let groups = fs.readFileSync("data/groups.json", "utf8");
  groups = JSON.parse(groups);
  let kickedCount = 0;
  groups = groups.map((item) => {
    if (
      item.admin.includes(ctx.message.from.id) &&
      item.banlist.filter((item) => item.id === user.id).length === 0
    ) {
      bot.telegram.kickChatMember(item.chatId, user.id);
      item.banlist.push(banItem);
      kickedCount++;
      return item;
    }
    return item;
  });
  if (kickedCount > 0) {
    await fs.writeFileSync("data/groups.json", JSON.stringify(groups));
    ctx.reply(`کاربر ${user.id} از تمام گروه ها مسدود شد`);
  } else {
    ctx.reply(`کاربر ${user.id} قبلا از تمام گروه ها مسدود شده قربان`);
  }
}

function handleBanallUserWithKey(ctx, forwardedId = "") {
  const hasUserId = ctx.message.text.match(/[0-9]/g)?.join("");

  fs.readFile("data/sessions.json", "utf8", (err, sessions) => {
    if (err) console.log(err);
    sessions = JSON.parse(sessions);
    const sessionIndex = sessions.findIndex(
      (item) => item.body.from === ctx.from.id
    );
    const payloadType = sessions[sessionIndex]?.payload;
    let kickedFromChatCount = 0;
    let unbanallCount = 0;
    fs.readFile("data/groups.json", "utf8", async (err, groups) => {
      if (err) console.log(err);
      groups = JSON.parse(groups);
      let user = await bot.telegram.getChat(
        forwardedId ? +forwardedId : +hasUserId
      );
      groups = groups.map((item, index, arr) => {
        if (item.admin.includes(ctx.from.id)) {
          const banItem = {
            name: user?.first_name,
            username: "@" + user?.username,
            id: user.id,
          };
          if (item?.banlist?.length >= 0) {
            if (payloadType === "banallUser") {
              item.banlist.push(banItem);
            } else if (payloadType === "unbanallUser") {
              const filteredItem = item.banlist.filter(
                (banUser) => banUser.id !== user.id
              );
              if (filteredItem.length > 0) {
                item.banlist = filteredItem;
                unbanallCount++;
              }
            }
          } else {
            if (payloadType === "banallUser") {
              item.banlist = [banItem];
            }
          }
          if (payloadType === "banallUser") {
            bot.telegram.kickChatMember(item.chatId, user.id);
            kickedFromChatCount++;
          } else if (payloadType === "unbanallUser") {
            bot.telegram.unbanChatMember(item.chatId, user.id);
          }
          return item;
        }
        return item;
      });
      fs.writeFile("data/groups.json", JSON.stringify(groups), (err) => {
        if (err) console.log(err);
        if (payloadType === "banallUser") {
          if (kickedFromChatCount > 0) {
            ctx.reply("کاربر از تمام گروه ها مسدود شد قربان");
          } else {
            ctx.reply("کاربر قبلا از همه گروه ها مسدود شده بود قربان");
          }
        } else if (payloadType === "unbanallUser") {
          if (unbanallCount > 0) {
            ctx.reply("کاربر از تمام گروه ها حذف مسدود شد قربان");
          } else {
            ctx.reply("کاربر قبلا از تمام گروه ها حذف مسدود شده قربان");
          }
        }
      });
    });
  });
}

function banUserFromReply(ctx) {
  handleBan(ctx, "");
}

function unbanUserFromReply(ctx) {
  handleBan(ctx, "حذف");
}

module.exports = {
  viewBanUsers,
  handleBanUserWithKey,
  banUserSession,
  banUserFromReply,
  unbanUserFromReply,
  viewBanUsersAll,
  clearBanList,
  handleBan,
  clearBanListAll,
  banallGroupFromReply,
};
