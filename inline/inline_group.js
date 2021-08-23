const { Markup } = require("telegraf");
const bot = require("../config/requires");
const {
  viewBanUsers,
  banUserSession,
  viewBanUsersAll,
  clearBanList,
  clearBanListAll,
} = require("../dist/ban");
const { getAndModifyGroupLocks } = require("../dist/group");
const { addSession, removeSession } = require("../utils/util_session");
const { callback: b } = Markup.button;

const inlineGroup = (ctx, Method = {}) => {
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
    [b("تنظیم پیغام خوش آمد گویی", `lockVoice`)],
    [b("پاک کردن پیغام عضویت", `lockVoice`)],
    [b("پاک کردن پیغام تغییر تصویر", `lockVoice`)],
    [b("پاک کردن پیغام تغییر نام", `lockVoice`)],
    [b("افزودن تصویر گروه", `lockVoice`)],
    [b("افزودن نام گروه", `lockVoice`)],
    [b("حذف نام گروه", `lockVoice`)],
    [b("افزودن بیو گروه", `lockVoice`)],
    [b("دریافت لینک گروه", `lockVoice`)],
    [b("تغییر لینک گروه", `lockVoice`)],
    [b("تغییر لینک گروه", `lockVoice`)],
  ];
  let groupKeys = [
    [b("بازگشت", `backToHome`)],
    [b("مسدودها ⭕️", `bans`)],
    [b("قفل گروه 🔒", `lockGroup`)],
    [b("گروه 👥", `group`)],
  ];
  let group = getAndModifyGroupLocks(ctx, Method?.key, Method?.value);
  const locks = group?.locks;
  let lock = (lock) => {
    return lock ? "✅" : "❌";
  };
  if (Method?.key) {
    if (Method?.key === "full") {
      //preview full-lock
      for (let i in group?.locks) {
        if (typeof group?.locks[i] === "boolean") {
          group.locks[i] = Method.value;
        }
      }
    } else {
      locks[Method?.key] = Method?.value;
    }
  }
  let inlineGroupLocks = [
    [b("بازگشت", `backToHome`)],
    [
      b("قفل کامل", `fullLockGroup`),
      b(lock(locks?.full), `fullLockGroup`),
    ].reverse(),
    [
      b("قفل خودکار", `timingLockGroup`),
      b(lock(locks?.auto?.hasEnabled), `timingLockGroup`),
    ].reverse(),
    [
      b("اعمال فیلترها", `enableFilters`),
      b(lock(locks?.filter), `enableFilters`),
    ].reverse(),
    [
      b("قفل پیام", `lockMessage`),
      b(lock(locks?.message), `lockMessage`),
    ].reverse(),
    [b("قفل ویس", `lockVoice`), b(lock(locks?.voice), `lockVoice`)].reverse(),
    [b("قفل گیف", `lockGif`), b(lock(locks?.gif), `lockGif`)].reverse(),
    [b("قفل تصویر", `lockPhoto`), b(lock(locks?.photo), `lockPhoto`)].reverse(),
    [b("قفل ویدیو", `lockVideo`), b(lock(locks?.video), `lockVideo`)].reverse(),
    [b("قفل فایل", `lockFile`), b(lock(locks?.file), `lockFile`)].reverse(),
    [
      b("قفل استیکر", `lockSticker`),
      b(lock(locks?.sticker), `lockSticker`),
    ].reverse(),
    [
      b("محدودیت ارسال", `limitSend`),
      b(locks?.limitSend, `limitSend`),
    ].reverse(),
    [
      b("قفل افزودن کاربر", `lockAddUser`),
      b(lock(locks?.addUser), `lockAddUser`),
    ].reverse(),
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
  let group = getAndModifyGroupLocks(ctx);
  const locks = group?.locks;
  let message =
    "قربان! کافیه پیامشو فوروارد کنی همینجا یا آیدی عددیشو برام بفرستی.";
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
    ctx.reply(message);
  } else if (key === "banUser") {
    banUserSession(
      ctx,
      {
        from: ctx.from.id,
      },
      "banUser",
      ["banallUser", "unbanUser", "unbanallUser"]
    );
    ctx.reply(message);
  } else if (key === "banallUser") {
    banUserSession(
      ctx,
      {
        from: ctx.from.id,
      },
      "banallUser",
      ["unbanUser", "banUser", "unbanallUser"]
    );
    ctx.reply(message);
  } else if (key === "unbanallUser") {
    banUserSession(
      ctx,
      {
        from: ctx.from.id,
      },
      "unbanallUser",
      ["unbanUser", "banUser", "banallUser"]
    );
    ctx.reply(message);
  } else if (key === "fullLockGroup") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, { key: "full", value: !locks.full })
        .inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "timingLockGroup") {
  } else if (key === "enableFilters") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, { key: "filter", value: !locks.filter })
        .inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "lockMessage") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, {
        key: "message",
        value: !locks.message,
      }).inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "lockVoice") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, { key: "voice", value: !locks.voice })
        .inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "lockVideo") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, { key: "video", value: !locks.video })
        .inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "lockPhoto") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, { key: "photo", value: !locks.photo })
        .inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "lockFile") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, { key: "file", value: !locks.file })
        .inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "lockSticker") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, {
        key: "sticker",
        value: !locks.sticker,
      }).inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "lockGif") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, {
        key: "gif",
        value: !locks.gif,
      }).inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "limitSend") {
    addSession(
      {
        from: ctx.from.id,
        message_id: ctx.update.callback_query?.message.message_id,
        inlineMessageId: ctx.inlineMessageId,
        chatId: group.chatId,
      },
      "limitSend"
    );
    ctx.reply(`تعداد محدودیت ارسال پیغام را وارد کنید.
این کار برای جلوگیری از اسپم در گروه صورت میگیره.
تعداد پیشفرض 10 هست یعنی اگه کاربر ده پیغام پشت سر همدیگر با اختلاف زمانی کوتاه ارسال کند مسدود میشود`);
  } else if (key === "lockAddUser") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, {
        key: "addUser",
        value: !locks.addUser,
      }).inlineGroupLocks.reply_markup.inline_keyboard,
    });
  }
}

//alert darim
//ersal msg be user darim
//masdodiat darim

module.exports = { inlineGroup, inlineGroupAction };
