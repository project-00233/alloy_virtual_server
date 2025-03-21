const currency_subunit = 100;
const womaye_url = "http://womaye.com";
// require("dotenv").config({ path: "config.env" });

const adminEmailList = process.env.ADMIN_EMAILS;

module.exports = { currency_subunit, womaye_url, adminEmailList };
