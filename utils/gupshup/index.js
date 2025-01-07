const message = require("./message");

module.exports = {
  sendTextMessage: message.sendTextMessage,
  sendMediaMessage: message.sendMediaMessage,
  getMessageStatus: message.getMessageStatus,
  listTemplates: message.listTemplates,
};
