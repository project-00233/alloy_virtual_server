const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "config.env" });
const fs = require("fs");
const path = require("path");

const supabaseURL = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseURL, supabaseKey);

module.exports = { supabase, supabaseURL };
