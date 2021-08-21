const fs = require("fs");
const {
  viewUserFilter,
  addFilter,
  removeFilter,
} = require("../utils/util_setting");

function commandFilter(bot) {
  //add filter
  bot.command("filter", async (ctx) => {
    addFilter(ctx);
  });

  //delete filter
  bot.command("unfilter", async (ctx) => {
    removeFilter(ctx);
  });

  //view filters
  bot.command("filters", (ctx) => {
    viewUserFilter(ctx);
  });
}

module.exports = commandFilter;
