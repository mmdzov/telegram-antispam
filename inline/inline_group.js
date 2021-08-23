const { Markup } = require("telegraf");
const {
  viewBanUsers,
  banUserSession,
  viewBanUsersAll,
  clearBanList,
  clearBanListAll,
} = require("../dist/ban");
const { callback: b } = Markup.button;

const inlineGroup = (groupId = "") => {
  let inlineGroupLocks = [
    [b("بازگشت", `backToHome`)],
    [
      b("قفل کامل", `fullLockGroup ${groupId}`),
      b("❌", `fullLockGroup ${groupId}`),
    ],
    [
      b("اعمال فیلترها", `enableFilters ${groupId}`),
      b("✅", `enableFilters ${groupId}`),
    ],
    [
      b("قفل پیام", `lockMessage ${groupId}`),
      b("✅", `lockMessage ${groupId}`),
    ],
    [b("قفل ویس", `lockVoice ${groupId}`), b("❌", `lockVoice ${groupId}`)],
    [b("قفل رسانه", `lockMedia ${groupId}`), b("❌", `lockMedia ${groupId}`)],
    [b("قفل فایل", `lockFile ${groupId}`), b("❌", `lockFile ${groupId}`)],
    [
      b("محدودیت ارسال", `limitSend ${groupId}`),
      b("10", `limitSend ${groupId}`),
    ],
    [
      b("قفل افزودن کاربر", `lockAddUser ${groupId}`),
      b("❌", `lockAddUser ${groupId}`),
    ],
  ];

  let inlineGroupManageBans = [
    [b("بازگشت", `backToHome`)],
    [b("لیست مسدود شده ها", `viewBanList`)],
    [b("لیست مسدود همه گروه ها", `viewBanListAll`)],
    [b("پاکسازی لیست مسدود", `clearBanList`)],
    [b("پاکسازی لیست مسدود همه گروه ها", `clearBanListAll`)],
    [b("مسدود کردن", `banUser`)],
    [b("مسدود کردن از همه گروه ها", `banallUser`)],
    [b("حذف از مسدودیت", `unban`)],
    [b("حذف مسدود از همه گروه ها", `unbanallUser`)],
  ];

  let inlineGroupManage = [
    [b("بازگشت", `backToHome`)],
    [b("تنظیم پیغام خوش آمد گویی", `lockVoice ${groupId}`)],
    [b("پاک کردن پیغام عضویت", `lockVoice ${groupId}`)],
    [b("پاک کردن پیغام تغییر تصویر", `lockVoice ${groupId}`)],
    [b("پاک کردن پیغام تغییر نام", `lockVoice ${groupId}`)],
    [b("افزودن تصویر گروه", `lockVoice ${groupId}`)],
    [b("افزودن نام گروه", `lockVoice ${groupId}`)],
    [b("افزودن بیو گروه", `lockVoice ${groupId}`)],
    [b("حذف نام گروه", `lockVoice ${groupId}`)],
    [b("دریافت لینک گروه", `lockVoice ${groupId}`)],
    [b("تغییر لینک گروه", `lockVoice ${groupId}`)],
    [b("تغییر لینک گروه", `lockVoice ${groupId}`)],
  ];
  let groupKeys = [
    [b("بازگشت", `backToHome`)],
    [b("مسدودها ⭕️", `bans`)],
    [b("قفل گروه 🔒", `lockGroup`)],
    [b("گروه 👥", `group`)],
  ];
  return {
    groupKeys: Markup.inlineKeyboard(groupKeys),
    inlineGroupLocks: Markup.inlineKeyboard(inlineGroupLocks),
    inlineGroupManageBans: Markup.inlineKeyboard(inlineGroupManageBans),
    inlineGroupManage: Markup.inlineKeyboard(inlineGroupManage),
  };
};

function inlineGroupAction(ctx) {
  const key = ctx.match[0];
  if (key === "viewBanList") {
    viewBanUsers(ctx);
  } else if (key === "viewBanListAll") {
    viewBanUsersAll(ctx);
  } else if (key === "clearBanList") {
    clearBanList(ctx);
  } else if (key === "clearBanListAll") {
    clearBanListAll(ctx);
  } else if (key === "unban") {
    banUserSession(
      ctx,
      {
        from: ctx.from.id,
      },
      "unbanUser",
      ["banallUser", "banUser", "unbanallUser"]
    );
    ctx.reply(
      "قربان! کافیه پیامشو فوروارد کنی همینجا یا آیدی عددیشو برام بفرستی."
    );
  } else if (key === "banUser") {
    banUserSession(
      ctx,
      {
        from: ctx.from.id,
      },
      "banUser",
      ["banallUser", "unbanUser", "unbanallUser"]
    );
    ctx.reply(
      "قربان! کافیه پیامشو فوروارد کنی همینجا یا آیدی عددیشو برام بفرستی."
    );
  } else if (key === "banallUser") {
    banUserSession(
      ctx,
      {
        from: ctx.from.id,
      },
      "banallUser",
      ["unbanUser", "banUser", "unbanallUser"]
    );
    ctx.reply(
      "قربان! کافیه پیامشو فوروارد کنی همینجا یا آیدی عددیشو برام بفرستی."
    );
  } else if (key === "unbanallUser") {
    banUserSession(
      ctx,
      {
        from: ctx.from.id,
      },
      "unbanallUser",
      ["unbanUser", "banUser", "banallUser"]
    );
    ctx.reply(
      "قربان! کافیه پیامشو فوروارد کنی همینجا یا آیدی عددیشو برام بفرستی."
    );
  }
}

//alert darim
//ersal msg be user darim
//masdodiat darim

module.exports = { inlineGroup, inlineGroupAction };
