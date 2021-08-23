const fs = require("fs");

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

module.exports = {
  joinGroup,
  getUserAllGroups,
  LeaveBotFromAllGroups,
  leaveBotFromGroup,
  selectPanelGroup,
};
