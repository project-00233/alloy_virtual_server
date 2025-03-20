const { supabase } = require("../supabaseClient");

const auth_gsp_actions_only = async (request_action, callback) => {
  let options = supabase.auth;

  if (request_action === "gs_logout" || request_action === "gsout") {
    options = options.signOut();
  }

  const { error } = await options;

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, "success");
};

const auth_gsp_for_data = async (
  data_str,
  data_obj,
  request_action,
  callback
) => {
  let options = supabase.auth;

  if (request_action === "verify_otp" || request_action === "votp") {
    options = options.verifyOtp({ ...data_obj });
  }
  if (request_action === "sign_up" || request_action === "su") {
    options = options.signUp({ ...data_obj });
  }
  if (request_action === "update_password" || request_action === "up") {
    options = options.updateUser({ ...data_obj });
  }
  if (request_action === "set_session" || request_action === "ss") {
    options = options.setSession({ ...data_obj });
  }
  if (request_action === "reset_password" || request_action === "rp") {
    options = options.resetPasswordForEmail(data_str);
  }
  if (request_action === "sign_in_with_password" || request_action === "siwp") {
    options = options.signInWithPassword({ ...data_obj });
  }
  if (request_action === "sign_in_with_oauth" || request_action === "siwo") {
    options = options.signInWithOAuth({ ...data_obj });
  }
  if (
    request_action === "reset_password_for_email" ||
    request_action === "rpfe"
  ) {
    options = options.resetPasswordForEmail(data_str, { ...data_obj });
  }

  const { data, error } = await options;

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, data);
};

const auth_gsp_session = async (data_token, callback) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(data_token);

  if (error) {
    return callback(JSON.stringify(error), null);
  }

  callback(null, user);
};

const auth_gsp_sessionListener = async (callback) => {};

module.exports = {
  auth_gsp_actions_only,
  auth_gsp_for_data,
  auth_gsp_session,
};
