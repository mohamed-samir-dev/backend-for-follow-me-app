import cron from "node-cron";
import Project from "./models/Project.js";
import Service from "./models/Service.js";
import Backup from "./models/Backup.js";
import { sendWhatsApp } from "./whatsapp.js";

const DAYS = 7;

function daysLeft(date) {
  return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
}

async function checkAndNotify() {
  const now = new Date();
  const limit = new Date(now.getTime() + DAYS * 24 * 60 * 60 * 1000);

  const backupLimit = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  const [maintenance, domains, services, backups] = await Promise.all([
    Project.find({ maintenanceEndDate: { $gte: now, $lte: limit } }),
    Project.find({ renewalDate: { $gte: now, $lte: limit } }),
    Service.find({ renewalDate: { $gte: now, $lte: limit } }),
    Backup.find({ done: false, backupDate: { $gte: now, $lte: backupLimit } }),
  ]);

  if (!maintenance.length && !domains.length && !services.length && !backups.length) return;

  let msg = `🔔 *تنبيهات مواعيد قادمة*\n\n`;

  if (maintenance.length) {
    msg += `🛠️ *صيانة مشاريع:*\n`;
    maintenance.forEach((p) => {
      const d = daysLeft(p.maintenanceEndDate);
      msg += `• ${p.projectName} (${p.clientName}) — بعد ${d} يوم\n`;
    });
    msg += "\n";
  }

  if (domains.length) {
    msg += `🌐 *تجديد دومينات:*\n`;
    domains.forEach((p) => {
      const d = daysLeft(p.renewalDate);
      msg += `• ${p.domain || p.projectName} (${p.clientName}) — بعد ${d} يوم\n`;
    });
    msg += "\n";
  }

  if (services.length) {
    msg += `⚙️ *تجديد خدمات:*\n`;
    services.forEach((s) => {
      const d = daysLeft(s.renewalDate);
      msg += `• ${s.name} (${s.type}) — بعد ${d} يوم\n`;
    });
    msg += "\n";
  }

  if (backups.length) {
    msg += `💾 *مواعيد باك اب:*\n`;
    backups.forEach((b) => {
      const d = daysLeft(b.backupDate);
      const label = d === 0 ? "⚠️ اليوم!" : `بعد ${d} يوم`;
      msg += `• ${b.title} — ${label}\n`;
    });
  }

  await sendWhatsApp(msg);
  console.log("📨 تم إرسال تنبيه الواتساب");
}

// كل يوم الساعة 9 الصبح
export const startScheduler = () => {
  cron.schedule("0 9 * * *", checkAndNotify, { timezone: "Africa/Cairo" });
  console.log("⏰ Scheduler شغال - تنبيهات كل يوم 9 صباحاً");
};
