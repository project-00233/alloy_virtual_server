const crypto = require("crypto");
const { adminEmailList } = require("../tools/constants");
const { sendPermitEmail } = require("./notificationService");

let sessionTokens = {}; // Store session tokens as an object for fast lookups
let sessionExpiry = {}; // Store expiration timestamps for session tokens
let accessKeys = [];
let accessExpiry = {}; // Store expiration timestamps for access keys

// Generate 6-digit random access code
const generateAccessKey = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Remove expired keys
const removeExpiredKeys = () => {
  const now = Date.now();
  accessKeys = accessKeys.filter((key) => {
    if (accessExpiry[key.id] && accessExpiry[key.id] < now) {
      delete accessExpiry[key.id];
      return false;
    }
    return true;
  });
};

// Remove expired session tokens
const removeExpiredSessions = () => {
  const now = Date.now();
  for (const token in sessionExpiry) {
    if (sessionExpiry[token] < now) {
      delete sessionTokens[token];
      delete sessionExpiry[token];
    }
  }
};

setInterval(removeExpiredKeys, 60 * 1000); // Run cleanup every 60 seconds
setInterval(removeExpiredSessions, 60 * 1000); // Run cleanup every 60 seconds

const auth_requestPermission = async (email, callback) => {
  const newKey = generateAccessKey();
  const keyObj = { id: `${Date.now()}`, key: newKey };
  accessKeys.push(keyObj);

  accessExpiry[keyObj.id] = Date.now() + 50 * 1000;

  await sendPermitEmail(
    { subject: "Permission Request", body: { key: newKey } },
    email
  );

  callback(null, { success: "Access code sent to admin's email." });
};

const auth_verifyPermit = async (key_code, callback) => {
  if (!accessKeys.some((key) => key.key === key_code)) {
    return callback({ error: "Invalid access code" }, null);
  }

  const sessionToken = crypto.randomBytes(15).toString("hex");
  sessionTokens[sessionToken] = true; // Store session token as an object for O(1) lookup
  sessionExpiry[sessionToken] = Date.now() + 16 * 60 * 60 * 1000; // 10-minute expiration

  callback(null, { session_token: sessionToken });
};

const auth_checkSession = async (token, callback) => {
  if (sessionTokens[token] && sessionExpiry[token] > Date.now()) {
    return callback(null, { message: "success" });
  } else {
    delete sessionTokens[token];
    delete sessionExpiry[token];
    return callback({ error: "Invalid session token" }, null);
  }
};

module.exports = {
  auth_requestPermission,
  auth_checkSession,
  auth_verifyPermit,
};

// NB
// Using an object (hash map) for faster lookups, instead of an array of tokens
// checking token validity O(1) (constant time) instead of O(n) (linear time)

// --- Permission Access ---
// get key_code
// check_key_code
// if key_code is correct return "success" else return "error"
// if "success" generate 30char long session_token
// add generated_token to array of session_tokens

// --- Check Session Token ---
// get session_token
// check_if token is include in session_tokens array,
// if it exists return msg="success" else "error"
