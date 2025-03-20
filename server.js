const express = require("express");
const cors = require("cors");
const app = express();
const rateLimit = require("express-rate-limit");

const { validateApiKey } = require("./tools/middleware");
const { log_paymentError, log_sb_api_error } = require("./tools/helper");

const {
  intializePayment,
  verifyPayment,
  chargeAuthorization,
} = require("./api/paymentService");

const {
  fetch_gsp_single,
  fetch_gsp_multiple_order_by_id,
  fetch_gsp_multiple_by_id,
  fetch_gsp_multiple,
  fetch_admin_single,
  fetch_admin_multiple,
} = require("./api/supabase/api-fetch-supabase");

const { subscribeToRequest } = require("./api/supabase/api-events-supabase");
const {
  insert_admin,
  insert_admin_image_obj,
  insert_gsp,
} = require("./api/supabase/api-insert-supabase");
const {
  update_gsp,
  update_admin,
} = require("./api/supabase/api-update-supabase");
const {
  auth_gsp_for_data,
  auth_gsp_actions_only,
  auth_gsp_session,
} = require("./api/supabase/api-auth-supabase");
const {
  delete_gsp,
  delete_admin,
} = require("./api/supabase/api-delete-supabase");
const { adminEmailList } = require("./tools/constants");
const {
  auth_requestPermission,
  auth_verifyPermit,
  auth_checkSession,
} = require("./api/api_admin_auth");

const limiter = rateLimit({
  windowMS: 15 * 60 * 1000, // 15mins limit
  max: 100, // Limit each IP to 100 requesters per window
  message: "Too many requests from this IP, please try again later",
});

const corsOptions = {
  origin: ["https://womaye.com", "http://localhost:5173"],
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions)); //Enable CORS for all routes
app.use(express.json());
app.use(limiter);

// Serve firebase config
// app.get("/api/firebase-config.json", validateApiKey, (req, res) => {
//   res.sendFile(path.join(__dirname, "/api/firebase-config.json"));
// });

