export const sendWhatsApp = async (message) => {
  const phone = process.env.WHATSAPP_NUMBER;
  const apikey = process.env.CALLMEBOT_APIKEY;
  const text = encodeURIComponent(message);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${text}&apikey=${apikey}`;
  await fetch(url);
};
