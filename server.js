const express = require("express");
const cors = require("cors");
const app = express();
const rateLimit = require("express-rate-limit");
const schedule = require("node-schedule");

const { validateApiKey } = require("./tools/middleware");
const { log_notifyError, log_sb_api_error } = require("./tools/helper");
const { sendNotificationToSingleDevice } = require("./api/notificationService");
const {
  fetchSupabase,
  fetchUser,
  insertSupabase,
  updateSupabase,
  deleteSupabase,
} = require("./api/supabase/supabaseService");

const limiter = rateLimit({
  windowMS: 15 * 60 * 1000, // 15mins limit
  max: 100, // Limit each IP to 100 requesters per window
  message: "Too many requests from this IP, please try again later",
});

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://alloy-virtual-assistant.netlify.app",
  ],
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions)); //Enable CORS for all routes
app.use(express.json());
app.use(limiter);

// ---Updates ---
app.post("/api/get/user", validateApiKey, async (req, res) => {
  const { given_id } = req.body;

  if (!given_id) {
    log_sb_api_error("Missing required fields");
    return res.status(404).json({ message: "Missing required fields" });
  }

  fetchUser(given_id, (error, result) => {
    if (error) {
      log_sb_api_error(error);
      res.status(500).json({
        message: "Request failed",
        error: typeof error === "object" ? JSON.stringify(error) : error,
      });
    } else {
      res.status(200).json({
        message: "Request success",
        data: result,
      });
    }
  });
});

app.post("/api/get/alloy", validateApiKey, async (req, res) => {
  const { given_id, request_for } = req.body;

  if (!given_id || !request_for) {
    log_sb_api_error("Missing required fields");
    return res.status(404).json({ message: "Missing required fields" });
  }

  fetchSupabase(request_for, given_id, (error, result) => {
    if (error) {
      log_sb_api_error(error);
      res.status(500).json({
        message: "Request failed",
        error: typeof error === "object" ? JSON.stringify(error) : error,
      });
    } else {
      res.status(200).json({
        message: "Request success",
        data: result,
      });
    }
  });
});

app.post("/api/add/alloy", validateApiKey, async (req, res) => {
  const { client_data, request_for } = req.body;

  if (!client_data || !request_for) {
    log_sb_api_error("Missing required fields");
    return res.status(404).json({ message: "Missing required fields" });
  }

  insertSupabase(request_for, client_data, (error, result) => {
    if (error) {
      log_sb_api_error(error);
      res.status(500).json({
        message: "Request failed",
        error: typeof error === "object" ? JSON.stringify(error) : error,
      });
    } else {
      res.status(200).json({
        message: "Request success",
        data: result,
      });
    }
  });
});

app.post("/api/change/alloy", validateApiKey, async (req, res) => {
  const { client_data, request_for, data_id } = req.body;

  if (!client_data || !request_for || !data_id) {
    log_sb_api_error("Missing required fields");
    return res.status(404).json({ message: "Missing required fields" });
  }

  updateSupabase(request_for, data_id, client_data, (error, result) => {
    if (error) {
      log_sb_api_error(error);
      res.status(500).json({
        message: "Request failed",
        error: typeof error === "object" ? JSON.stringify(error) : error,
      });
    } else {
      res.status(200).json({
        message: "Request success",
        data: result,
      });
    }
  });
});

app.post("/api/delete/alloy", validateApiKey, async (req, res) => {
  const { request_for, data_id } = req.body;

  if (!request_for || !data_id) {
    log_sb_api_error("Missing required fields");
    return res.status(404).json({ message: "Missing required fields" });
  }

  deleteSupabase(request_for, data_id, (error, result) => {
    if (error) {
      log_sb_api_error(error);
      res.status(500).json({
        message: "Request failed",
        error: typeof error === "object" ? JSON.stringify(error) : error,
      });
    } else {
      res.status(200).json({
        message: "Request success",
        data: result,
      });
    }
  });
});

// In-memory store of jobs
const scheduledJobs = {};

app.post("/api/schedule-notifications", validateApiKey, (req, res) => {
  const { token, list_of_actions, link, icon } = req.body;

  if (!token || !Array.isArray(list_of_actions)) {
    log_notifyError(
      `Notification request data missing - Invalid input format )}`
    );

    return res.status(400).json({ error: "Invalid input format" });
  }

  list_of_actions.forEach((action, index) => {
    const { exeTime, title, body } = action;

    if (!exeTime || !title || !body) return;

    // Convert exeTime to hours and minutes
    const [hourStr, minuteStr] = exeTime.split(":");
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);

    // Schedule job for today
    const now = new Date();
    const scheduledTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute,
      0
    );

    if (scheduledTime < now) {
      log_notifyError(`Skipping ${title}: time already passed.`);
      return;
    }

    const job = schedule.scheduleJob(scheduledTime, () => {
      let options = {
        notification: { title, body },
        webpush: {
          notification: {
            icon,
            click_action: link,
          },
        },
      };

      sendNotificationToSingleDevice(token, options, (err, response) => {
        if (err) {
          log_notifyError(`Failed to send "${title}":`, err);
        } else {
          console.log(`Notification sent: "${title}"`, response);
        }
      });
    });

    // Optionally store job by some unique key for tracking
    scheduledJobs[`${token}-${index}`] = job;
  });

  res.json({ success: true, message: "Notifications scheduled." });
});

app.post("/api/notify", validateApiKey, async (req, res) => {
  const { token, options } = req.body;

  if (!token || !options) {
    log_notifyError(
      `Notification request data missing - Response for: ${JSON.stringify({
        token,
        options,
      })}`
    );
    return res.status(400).json({ error: "Missing required fields" });
  }

  sendNotificationToSingleDevice(
    token,
    options,
    (notify_error, notify_response) => {
      if (notify_error) {
        return res.status(500).json({
          success: false,
          error: "Notification error",
          data: notify_error,
        });
      }

      return res.json({
        success: true,
        message: "Notification success",
        data: notify_response,
      });
    }
  );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
