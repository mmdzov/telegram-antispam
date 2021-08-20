const { Markup } = require("telegraf");
let { callback: b } = Markup.button;

const inlineAnalysis = (groupId = "") => {
  return Markup.inlineKeyboard([
    [b("بازگشت", "backToHome")],
    [b("گزارش امروز", `reportToday ${groupId}`)],
    [b("گزارش هفتگی", `reportWeekly ${groupId}`)],
    [b("گزارش ماهانه", `reportMonthly ${groupId}`)],
    [b("آمار روزانه", `statisticsToday ${groupId}`)],
    [b("آمار هفتگی", `statisticsWeekly ${groupId}`)],
    [b("آمار ماهانه", `statisticsMonthly ${groupId}`)],
  ]);
};

module.exports = inlineAnalysis;
