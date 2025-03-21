require("dotenv").config({ path: "config.env" });

const SERVER_VALIDATION_KEY = process.env.SERVER_VALIDATION_KEY;

// Middleware
const validateApiKey = (req, res, next) => {
  const clientKey = req.headers.authorization.split(" ")[1];

  if (!clientKey || clientKey !== SERVER_VALIDATION_KEY) {
    return res.status(403).json({ error: "Unauthorized: Invalid API key" });
  }

  next();
};

module.exports = { validateApiKey };
