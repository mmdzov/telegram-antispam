const { Markup } = require("telegraf");
const { callback: b } = Markup.button;

let inlineMain = Markup.inlineKeyboard([
  [b("تنظیمات ⚙️", "settings")],
  [b("مدیریت 👮🏻‍♂", "panel")],
  // [b("خودکار 🤖", "automate")],
  // [b("آنالیز 📊", "analysis")],
]);

module.exports = inlineMain;
