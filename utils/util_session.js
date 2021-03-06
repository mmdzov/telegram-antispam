const fs = require("fs");

function addSession(body, payload) {
  fs.readFile("data/sessions.json", "utf8", (err, data) => {
    data = JSON.parse(data);
    const index = data.findIndex(
      (item) => item.body.from === body.from && item.payload === payload
    );
    if (index === -1) {
      data.push({
        body: {
          ...body,
          expire: Date.now() + 60 * 60 * 1000,
        },
        payload,
      });
      fs.writeFile("data/sessions.json", JSON.stringify(data), (err) => {
        if (err) console.log(err);
      });
    }
  });
  return;
}

function removeSession(key, value, payload = "") {
  fs.readFile("data/sessions.json", "utf8", (err, data) => {
    data = JSON.parse(data);
    let filteredData = [];
    if (!payload) {
      filteredData = data.filter((item) => item.body[key] !== value);
    } else {
      filteredData = data.filter(
        (item) => item.body[key] !== value && item.payload !== payload
      );
    }
    fs.writeFile("data/sessions.json", JSON.stringify(filteredData), (err) => {
      if (err) console.log(err);
    });
  });
  return;
}

function browseSessions(ctx, options = { payload: "" }, callback = () => {}) {
  fs.readFile("data/sessions.json", "utf8", (err, data) => {
    data = JSON.parse(data);
    let index = -1;
    if (options?.payload) {
      index = data.findIndex((item) => item.payload.includes(options.payload));
    } else {
      index = data.findIndex((item) => item.body.from === ctx.from.id);
    }
    callback(index, data[index]);
  });
}

module.exports = {
  addSession,
  removeSession,
  browseSessions,
};
