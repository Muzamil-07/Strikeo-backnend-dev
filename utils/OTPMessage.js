const { sendTextMessage } = require("./gupshup");
const {
  createResetPasswordVerificationMessage,
  createVerificationCodeMessage,
} = require("./message");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = require("twilio")(accountSid, authToken);

exports.sendOtpMessage = async (phoneNumber, otp) => {
  const whatsappNumber = "whatsapp:+14155238886"; // Twilio WhatsApp number
  const smsNumber = "+14155238886"; // Twilio SMS number
  const messageBody = `Your OTP is: ${otp}. Please do not share it with anyone.`;

  try {
    // First try sending the OTP via WhatsApp
    const whatsappMessage = await twilioClient.messages.create({
      body: messageBody,
      from: whatsappNumber,
      to: `whatsapp:${phoneNumber}`,
    });
    console.log(whatsappMessage.sid, "OTP sent successfully via WhatsApp!");
  } catch (whatsappError) {
    console.error(
      whatsappError,
      "Failed to send OTP via WhatsApp. Attempting to send via SMS..."
    );

    try {
      // Fallback to SMS if WhatsApp fails
      const smsMessage = await twilioClient.messages.create({
        body: messageBody,
        from: smsNumber,
        to: phoneNumber,
      });
      console.log(smsMessage.sid, "OTP sent successfully via SMS!");
    } catch (smsError) {
      console.error(smsError, "Failed to send OTP via both WhatsApp and SMS.");
    }
  }
};

/**
 * Sends an OTP via Gupshup's WhatsApp API.
 * @param {string} phoneNumber - The recipient's phone number in international format.
 * @param {string} otp - The OTP to send.
 */
exports.sendOtpResetPaswdMessageViaGupshup = async (phoneNumber, otp) => {
  try {
    const messageBody = createResetPasswordVerificationMessage(otp);

    await sendTextMessage({
      recipient: phoneNumber,
      text: messageBody,
    });
    console.log("OTP sent successfully via Gupshup WhatsApp!");
  } catch (error) {
    console.error("Failed to send OTP via Gupshup WhatsApp:", error);
    throw new Error("Failed to send OTP via Gupshup WhatsApp.");
  }
};
exports.sendVerificationOtpViaGupshup = async (phoneNumber, otp) => {
  try {
    const messageBody = createVerificationCodeMessage(otp);

    await sendTextMessage({
      recipient: phoneNumber,
      text: messageBody,
    });
    console.log("Verification OTP sent successfully via Gupshup WhatsApp!");
  } catch (error) {
    console.error(
      "Failed to send Verification OTP via Gupshup WhatsApp:",
      error
    );
    throw new Error("Failed to send Verification OTP via Gupshup WhatsApp.");
  }
};
