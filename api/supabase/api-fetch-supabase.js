const { supabase } = require("../supabaseClient");

// **** User ****
const fetch_gsp_single = async (data_id, request_for, callback) => {
  let options = supabase;

  if (request_for === "gs_user_email" || request_for === "gsue") {
    options = options
      .from("gs_user")
      .select("created_at")
      .eq("email", data_id);
  }
  if (request_for === "gs_user" || request_for === "gsu") {
    options = options
      .from("gs_user")
      .select("*")
      .eq("givenUserId", data_id);
  }
  if (request_for === "gs_billing_source" || request_for === "gsbs") {
    options = options
      .from("gs_user_settings")
      .select("*")
      .eq("gsu_id", data_id);
  }
  if (request_for === "gs_request_invoice" || request_for === "gsri") {
    options = options
      .from("request_invoice")
      .select("*")
      .eq("order_ticket", data_id);
  }
  if (request_for === "gs_services" || request_for === "gss") {
    options = options
      .from("services")
      .select("*, service_providers(*)")
      .eq("id", data_id);
  }
  if (request_for === "gs_service_providers" || request_for === "gssp") {
    options = options
      .from("service_providers")
      .select("*")
      .eq("id", data_id);
  }

  const { data, error } = await options.single();
  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, data);
};

const fetch_gsp_multiple_order_by_id = async (
  data_id,
  data_order,
  request_for,
  callback
) => {
  let options = supabase;

  if (request_for === "gs_spo_requests" || request_for === "gssr") {
    options = options
      .from("requests")
      .select("*,services(*), gs_user(name)")
      .eq("spo_id", data_id);
  }
  if (request_for === "gs_requests" || request_for === "gsr") {
    options = options
      .from("requests")
      .select("*, services(*), service_providers(*), gs_user(name)")
      .eq("gsu_gid", data_id);
  }
  if (request_for === "gs_saved_requests" || request_for === "gssdr") {
    options = options
      .from("saved_requests")
      .select("*, services(images,name), service_providers(name)")
      .eq("gsu_gid", data_id);
  }
  if (request_for === "gs_request_messaging" || request_for === "gsrm") {
    options = options
      .from("request_messaging")
      .select("*")
      .eq("order_ticket", data_id);
  }
  if (request_for === "gs_rate_n_review" || request_for === "gsrnr") {
    options = options
      .from("rate_n_review")
      .select("*")
      .eq("service_id", data_id);
  }
  if (request_for === "gs_spo_rate_n_review" || request_for === "gssrnr") {
    options = options
      .from("rate_n_review")
      .select("*")
      .eq("spo_id", data_id);
  }

  const { data, error } = await options.order(
    data_order.column,
    data_order.params
  );

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, data);
};

const fetch_gsp_multiple_by_id = async (data_id, request_for, callback) => {
  let options = supabase;

  if (request_for === "gs_user_billing_source" || request_for === "gsubs") {
    options = options
      .from("gs_user_billing_source")
      .select("*")
      .eq("gsu_gid", data_id)
      .neq("channel", "mobile_money");
  }
  if (request_for === "gs_services_by_type" || request_for === "gsbt") {
    options = options
      .from("services")
      .select("*, service_providers(*)")
      .eq("service_type", data_id);
  }
  if (request_for === "gs_spo_services" || request_for === "gsss") {
    options = options
      .from("services")
      .select("*, service_providers(*)")
      .eq("spo_id", data_id);
  }
  if (request_for === "gs_request_transaction" || request_for === "gsrt") {
    options = options
      .from("gs_request_transaction")
      .select("*, requests(*)")
      .eq("gsu_gid", data_id);
  }

  const { data, error } = await options.order("created_at", {
    ascending: false,
  });

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, data);
};

const fetch_gsp_multiple = async (request_for, callback) => {
  let options = supabase;

  if (request_for === "gs_request_charges" || request_for === "gsrc") {
    options = options.from("request_charges").select("*");
  }
  if (request_for === "gs_services" || request_for === "gss") {
    options = options.from("services").select("*, service_providers(*)");
  }
  if (request_for === "target_properties" || request_for === "tp") {
    options = options.from("target_properties").select("*");
  }

  const { data, error } = await options.order("created_at", {
    ascending: false,
  });

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, data);
};

const fetch_admin_multiple = async (request_for, callback) => {
  let options = supabase;

  if (request_for === "service_providers" || request_for === "sp") {
    options = options
      .from("service_providers")
      .select("*")
      .eq("managed_by", "admin");
  }

  if (request_for === "all_requests" || request_for === "ar") {
    options = options
      .from("requests")
      .select("*, service_providers(name), gs_user(name, email)");
  }

  const { data, error } = await options.order("created_at", {
    ascending: false,
  });

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, data);
};

const fetch_admin_single = async (data_id, request_for, callback) => {
  let options = supabase;

  if (request_for === "service_providers" || request_for === "sp") {
    options = options
      .from("service_providers")
      .select("*")
      .eq("id", data_id);
  }

  const { data, error } = await options.single();

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, data);
};

module.exports = {
  fetch_gsp_single,
  fetch_gsp_multiple_order_by_id,
  fetch_gsp_multiple_by_id,
  fetch_gsp_multiple,
  fetch_admin_multiple,
  fetch_admin_single,
};
