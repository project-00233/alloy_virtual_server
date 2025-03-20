const { supabase } = require("../supabaseClient");

const delete_gsp = async (data_id, request_for, callback) => {
  let options = supabase;

  if (request_for === "gs_user_billing_source" || request_for === "gsubs") {
    options = options
      .from("gs_user_billing_source")
      .delete()
      .eq("id", id);
  }
  if (request_for === "gs_requests" || request_for === "gsr") {
    options = options
      .from("requests")
      .delete()
      .eq("order_ticket", data_id);
  }
  if (request_for === "gs_request_messaging" || request_for === "gsrm") {
    options = options
      .from("request_messaging")
      .delete()
      .eq("order_ticket", data_id);
  }
  if (request_for === "gs_rate_n_review" || request_for === "gsrnr") {
    options = options
      .from("rate_n_review")
      .delete()
      .eq("id", data_id);
  }

  const { error } = await options.select("*").single();

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, "success");
};

const delete_admin = async (data_id, request_for, callback) => {
  let options = supabase;

  if (request_for === "gs_user" || request_for === "gsu") {
    options = options
      .from("gs_user")
      .delete()
      .eq("id", data_id);
  }

  if (request_for === "services" || request_for === "sv") {
    options = options
      .from("services")
      .delete()
      .eq("id", data_id);
  }

  if (request_for === "service_providers" || request_for === "sp") {
    options = options
      .from("service_providers")
      .delete()
      .eq("id", data_id);
  }
  if (request_for === "request_charges" || request_for === "rc") {
    options = options
      .from("request_charges")
      .delete()
      .eq("id", data_id);
  }
  if (request_for === "requests" || request_for === "rq") {
    options = options
      .from("requests")
      .delete()
      .eq("id", data_id);
  }
  if (request_for === "request_messaging" || request_for === "rm") {
    options = options
      .from("request_messaging")
      .delete()
      .eq("order_ticket", data_id);
  }
  if (request_for === "request_invoice" || request_for === "ri") {
    options = options
      .from("request_invoice")
      .delete()
      .eq("id", data_id);
  }

  const { error } = await options.select("*").single();

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, "success");
};

module.exports = { delete_gsp, delete_admin };
