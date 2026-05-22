import cron from "node-cron";
import Project from "./models/Project.js";
import Service from "./models/Service.js";
import Backup from "./models/Backup.js";
import Note from "./models/Note.js";
import { sendWhatsApp } from "./whatsapp.js";

const NOTIFY_DAYS = [0, 1, 2, 3, 4, 5];

function daysLeft(date) {
  return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
}

function inNotifyDays(date) {
  return NOTIFY_DAYS.includes(daysLeft(date));
}

async function checkAndNotify() {
  const now = new Date();
  const limit = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

  const [maintenance, domains, services, backups] = await Promise.all([
    Project.find({ maintenanceEndDate: { $gte: now, $lte: limit } }),
    Project.find({ renewalDate: { $gte: now, $lte: limit } }),
    Service.find({ renewalDate: { $gte: now, $lte: limit } }),
    Backup.find({ done: false, backupDate: { $gte: now, $lte: limit } }),
  ]);

  // Notes with reminder due today
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);
  const dueNotes = await Note.find({ notified: false, reminderDate: { $gte: startOfDay, $lte: endOfDay } });

  const filteredMaintenance = maintenance.filter((p) => inNotifyDays(p.maintenanceEndDate));
  const filteredDomains = domains.filter((p) => inNotifyDays(p.renewalDate));
  const filteredServices = services.filter((s) => inNotifyDays(s.renewalDate));
  const filteredBackups = backups.filter((b) => inNotifyDays(b.backupDate));

  if (!filteredMaintenance.length && !filteredDomains.length && !filteredServices.length && !filteredBackups.length && !dueNotes.length) return;

  let msg = `🔔 *تنبيهات مواعيد قادمة*\n\n`;

  if (filteredMaintenance.length) {
    msg += `🛠️ *صيانة مشاريع:*\n`;
    filteredMaintenance.forEach((p) => {
      const d = daysLeft(p.maintenanceEndDate);
      msg += `• ${p.projectName} (${p.clientName}) — ${d === 0 ? "⚠️ اليوم!" : `بعد ${d} يوم`}\n`;
    });
    msg += "\n";
  }

  if (filteredDomains.length) {
    msg += `🌐 *تجديد دومينات:*\n`;
    filteredDomains.forEach((p) => {
      const d = daysLeft(p.renewalDate);
      msg += `• ${p.domain || p.projectName} (${p.clientName}) — ${d === 0 ? "⚠️ اليوم!" : `بعد ${d} يوم`}\n`;
    });
    msg += "\n";
  }

  if (filteredServices.length) {
    msg += `⚙️ *تجديد خدمات:*\n`;
    filteredServices.forEach((s) => {
      const d = daysLeft(s.renewalDate);
      msg += `• ${s.name} (${s.type}) — ${d === 0 ? "⚠️ اليوم!" : `بعد ${d} يوم`}\n`;
    });
    msg += "\n";
  }

  if (filteredBackups.length) {
    msg += `💾 *مواعيد باك اب:*\n`;
    filteredBackups.forEach((b) => {
      const d = daysLeft(b.backupDate);
      msg += `• ${b.title} — ${d === 0 ? "⚠️ اليوم!" : `بعد ${d} يوم`}\n`;
    });
    msg += "\n";
  }

  if (dueNotes.length) {
    msg += `📝 *تذكير ملاحظات:*\n`;
    dueNotes.forEach((n) => { msg += `• ${n.text}\n`; });
    await Note.updateMany({ _id: { $in: dueNotes.map((n) => n._id) } }, { notified: true });
  }

  await sendWhatsApp(msg);
  console.log("📨 تم إرسال تنبيه الواتساب");
}

// كل يوم الساعة 9 الصبح
export const startScheduler = () => {
  cron.schedule("0 9 * * *", checkAndNotify, { timezone: "Africa/Cairo" });
  console.log("⏰ Scheduler شغال - تنبيهات كل يوم 9 صباحاً");
};
