const { Markup } = require("telegraf");
const bot = require("../config/requires");
const {
  viewBanUsers,
  banUserSession,
  viewBanUsersAll,
  clearBanList,
  clearBanListAll,
} = require("../dist/ban");
const {
  getAndModifyGroupLocks,
  getGroupInviteLink,
  changeGroupInviteLink,
} = require("../dist/group");
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
  let groupKeys = [
    [b("بازگشت", `backToHome`)],
    [b("مسدودها ⭕️", `bans`)],
    [b("قفل گروه 🔒", `lockGroup`)],
    [b("گروه 👥", `group`)],
  ];
  let group = getAndModifyGroupLocks(
    ctx,
    Method?.key,
    Method?.value,
    Method.rule
  );
  const locks = group?.locks;
  const rules = group?.rules;
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
      b("قفل افزودن کاربر", `lockAddUser`),
      b(lock(locks?.addUser), `lockAddUser`),
    ].reverse(),
  ];
  let inlineGroupManage = [
    [b("بازگشت", `backToHome`)],
    [b("تنظیم پیغام خوش آمد گویی", `setWelcomeMessage`)],
    [
      b("پیغام عضویت", `deleteJoinMsg`),
      b(lock(rules?.joinMessage), `deleteJoinMsg`),
    ].reverse(),
    [b("تغییر تصویر گروه", `groupChangeImage`)],
    [b("تغییر نام گروه", `groupChangeName`)],
    [b("تغییر بیو گروه", `groupChangeBio`)],
    [b("دریافت لینک گروه", `groupGetInviteLink`)],
    [b("تغییر لینک گروه", `groupChangeInviteLink`)],
    [
      b("تایید دومرحله اعضا", `verifyNewUsers`),
      b(lock(rules?.verify), `verifyNewUsers`),
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
  const rules = group?.rules;
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
      inline_keyboard: inlineGroup(ctx, {
        key: "full",
        value: !locks.full,
        rule: false,
      }).inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "timingLockGroup") {
  } else if (key === "enableFilters") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, {
        key: "filter",
        value: !locks.filter,
        rule: false,
      }).inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "lockMessage") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, {
        key: "message",
        value: !locks.message,
        rule: false,
      }).inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "lockVoice") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, {
        key: "voice",
        value: !locks.voice,
        rule: false,
      }).inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "lockVideo") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, {
        key: "video",
        value: !locks.video,
        rule: false,
      }).inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "lockPhoto") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, {
        key: "photo",
        value: !locks.photo,
        rule: false,
      }).inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "lockFile") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, {
        key: "file",
        value: !locks.file,
        rule: false,
      }).inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "lockSticker") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, {
        key: "sticker",
        value: !locks.sticker,
        rule: false,
      }).inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "lockGif") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, {
        key: "gif",
        value: !locks.gif,
        rule: false,
      }).inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "lockAddUser") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, {
        key: "addUser",
        value: !locks.addUser,
        rule: false,
      }).inlineGroupLocks.reply_markup.inline_keyboard,
    });
  } else if (key === "setWelcomeMessage") {
    addSession(
      {
        from: ctx.from.id,
      },
      "setWelcomeMsg"
    );
    ctx.reply(`شما میتونید برای اعضای جدید گروه پیغام خوش آمد گویی درنظر بگیرید بصورت پیشفرض این غیر فعال می باشد.
همچنین می توانید برای اشاره به کاربر در پیام خود از واژه های زیر استفاده کنید:
FIRST_NAME
USERNAME
و برای اشاره به نام گروه میتوانید از واژه زیر استفاده کنید:
GROUP_NAME

به عنوان مثال: 
سلام FIRST_NAME به گروه GROUP_NAME خوش اومدی.

برای غیر فعال کردن کافیه که پیغام خوش آمد گویی رو خالی تنظیم کنید.
    `);
  } else if (key === "deleteJoinMsg") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, {
        key: "joinMessage",
        value: !rules.joinMessage,
        rule: true,
      }).inlineGroupManage.reply_markup.inline_keyboard,
    });
  } else if (key === "groupChangeImage") {
    addSession(
      {
        from: ctx.from.id,
      },
      "groupChangeImage"
    );
    ctx.reply("تصویر خود را ارسال کنید قربان");
  } else if (key === "groupChangeName") {
    addSession(
      {
        from: ctx.from.id,
      },
      "groupChangeName"
    );
    ctx.reply("نام جدید گروه را ارسال کنید قربان");
  } else if (key === "groupChangeBio") {
    addSession(
      {
        from: ctx.from.id,
      },
      "groupChangeBio"
    );
    ctx.reply("بیوی جدید گروه را ارسال کنید قربان");
  } else if (key === "groupGetInviteLink") {
    getGroupInviteLink(ctx);
  } else if (key === "groupChangeInviteLink") {
    changeGroupInviteLink(ctx);
  } else if (key === "verifyNewUsers") {
    ctx.editMessageReplyMarkup({
      inline_keyboard: inlineGroup(ctx, {
        key: "verify",
        value: !rules?.verify,
        rule: true,
      }).inlineGroupManage.reply_markup.inline_keyboard,
    });
  }
}

module.exports = { inlineGroup, inlineGroupAction };