// ------ SUPABASE -------
// OAUTH
app.post("/api/sb/gsp/oauth", validateApiKey, async (req, res) => {
  const { request_by, request_action, data_obj, data_str } = req.body;

  if (!request_action || !request_by) {
    return res.status(404).json({ message: "Missing required fields" });
  }

  if (request_by === "action_only") {
    auth_gsp_actions_only(request_action, (error, result) => {
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
  }

  if (request_by === "for_data") {
    auth_gsp_for_data(data_str, data_obj, request_action, (error, result) => {
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
  }
});

app.post("/api/sb/gsp/oauth/session", validateApiKey, async (req, res) => {
  const { data_token } = req.body;

  if (!data_token) {
    return res.status(404).json({ message: "Missing required fields" });
  }

  auth_gsp_session(data_token, (error, result) => {
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

// Fetchers
app.post("/api/sb/gsp", validateApiKey, async (req, res) => {
  const { request_qty, request_for, data_id, data_order } = req.body;

  if (!request_for) {
    return res.status(404).json({ message: "Missing required fields" });
  }

  if (request_qty === "single") {
    if (!data_id) {
      return res.status(404).json({ message: "Missing required fields" });
    }
    fetch_gsp_single(data_id, request_for, (error, result) => {
      if (error) {
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
  }
  if (request_qty === "multi_obi") {
    if (!data_order || !data_id) {
      return res.status(404).json({ message: "Missing required fields" });
    }

    fetch_gsp_multiple_order_by_id(
      data_id,
      data_order,
      request_for,
      (error, result) => {
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
      }
    );
  }
  if (request_qty === "multi_bi") {
    if (!data_id) {
      return res.status(404).json({ message: "Missing required fields" });
    }

    fetch_gsp_multiple_by_id(data_id, request_for, (error, result) => {
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
  }
  if (request_qty === "multi") {
    fetch_gsp_multiple(request_for, (error, result) => {
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
  }
});

app.post("/api/sb/admin", validateApiKey, async (req, res) => {
  const { request_qty, request_for, data_id, data_order } = req.body;

  if (!request_for) {
    return res.status(404).json({ message: "Missing required fields" });
  }

  if (request_qty === "single") {
    if (!data_id) {
      return res.status(404).json({ message: "Missing required fields" });
    }
    fetch_admin_single(data_id, request_for, (error, result) => {
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
  }

  if (request_qty === "multi") {
    fetch_admin_multiple(request_for, (error, result) => {
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
  }
});

// ---Inserts----
app.post("/api/sb/gsp/add", validateApiKey, async (req, res) => {
  const { request_by, request_for, data_obj } = req.body;

  if (!request_for || !data_obj) {
    return res.status(404).json({ message: "Missing required fields" });
  }

  if (request_by === "obj") {
    insert_gsp(data_obj, request_for, (error, result) => {
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
  }
});

app.post("/api/sb/admin/add", validateApiKey, async (req, res) => {
  const { request_by, request_for, data_obj } = req.body;

  if (!request_for || !data_obj) {
    return res.status(404).json({ message: "Missing required fields" });
  }

  if (request_by === "obj") {
    insert_admin(data_obj, request_for, (error, result) => {
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
  }

  if (request_by === "image_obj") {
    insert_admin_image_obj(data_obj, request_for, (error, result) => {
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
  }
});

// ---Updates ---
app.post("/api/sb/gsp/change", validateApiKey, async (req, res) => {
  const { request_by, request_for, data_obj, data_id } = req.body;

  if (!request_for || !data_obj || !data_id) {
    return res.status(404).json({ message: "Missing required fields" });
  }

  update_gsp(data_obj, request_for, (error, result) => {
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

app.post("/api/sb/admin/change", validateApiKey, async (req, res) => {
  const { request_by, request_for, data_obj, data_id } = req.body;

  if (!request_for || !data_obj || !data_id) {
    return res.status(404).json({ message: "Missing required fields" });
  }

  update_admin(data_id, data_obj, request_for, (error, result) => {
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

// ---Deletes---
app.post("/api/sb/gsp/remove", validateApiKey, async (req, res) => {
  const { request_for, data_id } = req.body;

  if (!request_for || !data_id) {
    return res.status(404).json({ message: "Missing required fields" });
  }

  delete_gsp(data_id, request_for, (error, result) => {
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
app.post("/api/sb/admin/remove", validateApiKey, async (req, res) => {
  const { request_for, data_id } = req.body;

  if (!request_for || !data_id) {
    return res.status(404).json({ message: "Missing required fields" });
  }

  delete_admin(data_id, request_for, (error, result) => {
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

// Paystack
app.post("/pay/womaye-gsp/init", validateApiKey, async (req, res) => {
  const { email, amount } = req.body;

  if (!email || !amount) {
    log_paymentError(
      `Payment missing required field - Response for: ${JSON.stringify({
        email,
        amount,
      })}`
    );
    return res.status(400).json({ error: "Missing required fields" });
  }

  intializePayment(email, amount, (pay_error, pay_response) => {
    if (pay_error) {
      log_paymentError(
        `Payment initialization failed - Response: ${JSON.stringify(pay_error)}`
      );

      return res.status(500).json({
        success: false,
        error: "Payment initialization failed",
      });
    }

    return res.json({
      success: true,
      message: "Payment has been initialized",
      data: pay_response,
    });
  });
});

app.post("/pay/womaye-gsp/charge_auth", validateApiKey, async (req, res) => {
  const { email, amount, auth_code } = req.body;

  if (!email || !amount || !auth_code) {
    log_paymentError(
      `Payment missing required field - Response for: ${JSON.stringify({
        email,
        amount,
        auth_code,
      })}`
    );
    return res.status(400).json({ error: "Missing required fields" });
  }

  chargeAuthorization(email, amount, auth_code, (pay_error, pay_response) => {
    if (pay_error) {
      log_paymentError(
        `Payment authorization failed - Response: ${JSON.stringify(pay_error)}`
      );

      return res.status(500).json({
        success: false,
        error: "Payment Authorization failed",
        data: pay_error,
      });
    }

    return res.json({
      success: true,
      message: "Payment has been initialized",
      data: pay_response,
    });
  });
});

app.get("/pay/womaye-gsp/verify/:reference", (req, res) => {
  const { reference } = req.params;

  verifyPayment(reference, (err, result) => {
    if (err) {
      log_paymentError(
        `Payment verification failed for reference: ${reference} - Response: ${JSON.stringify(
          err
        )}`
      );
      return res
        .status(500)
        .json({ error: "Payment verification failed", message: err });
    }

    if (result.status && result.data.status === "success") {
      return res.json({
        success: true,
        message: "Payment verified",
        data: result.data,
      });
    }
  });
});

// --- Admin ---
app.post(
  "/api/admin/oauth/request-permission",
  validateApiKey,
  async (req, res) => {
    const { permission_from } = req.body;

    if (!adminEmailList.includes(permission_from)) {
      return res.status(400).json({ error: "Invalid admin" });
    }

    auth_requestPermission(permission_from, (error, result) => {
      if (error) {
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
  }
);

app.post("/api/admin/oauth/verify-access", validateApiKey, async (req, res) => {
  const { key_code } = req.body;

  auth_verifyPermit(key_code, (error, result) => {
    if (error) {
      res.status(500).json({
        message: "Failed operation",
        error: typeof error === "object" ? JSON.stringify(error) : error,
      });
    } else {
      res.status(200).json({
        message: "Successful operation",
        data: result,
      });
    }
  });
});

app.post("/api/admin/oauth/check-session", validateApiKey, async (req, res) => {
  const { session_token } = req.body;

  auth_checkSession(session_token, (error, result) => {
    if (error) {
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

// Function Execution
subscribeToRequest("insert");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
