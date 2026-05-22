import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const { Client, LocalAuth } = pkg;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { args: ["--no-sandbox", "--disable-setuid-sandbox"] },
});

client.on("qr", (qr) => {
  console.log("\n📱 امسح الـ QR Code بالواتساب:\n");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => console.log("✅ واتساب متصل!"));
client.on("auth_failure", () => console.error("❌ فشل تسجيل الدخول للواتساب"));

client.initialize();

export const sendWhatsApp = async (message) => {
  const number = process.env.WHATSAPP_NUMBER; // مثال: 201xxxxxxxxx
  const chatId = `${number}@c.us`;
  await client.sendMessage(chatId, message);
};
