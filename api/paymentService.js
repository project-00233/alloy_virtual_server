const https = require("https");
const path = require("path");
const fs = require("fs");
const { womaye_url } = require("../tools/constants");

const paystackConfigPath = path.resolve("./config/paystack-config.json");
const paystackConfig = JSON.parse(fs.readFileSync(paystackConfigPath, "utf-8"));

const intializePayment = (email, amount, callback) => {
  return new Promise((resolve, reject) => {
    const params = JSON.stringify({
      email,
      amount: Math.round(amount * 100),
      callback_url: `${womaye_url}/pay/verify`,
    });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackConfig?.secret_key}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        callback(null, JSON.parse(data)); // Send response back to frontend
      });
    });

    req.on("error", (error) => {
      callback(error, null);
    });

    req.write(params);
    req.end();
  });
};

const verifyPayment = (reference, callback) => {
  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${paystackConfig?.secret_key}`,
    },
  };

  const req = https.request(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      callback(null, JSON.parse(data));
    });
  });

  req.on("error", (error) => {
    callback(error, null);
  });

  req.end();
};

const chargeAuthorization = (email, amount, auth_code, callback) => {
  const params = JSON.stringify({
    email,
    amount: Math.round(amount * 100),
    authorization_code: auth_code,
  });

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: `/transaction/charge_authorization`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackConfig?.secret_key}`,
      "Content-Type": "application/json",
    },
  };

  const req = https.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      callback(null, JSON.parse(data));
    });
  });

  req.on("error", () => {
    callback(error, null);
  });

  req.write(params);
  req.end();
};

module.exports = { intializePayment, verifyPayment, chargeAuthorization };
