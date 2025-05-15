const messaging = require("./firebaseAdmin");
const { supabase } = require("./supabase/supabaseClient");

/**
 * Fetch device tokens for a given user and send a notification to each.
 *
 * @param {string} given_id - The ID to match device tokens against.
 * @param {object} options - Notification options (title, body, data, etc).
 * @param {function} callback - Function to call with error or success status.
 */
const fetchDeviceTokensAndSendNotification = async (
  given_id,
  options,
  callback
) => {
  try {
    const { data: tokens, error } = await supabase
      .from("device_tokens")
      .select("token")
      .eq("given_id", given_id);

    if (error) {
      console.error("Error fetching device tokens:", error);
      return callback?.("Error fetching device tokens", null);
    }

    if (!tokens || tokens.length === 0) {
      console.warn("No device tokens found for given_id");
      return callback?.("No device tokens found", null);
    }

    // Send notification to each device token
    const results = await Promise.all(
      tokens.map(({ token }) =>
        sendNotificationToSingleDevice(token, options)
          .then((res) => ({ token, success: true, res }))
          .catch((err) => ({ token, success: false, error: err.message }))
      )
    );

    callback?.(null, results);
  } catch (err) {
    console.error("Unexpected error:", err);
    callback?.("Unexpected error occurred", null);
  }
};

/**
 * Send a notification to a single device token.
 *
 * @param {string} token - The device token to send the notification to.
 * @param {object} options - Notification options (title, body, data, etc).
 * @returns {Promise} - Resolves with Firebase response or throws error.
 */
const sendNotificationToSingleDevice = async (token, options) => {
  const message = {
    token,
    ...options,
  };

  try {
    const response = await messaging.send(message);
    console.log("Notification sent");
    return response;
  } catch (err) {
    console.error(`Error sending notification:`, err);
    throw new Error(`Failed to send notification`);
  }
};

module.exports = {
  fetchDeviceTokensAndSendNotification,
};
