const cron = require("node-cron");
const { ensureToken } = require("./process");

const schedulePathaoTokenCheckJob = () => {
  // Schedule the cron job to run every 24 hours
  cron.schedule(
    "0 0 * * *",
    async () => {
      console.log("Running cron job to ensure Pathao token validity...");
      await ensureToken();
    },
    { name: "Ensure Pathao Token Validity" }
  );

  console.log("Cron job scheduled => Ensure Pathao Token Validity");
};

module.exports = schedulePathaoTokenCheckJob;
