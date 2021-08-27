const { Markup } = require("telegraf");
const fs = require("fs");
const bot = require("../config/requires");
function getSessionPromoteAccess(ctx, key, value) {
  let sspr = fs.readFileSync("data/session.promote.json", "utf8");
  sspr = JSON.parse(sspr);
  const index = sspr.findIndex(
    (item) =>
      item.chat === ctx.chat?.id &&
      item.messageId.slice(-1)[0] ===
        ctx.update?.callback_query?.message?.message_id &&
      item.from === ctx.update?.callback_query?.from?.id
  );
  //   console.log(sspr);
  let access = sspr[index]?.access;
  if (key && value !== undefined) {
    sspr[index].access[key] = value;
    fs.writeFileSync("data/session.promote.json", JSON.stringify(sspr));
  }
  return { access, target: sspr[index]?.target };
}
async function deleteSessionPromote(ctx) {
  if (ctx.chat.type !== "supergroup") return;
  const admins = await ctx.getChatAdministrators(ctx.chat.id);
  if (admins.filter((admin) => admin.user.id !== ctx.from.id).length === 0) {
    ctx.reply(`کاربر ${ctx.from.id} شما ادمین نیستی.`);
    return;
  }
  let sspr = fs.readFileSync("data/session.promote.json", "utf8");
  sspr = JSON.parse(sspr);
  console.log(sspr);
  sspr = sspr.map((item) => {
    if (
      item?.chat !== ctx.chat?.id &&
      item?.messageId.slice(-1)[0] !==
        ctx.update?.callback_query?.message?.message_id &&
      item?.from !== ctx.update?.callback_query?.from?.id
    )
      return item;
    else {
      item.messageId.map((msgId) => {
        bot.telegram.deleteMessage(ctx.chat.id, msgId);
      });
    }
  });
  if (sspr[0] === undefined) sspr = [];
  fs.writeFileSync("data/session.promote.json", JSON.stringify(sspr ?? []));
}
function inlineNewAdmin(ctx, a, accessKey, value) {
  const access = a ? a : getSessionPromoteAccess(ctx, accessKey, value).access;
  let lock = (lock) => {
    return lock ? "✅" : "❌";
  };

  let newAdmin = Markup.inlineKeyboard([
    [
      Markup.button.callback("ناشناس بودن", "is_anonymous"),
      Markup.button.callback(lock(access?.is_anonymous), "is_anonymous"),
    ].reverse(),
    [
      Markup.button.callback("تغییر اطلاعات گروه", "can_change_info"),
      Markup.button.callback(lock(access?.can_change_info), "can_change_info"),
    ].reverse(),
    [
      Markup.button.callback("حذف پیام ها", "can_delete_messages"),
      Markup.button.callback(
        lock(access?.can_delete_messages),
        "can_delete_messages"
      ),
    ].reverse(),
    [
      Markup.button.callback("افزودن کاربر جدید", "can_invite_users"),
      Markup.button.callback(
        lock(access?.can_invite_users),
        "can_invite_users"
      ),
    ].reverse(),
    [
      Markup.button.callback("مدیریت چت", "can_manage_chat"),
      Markup.button.callback(lock(access?.can_manage_chat), "can_manage_chat"),
    ].reverse(),
    [
      Markup.button.callback("مدیریت چت صدا", "can_manage_voice_chats"),
      Markup.button.callback(
        lock(access?.can_manage_voice_chats),
        "can_manage_voice_chats"
      ),
    ].reverse(),
    [
      Markup.button.callback("محدود کردن اعضا", "can_restrict_members"),
      Markup.button.callback(
        lock(access?.can_restrict_members),
        "can_restrict_members"
      ),
    ].reverse(),
    [
      Markup.button.callback("ارتقاء اعضا", "can_promote_members"),
      Markup.button.callback(
        lock(access?.can_promote_members),
        "can_promote_members"
      ),
    ].reverse(),
    [
      Markup.button.callback("پین کردن پیام", "can_pin_messages"),
      Markup.button.callback(
        lock(access?.can_pin_messages),
        "can_pin_messages"
      ),
    ].reverse(),
    [Markup.button.callback("تایید", "promoteToAdmin")],
    [Markup.button.callback("لغو", "cancelPromote")],
  ]);
  return newAdmin;
}

const handlePromote = async (ctx) => {
  if (ctx.chat.type !== "supergroup") return;
  const admins = await ctx.getChatAdministrators(ctx.chat.id);
  if (admins.filter((admin) => admin.user.id !== ctx.from.id).length === 0) {
    ctx.reply(`کاربر ${ctx.from.id} شما ادمین نیستی.`);
    return;
  }
  const { target, access } = await getSessionPromoteAccess(ctx);
  const user = await bot.telegram.getChat(target);
  let hasPromoted = await bot.telegram.promoteChatMember(
    ctx.chat.id,
    target,
    access
  );
  if (hasPromoted) {
    ctx.reply(`کاربر ${user.first_name} با آیدی ${target} مدیر گروه شد.`);
    deleteSessionPromote(ctx);
  }
  ctx.reply("وای! خطایی رخ داده قربان لطفا بعدا امتحان کنید.");
};

function inlineNewAdminAction(ctx) {
  const key = ctx.match[0];
  //!check user has admin
  let { access, target } = getSessionPromoteAccess(ctx);
  if (key === "promoteToAdmin") {
    handlePromote(ctx);
  } else if (key === "cancelPromote") {
    deleteSessionPromote(ctx);
  }
  Object.keys(access).forEach((accessKey) => {
    if (key.includes(accessKey)) {
      ctx.editMessageReplyMarkup({
        inline_keyboard: inlineNewAdmin(
          ctx,
          false,
          accessKey,
          !access[accessKey]
        ).reply_markup.inline_keyboard,
      });
    }
  });
}

module.exports = { inlineNewAdmin, inlineNewAdminAction };
