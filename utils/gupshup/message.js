const fetchRequest = require("./api");
const {
  validatePhoneNumber,
  validateString,
  validateUrl,
} = require("./validators");

const GUPSHUP_APP_NAME = process.env.GUPSHUP_APP_NAME;
const GUPSHUP_APP_PHONE_NUMBER = process.env.GUPSHUP_APP_PHONE_NUMBER;

// Send a text message
const sendTextMessage = async ({ recipient, text, previewUrl = false }) => {
  validatePhoneNumber(recipient);
  validateString(text, "text");

  const body = new URLSearchParams();
  body.append("channel", "whatsapp");
  body.append("source", GUPSHUP_APP_PHONE_NUMBER?.replace("+", ""));
  body.append("src.name", GUPSHUP_APP_NAME);
  body.append("destination", recipient?.replace("+", ""));
  body.append(
    "message",
    JSON.stringify({
      type: "text",
      text,
      previewUrl,
    })
  );

  return fetchRequest("/msg", "POST", body);
};

// Send a media message
const sendMediaMessage = async ({ recipient, mediaUrl, caption }) => {
  validatePhoneNumber(recipient);
  validateUrl(mediaUrl);
  if (caption) validateString(caption, "caption");

  const body = new URLSearchParams();
  body.append("channel", "whatsapp");
  body.append("source", GUPSHUP_APP_PHONE_NUMBER);
  body.append("src.name", GUPSHUP_APP_NAME);
  body.append("destination", recipient);
  body.append(
    "message",
    JSON.stringify({
      type: "media",
      media: {
        url: mediaUrl,
        caption,
      },
    })
  );

  return fetchRequest("/msg", "POST", body);
};

// Get message status
const getMessageStatus = async ({ messageId }) => {
  validateString(messageId, "messageId");

  return fetchRequest(`/msg/${messageId}/status`, "GET");
};

// List all templates
const listTemplates = async () => {
  return fetchRequest("/templates", "GET");
};

module.exports = {
  sendTextMessage,
  sendMediaMessage,
  getMessageStatus,
  listTemplates,
};
