const fs = require("fs");

async function joinGroup(newData, cb) {
  try {
    let data = await fs.readFileSync("data/groups.json", {
      encoding: "utf8",
    });
    data = JSON.parse(data);
    let index = await data.findIndex((item) => item.chatId === newData.chatId);
    console.log(index);
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

module.exports = {
  joinGroup,
  getUserAllGroups,
};
