const https = require("https");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: "config.env" });

const paystackSK = process.env.PAYSTACK_SECRET_KEY;
const paystackPK = process.env.PAYSTACK_PUBLIC_KEY;

const { womaye_url } = require("../tools/constants");

const paystackConfig = { secret_key: paystackSK, public_key: paystackPK };

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
