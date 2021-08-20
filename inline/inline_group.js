const { Markup } = require("telegraf");
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
    [b("لیست مسدود شده ها", `lockVoice ${groupId}`)],
    [b("مسدود کردن", `lockVoice ${groupId}`)],
    [b("حذف از مسدودیت", `lockVoice ${groupId}`)],
    [b("مسدود کردن از همه گروه ها", `lockVoice ${groupId}`)],
    [b("تنظیم پیغام هشدار", `lockVoice ${groupId}`)],
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

//alert darim
//ersal msg be user darim
//masdodiat darim

module.exports = inlineGroup;
