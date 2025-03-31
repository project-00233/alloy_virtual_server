const { format } = require("date-fns");
const {
  sendNotificationToSingleDevice,
  sendAdminEmail,
} = require("../notificationService");
const { supabase } = require("../supabaseClient");
const { fetchGSUserDeviceToken } = require("../api-deviceTokens");
const { log_notifyError } = require("../../tools/helper");

function subscribeToRequest(type) {
  let channel = supabase?.channel("requests");

  if (type === "insert") {
    channel = channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "requests" },
      notifyNewRequest
    );
  }
  if (type === "update") {
    channel = channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "requests" },
      notifyRequestUpdate
    );
  }

  channel.subscribe();
}

function handleUnsubscribeAll(channels) {
  channels.forEach((channel) => {
    if (channel && channel.state === "SUBSCRIBED") {
      supabase.removeChannel(channel).then(() => {
        console.log(`Unsubscribed from womaye channels}`);
      });
    } else {
      console.log(`Channel realtime was not subscribed or already closed`);
    }
  });
}

function notifyNewRequest(payload) {
  log_notifyError(`"Notify logs 1:", ${payload}`);
  const { new: data } = payload;
  const isAttr = data.service_attraction_request?.data ? true : false;
  const res_data = isAttr
    ? data.service_attraction_request.data
    : data.service_inroom_request.data;

  log_notifyError(`"Notify logs 2:", ${isAttr}`);
  log_notifyError(`"Notify logs 3:", ${res_data}`);

  sendAdminEmail({
    subject: "New Request",
    body: {
      service: res_data.serviceName,
      date: res_data.startDate,
    },
  });
}

function notifyRequestUpdate(payload) {
  const { new: data } = payload;
  const isAttr = data.service_attraction_request.data ? true : false;
  const res_data = isAttr
    ? data.service_attraction_request.data
    : data.service_inroom_request.data;
  const isProcessed = data.order_status === "processed";
  const isCancelled = data.order_status === "cancelled";
  const isConsumed = data.order_status === "consumed";
  const gsu_gid = data.gsu_gid;

  let message = "";

  if (isProcessed) {
    message = {
      title: "Your request has been processed",
      body: `You request for ${res_data.serviceName} has been prepared for you.`,
    };
  }
  if (isCancelled) {
    message = {
      title: "A cancelled request",
      body: `You request for ${res_data.serviceName} has been cancelled.`,
    };
  }
  if (isConsumed) {
    message = {
      title: "How was the service?",
      body: `Rate the experience you had for ${res_data.serviceName}`,
    };
  }

  handleNotifyGSP(gsu_gid, message);
}

// Support functions
async function handleNotifyGSP(gsu_id, message) {
  const { body, title, data } = message;
  const token = await fetchGSUserDeviceToken(gsu_id);

  if (!token) {
    return res.status(404).json({ message: "No device token found" });
  }

  // Send Notification
  const respose = await sendNotificationToSingleDevice(
    token,
    title,
    body,
    data
  );
}

module.exports = { subscribeToRequest, handleUnsubscribeAll };
