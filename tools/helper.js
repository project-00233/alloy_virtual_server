const fs = require("fs");
const path = require("path");

const decryptKey = (key) => {};
// Api key
// key
// random char => 10char-15char-10char
// key => x = 8chars
// key => 10char <- x=2char, 15char <- x=4char, 10char <- x=2char

const log_sb_api_error = (errorMessage) => {
  const logDir = path.join(__dirname, "..", "logs");

  const logPath = path.join(logDir, "sbApiErrors.log");
  const logEntry = `[${new Date().toISOString()}] ERROR: ${errorMessage}\n`;

  // Ensure the "logs" directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true }); // Create "logs" directory if it doesn't exist
  }

  fs.appendFile(logPath, logEntry, (err) => {
    if (err) console.error("Failed to write error log:", err);
  });
};

const log_notifyError = (errorMessage) => {
  const logDir = path.join(__dirname, "..", "logs");

  const logPath = path.join(logDir, "notificationErrors.log");
  const logEntry = `[${new Date().toISOString()}] ERROR: ${errorMessage}\n`;

  // Ensure the "logs" directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true }); // Create "logs" directory if it doesn't exist
  }

  fs.appendFile(logPath, logEntry, (err) => {
    if (err) console.error("Failed to write error log:", err);
  });
};

module.exports = { log_notifyError, log_sb_api_error };
