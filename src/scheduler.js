import cron from "node-cron";
import Project from "./models/Project.js";
import Service from "./models/Service.js";
import { sendWhatsApp } from "./whatsapp.js";

const DAYS = 7;

function daysLeft(date) {
  return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
}

async function checkAndNotify() {
  const now = new Date();
  const limit = new Date(now.getTime() + DAYS * 24 * 60 * 60 * 1000);

  const [projects, services] = await Promise.all([
    Project.find({ maintenanceEndDate: { $gte: now, $lte: limit } }),
    Service.find({ renewalDate: { $gte: now, $lte: limit } }),
  ]);

  if (!projects.length && !services.length) return;

  let msg = `🔔 *تنبيهات مواعيد قادمة*\n\n`;

  if (projects.length) {
    msg += `🛠️ *صيانة مشاريع:*\n`;
    projects.forEach((p) => {
      const d = daysLeft(p.maintenanceEndDate);
      msg += `• ${p.projectName} (${p.clientName}) — بعد ${d} يوم\n`;
    });
    msg += "\n";
  }

  if (services.length) {
    msg += `⚙️ *تجديد خدمات:*\n`;
    services.forEach((s) => {
      const d = daysLeft(s.renewalDate);
      msg += `• ${s.name} (${s.type}) — بعد ${d} يوم\n`;
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
